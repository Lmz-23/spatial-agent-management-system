import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';
import { loginSchema } from '../../schemas/auth.schema.js';
import { validateBody } from '../../utils/validate.js';

export interface AuthModuleOptions {
  prefix?: string;
}

export async function authModule(
  fastify: FastifyInstance,
  options: AuthModuleOptions,
): Promise<void> {
  const controller = new AuthController(fastify);

  // POST /api/auth/login - public endpoint (no auth required)
	fastify.post('/login', { preValidation: [validateBody(loginSchema) as never] }, controller.login.bind(controller));
}

export default authModule;
