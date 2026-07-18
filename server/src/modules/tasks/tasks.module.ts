import type { FastifyInstance } from 'fastify';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TasksRepository } from './tasks.repository.js';
import { authHook } from '../../plugins/auth.plugin.js';
import { createTaskSchema, updateTaskSchema, taskIdParamSchema, taskWithAgentIdParamSchema, workspaceIdParamSchema } from '../../schemas/task.schema.js';
import { validateBody, validateParams } from '../../utils/validate.js';
import { requirePrisma } from '../../utils/prisma.js';

export interface TasksModuleOptions {
  prefix?: string;
}

export async function tasksModule(
  fastify: FastifyInstance,
  options: TasksModuleOptions,
): Promise<void> {
  const prisma = requirePrisma(fastify.prisma);
  const repository = new TasksRepository(prisma);
  const service = new TasksService(repository, prisma, fastify.wsService, fastify.log);
  const controller = new TasksController(service);

  // Routes are registered under /api/tasks prefix (set in app.ts)
  // Using type assertion for onRequest hook to bypass TypeScript generics issue with hooks
  fastify.get('/', { onRequest: [authHook as never] }, (req, reply) => controller.getAll(req as never, reply));
  fastify.get('/:id', { onRequest: [authHook as never, validateParams(taskIdParamSchema) as never] }, (req, reply) => controller.getById(req as never, reply));
  fastify.get('/workspace/:workspaceId', { onRequest: [authHook as never, validateParams(workspaceIdParamSchema) as never] }, (req, reply) => controller.getByWorkspace(req as never, reply));
  fastify.post('/', { onRequest: [authHook as never], preValidation: [validateBody(createTaskSchema) as never] }, (req, reply) => controller.create(req as never, reply));
  fastify.patch('/:id', { onRequest: [authHook as never], preValidation: [validateParams(taskIdParamSchema) as never, validateBody(updateTaskSchema) as never] }, (req, reply) => controller.update(req as never, reply));
  fastify.delete('/:id', { onRequest: [authHook as never, validateParams(taskIdParamSchema) as never] }, (req, reply) => controller.remove(req as never, reply));
  fastify.post('/:id/assign/:agentId', { onRequest: [authHook as never, validateParams(taskWithAgentIdParamSchema) as never] }, (req, reply) => controller.assignToAgent(req as never, reply));
}

export default tasksModule;
