import type { AgentsService } from './agents.service.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { CreateAgentDto, UpdateAgentDto, UpdatePositionDto, UpdateStatusDto } from './dto/create-agent.dto.js';

export class AgentsController {
  constructor(private readonly service: AgentsService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const agents = await this.service.getAll();
    return reply.send({ data: agents });
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const agent = await this.service.getById(request.params.id);
      return reply.send({ data: agent });
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      throw error;
    }
  }

  async getByWorkspace(request: FastifyRequest<{ Params: { workspaceId: string } }>, reply: FastifyReply) {
    const agents = await this.service.getByWorkspace(request.params.workspaceId);
    return reply.send({ data: agents });
  }

  async create(request: FastifyRequest<{ Body: CreateAgentDto }>, reply: FastifyReply) {
    try {
      const agent = await this.service.create(request.body);
      return reply.status(201).send({ data: agent });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      if (err.statusCode === 400) {
        return reply.status(400).send({ error: err.message });
      }
      throw error;
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: UpdateAgentDto }>, reply: FastifyReply) {
    try {
      const agent = await this.service.update(request.params.id, request.body);
      return reply.send({ data: agent });
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      throw error;
    }
  }

  async updateStatus(request: FastifyRequest<{ Params: { id: string }; Body: UpdateStatusDto }>, reply: FastifyReply) {
    try {
      const agent = await this.service.updateStatus(request.params.id, request.body);
      return reply.send({ data: agent });
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      if (err.statusCode === 404) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      if (err.statusCode === 400) {
        return reply.status(400).send({ error: err.message });
      }
      throw error;
    }
  }

  async updatePosition(request: FastifyRequest<{ Params: { id: string }; Body: UpdatePositionDto }>, reply: FastifyReply) {
    try {
      const agent = await this.service.updatePosition(request.params.id, request.body);
      return reply.send({ data: agent });
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      throw error;
    }
  }

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await this.service.remove(request.params.id);
      return reply.status(204).send();
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return reply.status(404).send({ error: 'Agent not found' });
      }
      throw error;
    }
  }
}
