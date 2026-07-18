import type { FastifyInstance } from 'fastify';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';
import { WorkspacesRepository } from './workspaces.repository.js';
import { authHook } from '../../plugins/auth.plugin.js';
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdParamSchema } from '../../schemas/workspace.schema.js';
import { validateBody, validateParams } from '../../utils/validate.js';
import { requirePrisma } from '../../utils/prisma.js';

export interface WorkspacesModuleOptions {
  prefix?: string;
}

export async function workspacesModule(
  fastify: FastifyInstance,
  options: WorkspacesModuleOptions,
): Promise<void> {
  const prisma = requirePrisma(fastify.prisma);
  const repository = new WorkspacesRepository(prisma);
  const service = new WorkspacesService(repository);
  const controller = new WorkspacesController(service);

  // Using type assertion for onRequest hook to bypass TypeScript generics issue with hooks
  fastify.get('/', { onRequest: [authHook as never] }, (req, reply) => controller.getAll(req as never, reply));
  fastify.get('/:id', { onRequest: [authHook as never, validateParams(workspaceIdParamSchema) as never] }, (req, reply) => controller.getById(req as never, reply));
  fastify.post('/', { onRequest: [authHook as never], preValidation: [validateBody(createWorkspaceSchema) as never] }, (req, reply) => controller.create(req as never, reply));
  fastify.patch('/:id', { onRequest: [authHook as never], preValidation: [validateParams(workspaceIdParamSchema) as never, validateBody(updateWorkspaceSchema) as never] }, (req, reply) => controller.update(req as never, reply));
  fastify.delete('/:id', { onRequest: [authHook as never, validateParams(workspaceIdParamSchema) as never] }, (req, reply) => controller.remove(req as never, reply));
}

export default workspacesModule;
