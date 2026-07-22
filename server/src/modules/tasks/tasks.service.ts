import { TaskEventType, TaskStatus } from '@prisma/client';
import type { PrismaClient, Agent, Workspace } from '@prisma/client';
import type { CreateTaskEventDto } from '../../schemas/task.schema.js';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { TaskEventResponseDto } from './dto/task-event-response.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';
import type { TaskResponseDto } from './dto/task-response.dto.js';
import type { TaskEventWithRelations, TaskWithRelations } from './tasks.repository.js';
import { TasksRepository } from './tasks.repository.js';
import { WebSocketService } from '../websocket/websocket.service.js';
import type { FastifyBaseLogger } from 'fastify';
import { NotFoundError, ValidationError } from '../../utils/errors/app.error.js';

const VALID_STATUSES = ['BACKLOG', 'PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'NEEDS_REVISION', 'BLOCKED', 'DONE', 'CANCELLED'] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

// Estados donde la task está "muerta" — no se aceptan nuevas transiciones activas.
// (Aplicado específicamente a RETURNED_FOR_REVISION; otros eventos mantienen su semántica.)
const TERMINAL_STATUSES = ['BLOCKED', 'DONE', 'CANCELLED'] as const;
type TerminalStatus = (typeof TERMINAL_STATUSES)[number];

export class TasksService {
  constructor(
    private readonly repository: TasksRepository,
    private readonly prisma: PrismaClient,
    private readonly wsService: WebSocketService,
    private readonly log: FastifyBaseLogger,
  ) {}

  async getAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.repository.findAll();
    return tasks.map((t) => this.toResponseDto(t));
  }

  async getById(id: string): Promise<TaskResponseDto | null> {
    const task = await this.repository.findById(id);
    return task ? this.toResponseDto(task) : null;
  }

  async getByWorkspace(workspaceId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.repository.findAllByWorkspace(workspaceId);
    return tasks.map((t) => this.toResponseDto(t));
  }

  async create(data: CreateTaskDto): Promise<TaskResponseDto> {
    // Validate title is required
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }

    // Validate status if provided
    if (data.status && !this.isValidStatus(data.status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    // Validate workspace exists
    await this.validateWorkspaceExists(data.workspaceId);

    const task = await this.repository.create(data);

    // Emit WebSocket event
    try {
      await this.wsService.broadcastToWorkspace(task.workspaceId, 'task:created', {
        task,
        workspaceId: task.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit task:created event');
    }

    return this.toResponseDto(task);
  }

  async update(id: string, data: UpdateTaskDto): Promise<TaskResponseDto | null> {
    // Validate status if provided
    if (data.status && !this.isValidStatus(data.status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    // Check task exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }

    const task = await this.repository.update(id, data);

    // Emit WebSocket event if status changed
    if (task && data.status) {
      try {
        await this.wsService.broadcastToWorkspace(task.workspaceId, 'task:status:update', {
          taskId: id,
          status: data.status,
          workspaceId: task.workspaceId,
        });
      } catch (error) {
        this.log.error({ err: error }, 'Failed to emit task:status:update event');
      }
    }

    return task ? this.toResponseDto(task) : null;
  }

  async remove(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Emit WebSocket event before deletion
    try {
      await this.wsService.broadcastToWorkspace(existing.workspaceId, 'task:deleted', {
        taskId: id,
        workspaceId: existing.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit task:deleted event');
    }

    return this.repository.delete(id);
  }

  async createEvent(taskId: string, data: CreateTaskEventDto): Promise<TaskEventResponseDto> {
    const task = await this.repository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }

    const fromStatus = task.status;
    let toStatus = data.toStatus;
    let incrementAttemptCount = false;

    switch (data.eventType) {
      case TaskEventType.STARTED:
        toStatus ??= TaskStatus.IN_PROGRESS;
        break;
      case TaskEventType.COMPLETED:
        toStatus ??= TaskStatus.DONE;
        break;
      case TaskEventType.FAILED:
        break;
      case TaskEventType.RETURNED_FOR_REVISION: {
        if (!data.returnedToAgentId) {
          throw new ValidationError(
            'returnedToAgentId required for RETURNED_FOR_REVISION',
          );
        }

        // No permitir RETURNED_FOR_REVISION sobre tasks en estado terminal.
        // Mover una task DONE/CANCELLED/BLOCKED de vuelta a NEEDS_REVISION es incoherente
        // (transición fromStatus: BLOCKED -> toStatus: NEEDS_REVISION) y sacaría a la task
        // de un estado terminal para meterla en uno activo.
        if (TERMINAL_STATUSES.includes(fromStatus as TerminalStatus)) {
          throw new ValidationError(
            `Cannot ${TaskEventType.RETURNED_FOR_REVISION} a task in terminal status (${fromStatus})`,
          );
        }

        incrementAttemptCount = true;
        const nextAttemptCount = task.attemptCount + 1;
        if (nextAttemptCount >= task.maxAttempts) {
          toStatus = TaskStatus.BLOCKED;
          this.log.warn(
            {
              taskId,
              attemptCount: nextAttemptCount,
              maxAttempts: task.maxAttempts,
            },
            'Task blocked after reaching maximum revision attempts',
          );
        } else {
          toStatus = TaskStatus.NEEDS_REVISION;
        }
        break;
      }
      case TaskEventType.BLOCKED:
        toStatus ??= TaskStatus.BLOCKED;
        break;
      case TaskEventType.ESCALATED:
        toStatus ??= TaskStatus.IN_REVIEW;
        break;
    }

    const taskUpdate: {
      status?: TaskStatus;
      attemptCount?: { increment: number };
    } = {};
    if (toStatus !== undefined) {
      taskUpdate.status = toStatus;
    }
    if (incrementAttemptCount) {
      taskUpdate.attemptCount = { increment: 1 };
    }

    const { event, task: updatedTask } = await this.repository.createEventAndUpdateTask({
      taskId,
      event: {
        taskId,
        agentId: data.agentId,
        eventType: data.eventType,
        fromStatus,
        toStatus: toStatus ?? null,
        notes: data.notes ?? null,
        returnedToAgentId: data.returnedToAgentId ?? null,
      },
      taskUpdate,
      selectRelations: { agent: true, returnedToAgent: true },
    });

    try {
      await this.wsService.broadcastToWorkspace(updatedTask.workspaceId, 'task:event', {
        event,
        task: updatedTask,
      });
    } catch (error) {
      this.log.error({ err: error, taskId }, 'Failed to emit task:event event');
    }

    return this.toEventResponseDto(event);
  }

  async assignToAgent(taskId: string, agentId: string): Promise<TaskResponseDto | null> {
    // Step 1: Verify task exists
    const task = await this.repository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task');
    }

    // Step 2: Verify agent exists
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundError('Agent');
    }

    // Step 3: Update task with assignedAgentId and status = IN_PROGRESS
    // Step 4: Update agent: status = WORKING, currentTaskId = taskId
    const result = await this.repository.assignToAgent(taskId, agentId);
    if (!result) {
      return null;
    }

    // Emit WebSocket events
    try {
      await this.wsService.broadcastToWorkspace(result.task.workspaceId, 'task:status:update', {
        taskId,
        status: result.task.status,
        assignedAgentId: agentId,
        workspaceId: result.task.workspaceId,
      });

      await this.wsService.broadcastToWorkspace(agent.workspaceId, 'agent:status:update', {
        agentId: agentId,
        status: 'WORKING',
        workspaceId: agent.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit WebSocket events in assignToAgent');
    }

    return this.toResponseDto(result.task);
  }

  private isValidStatus(status: string): status is ValidStatus {
    return VALID_STATUSES.includes(status as ValidStatus);
  }

  private async validateWorkspaceExists(workspaceId: string): Promise<Workspace> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }
    return workspace;
  }

  private toEventResponseDto(event: TaskEventWithRelations): TaskEventResponseDto {
    return {
      id: event.id,
      taskId: event.taskId,
      agentId: event.agentId,
      eventType: event.eventType,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      notes: event.notes,
      returnedToAgentId: event.returnedToAgentId,
      timestamp: event.timestamp,
    };
  }

  private toResponseDto(task: TaskWithRelations): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assignedAgentId: task.assignedAgentId,
      workspaceId: task.workspaceId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      assignedAgent: task.assignedAgent
        ? {
            id: task.assignedAgent.id,
            name: task.assignedAgent.name,
            status: task.assignedAgent.status,
          }
        : undefined,
      workspace: task.workspace
        ? {
            id: task.workspace.id,
            name: task.workspace.name,
          }
        : undefined,
    };
  }
}
