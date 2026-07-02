import type { PrismaClient, AgentStatus } from '@prisma/client';
import type { AgentsRepository, AgentWithRelations } from './agents.repository.js';
import type { CreateAgentDto, UpdateAgentDto, UpdatePositionDto, UpdateStatusDto } from './dto/create-agent.dto.js';
import type { AgentResponseDto } from './dto/agent-response.dto.js';
import type { WebSocketService } from '../websocket/websocket.service.js';
import type { FastifyBaseLogger } from 'fastify';
import { NotFoundError, ValidationError } from '../../utils/errors/app.error.js';

const VALID_STATUSES = ['IDLE', 'WALKING', 'WORKING'] as const;
type ValidStatus = typeof VALID_STATUSES[number];

export class AgentsService {
  constructor(
    private readonly repository: AgentsRepository,
    private readonly prisma: PrismaClient,
    private readonly wsService: WebSocketService,
    private readonly log: FastifyBaseLogger,
  ) {}

  async getAll(): Promise<AgentResponseDto[]> {
    const agents = await this.repository.findAll();
    return agents.map((agent) => this.toResponseDto(agent));
  }

  async getById(id: string): Promise<AgentResponseDto> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new NotFoundError('Agent');
    }
    return this.toResponseDto(agent);
  }

  async getByWorkspace(workspaceId: string): Promise<AgentResponseDto[]> {
    const agents = await this.repository.findAllByWorkspace(workspaceId);
    return agents.map((agent) => this.toResponseDto(agent));
  }

  async create(data: CreateAgentDto): Promise<AgentResponseDto> {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Name is required');
    }

    const workspace = await this.prisma.workspace.findUnique({ where: { id: data.workspaceId } });
    if (!workspace) {
      throw new NotFoundError('Workspace');
    }

    const newAgent = await this.repository.create({
      ...data,
      color: data.color ?? '#CCCCCC',
    });

    try {
      this.wsService.broadcastToWorkspace(data.workspaceId, 'agent:created', {
        agent: newAgent,
        workspaceId: data.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit agent:created event');
    }

    return this.toResponseDto(newAgent);
  }

  async update(id: string, data: UpdateAgentDto): Promise<AgentResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Agent');
    }

    const agent = await this.repository.update(id, data);
    if (!agent) {
      throw new NotFoundError('Agent');
    }
    return this.toResponseDto(agent);
  }

  async remove(id: string): Promise<void> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new NotFoundError('Agent');
    }

    try {
      this.wsService.broadcastToWorkspace(agent.workspaceId, 'agent:deleted', {
        agentId: id,
        workspaceId: agent.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit agent:deleted event');
    }

    await this.repository.delete(id);
  }

  async updatePosition(id: string, data: UpdatePositionDto): Promise<AgentResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Agent');
    }

    const agent = await this.repository.updatePosition(id, data.positionX, data.positionY);
    if (!agent) {
      throw new NotFoundError('Agent');
    }

    try {
      this.wsService.broadcastToWorkspace(agent.workspaceId, 'agent:position:update', {
        agentId: id,
        positionX: data.positionX,
        positionY: data.positionY,
        workspaceId: agent.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit agent:position:update event');
    }

    return this.toResponseDto(agent);
  }

  async updateStatus(id: string, data: UpdateStatusDto): Promise<AgentResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Agent');
    }

    const upperStatus = data.status.toUpperCase() as ValidStatus;
    if (!this.isValidStatus(upperStatus)) {
      throw new ValidationError(`Invalid status. Valid values are: ${VALID_STATUSES.join(', ')}`);
    }

    const agent = await this.repository.updateStatus(id, upperStatus);
    if (!agent) {
      throw new NotFoundError('Agent');
    }

    try {
      this.wsService.broadcastToWorkspace(agent.workspaceId, 'agent:status:update', {
        agentId: id,
        status: upperStatus,
        workspaceId: agent.workspaceId,
      });
    } catch (error) {
      this.log.error({ err: error }, 'Failed to emit agent:status:update event');
    }

    return this.toResponseDto(agent);
  }

  private isValidStatus(status: string): status is ValidStatus {
    return VALID_STATUSES.includes(status as ValidStatus);
  }

  private toResponseDto(agent: AgentWithRelations): AgentResponseDto {
    return {
      id: agent.id,
      name: agent.name,
      color: agent.color ?? '#CCCCCC',
      status: agent.status as AgentStatus,
      positionX: agent.positionX,
      positionY: agent.positionY,
      workspaceId: agent.workspaceId,
      currentTaskId: agent.currentTaskId,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      workspace: agent.workspace,
      currentTask: agent.currentTask ?? undefined,
    };
  }
}
