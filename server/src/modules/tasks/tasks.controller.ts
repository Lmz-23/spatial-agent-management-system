import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

export class TasksController {
  constructor(private readonly service: TasksService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const tasks = await this.service.getAll();
    return reply.send({ data: tasks });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const task = await this.service.getById(id);
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    return reply.send({ data: task });
  }

  async getByWorkspace(
    request: FastifyRequest<{ Params: { workspaceId: string } }>,
    reply: FastifyReply,
  ) {
    const { workspaceId } = request.params;
    const tasks = await this.service.getByWorkspace(workspaceId);
    return reply.send({ data: tasks });
  }

  async create(
    request: FastifyRequest<{ Body: CreateTaskDto }>,
    reply: FastifyReply,
  ) {
    try {
      const task = await this.service.create(request.body);
      return reply.status(201).send({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation error';
      return reply.status(400).send({ error: message });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskDto }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    try {
      const task = await this.service.update(id, request.body);
      if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
      }
      return reply.send({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation error';
      return reply.status(400).send({ error: message });
    }
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const deleted = await this.service.remove(id);
    if (!deleted) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    return reply.status(204).send();
  }

  async assignToAgent(
    request: FastifyRequest<{ Params: { id: string; agentId: string } }>,
    reply: FastifyReply,
  ) {
    const { id, agentId } = request.params;
    try {
      const task = await this.service.assignToAgent(id, agentId);
      if (!task) {
        return reply.status(404).send({ error: 'Task or Agent not found' });
      }
      return reply.send({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assignment failed';
      return reply.status(400).send({ error: message });
    }
  }
}
