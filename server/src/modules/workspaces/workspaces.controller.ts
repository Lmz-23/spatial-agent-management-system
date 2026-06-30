import type { WorkspacesService } from './workspaces.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';

export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const workspaces = await this.service.getAll();
    return reply.send({ data: workspaces });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    try {
      const workspace = await this.service.getById(id);
      return reply.send({ data: workspace });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Workspace not found';
      return reply.status(404).send({ error: message });
    }
  }

  async create(
    request: FastifyRequest<{ Body: CreateWorkspaceDto }>,
    reply: FastifyReply,
  ) {
    try {
      const workspace = await this.service.create(request.body);
      return reply.status(201).send({ data: workspace });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation error';
      return reply.status(400).send({ error: message });
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateWorkspaceDto }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    try {
      const workspace = await this.service.update(id, request.body);
      return reply.send({ data: workspace });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Workspace not found';
      return reply.status(404).send({ error: message });
    }
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    try {
      await this.service.remove(id);
      return reply.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Workspace not found';
      return reply.status(404).send({ error: message });
    }
  }
}
