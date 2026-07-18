import type { FastifyInstance } from 'fastify';
import { AgentsController } from './agents.controller.js';
import { AgentsService } from './agents.service.js';
import { AgentsRepository } from './agents.repository.js';
import { authHook } from '../../plugins/auth.plugin.js';
import { createAgentSchema, updateAgentSchema, agentIdParamSchema, updateAgentStatusSchema, updateAgentPositionSchema, agentWithWorkspaceIdParamSchema } from '../../schemas/agent.schema.js';
import { validateBody, validateParams } from '../../utils/validate.js';
import { requirePrisma } from '../../utils/prisma.js';

export interface AgentsModuleOptions {
  prefix?: string;
}

export async function agentsModule(
  fastify: FastifyInstance,
  options: AgentsModuleOptions,
): Promise<void> {
  const prisma = requirePrisma(fastify.prisma);
  const repository = new AgentsRepository(prisma);
  const service = new AgentsService(repository, prisma, fastify.wsService, fastify.log);
  const controller = new AgentsController(service);

  // Routes are mounted at /api/agents (see app.ts)
  // Using type assertion for onRequest hook to bypass TypeScript generics issue with hooks
  fastify.get('/', { onRequest: [authHook as never] }, (req, reply) => controller.getAll(req as never, reply));
  fastify.get('/:id', { onRequest: [authHook as never, validateParams(agentIdParamSchema) as never] }, (req, reply) => controller.getById(req as never, reply));
  fastify.get('/workspace/:workspaceId', { onRequest: [authHook as never, validateParams(agentWithWorkspaceIdParamSchema) as never] }, (req, reply) => controller.getByWorkspace(req as never, reply));
  fastify.post('/', { onRequest: [authHook as never], preValidation: [validateBody(createAgentSchema) as never] }, (req, reply) => controller.create(req as never, reply));
  fastify.patch('/:id', { onRequest: [authHook as never], preValidation: [validateParams(agentIdParamSchema) as never, validateBody(updateAgentSchema) as never] }, (req, reply) => controller.update(req as never, reply));
  fastify.patch('/:id/status', { onRequest: [authHook as never], preValidation: [validateParams(agentIdParamSchema) as never, validateBody(updateAgentStatusSchema) as never] }, (req, reply) => controller.updateStatus(req as never, reply));
  fastify.patch('/:id/position', { onRequest: [authHook as never], preValidation: [validateParams(agentIdParamSchema) as never, validateBody(updateAgentPositionSchema) as never] }, (req, reply) => controller.updatePosition(req as never, reply));
  fastify.delete('/:id', { onRequest: [authHook as never, validateParams(agentIdParamSchema) as never] }, (req, reply) => controller.remove(req as never, reply));
}

export default agentsModule;
