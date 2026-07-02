import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service.js';
import { authService as jwtAuthService } from '../../services/auth.service.js';

interface LoginBody {
  workspaceId: string;
  password: string;
}

export class AuthController {
  constructor(private readonly fastify: FastifyInstance) {}

  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply): Promise<void> {
    const { workspaceId, password } = request.body;

    if (!workspaceId || !password) {
      reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'workspaceId and password are required',
      });
      return;
    }

    try {
      const { userId } = await authService.validateCredentials(workspaceId, password);
      const token = jwtAuthService.generateToken(userId, workspaceId);

      reply.code(200).send({
        token,
        userId,
        workspaceId,
      });
    } catch (error) {
      request.log.error({ err: error }, 'Login failed');
      if (error instanceof Error && error.message.includes('Invalid')) {
        reply.code(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid credentials',
        });
        return;
      }
      throw error;
    }
  }
}
