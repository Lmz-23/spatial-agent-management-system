import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service.js';

export interface TokenPayload {
  userId: string;
  workspaceId: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyToken: (token: string) => TokenPayload;
  }

  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.slice(7);
    const payload = authService.verifyToken(token);
    request.user = payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    request.log.error({ err: error }, 'Authentication failed');
    reply.code(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message,
    });
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate('verifyToken', (token: string) => {
    return authService.verifyToken(token);
  });
}

export default fp(authPlugin, {
  name: 'auth-plugin',
  dependencies: [],
});
