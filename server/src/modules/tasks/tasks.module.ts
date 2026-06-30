import type { FastifyInstance } from 'fastify';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TasksRepository } from './tasks.repository.js';

export interface TasksModuleOptions {
  prefix?: string;
}

export async function tasksModule(
  fastify: FastifyInstance,
  options: TasksModuleOptions,
): Promise<void> {
  const repository = new TasksRepository(fastify.prisma!);
  const service = new TasksService(repository, fastify.prisma!, fastify.wsService);
  const controller = new TasksController(service);

  // Routes are registered under /api/tasks prefix (set in app.ts)
  fastify.get('/', controller.getAll.bind(controller));
  fastify.get('/:id', controller.getById.bind(controller));
  fastify.get('/workspace/:workspaceId', controller.getByWorkspace.bind(controller));
  fastify.post('/', controller.create.bind(controller));
  fastify.patch('/:id', controller.update.bind(controller));
  fastify.delete('/:id', controller.remove.bind(controller));
  fastify.post('/:id/assign/:agentId', controller.assignToAgent.bind(controller));
}

export default tasksModule;
