import type { FastifyInstance } from 'fastify';
import { WorkspacesController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';
import { WorkspacesRepository } from './workspaces.repository.js';

export interface WorkspacesModuleOptions {
  prefix?: string;
}

export async function workspacesModule(
  fastify: FastifyInstance,
  options: WorkspacesModuleOptions,
): Promise<void> {
  const repository = new WorkspacesRepository(fastify.prisma!);
  const service = new WorkspacesService(repository);
  const controller = new WorkspacesController(service);

  fastify.get('/', controller.getAll.bind(controller));
  fastify.get('/:id', controller.getById.bind(controller));
  fastify.post('/', controller.create.bind(controller));
  fastify.patch('/:id', controller.update.bind(controller));
  fastify.delete('/:id', controller.remove.bind(controller));
}

export default workspacesModule;
