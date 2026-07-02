import Fastify, { type FastifyInstance } from 'fastify';
import websocketPlugin from './plugins/websocket.plugin.js';
import databasePlugin from './plugins/database.plugin.js';
import corsPlugin from './plugins/cors.plugin.js';
import authPlugin from './plugins/auth.plugin.js';
import ratelimitPlugin from './plugins/ratelimit.plugin.js';
import { httpErrorHandler } from './utils/errors/http.error.js';
import type { AppConfig } from './config/index.js';

export async function createApp(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  // Set global error handler
  app.setErrorHandler(httpErrorHandler);

  // First: base plugins
  await app.register(websocketPlugin);
  await app.register(databasePlugin);
  await app.register(corsPlugin, {
    origin: config.cors.clientUrl,
    credentials: true,
  });
  await app.register(authPlugin);
  await app.register(ratelimitPlugin);

  // Second: decorate fastify with wsService (after @fastify/websocket)
  await app.register(import('./modules/websocket/websocket.decorate.js'));

  // Third: register modules that use wsService
  await app.register(import('./modules/auth/auth.routes.js'), { prefix: '/api/auth' });
  await app.register(import('./modules/agents/agents.module.js'), { prefix: '/api/agents' });
  await app.register(import('./modules/workspaces/workspaces.module.js'), { prefix: '/api/workspaces' });
  await app.register(import('./modules/tasks/tasks.module.js'), { prefix: '/api/tasks' });

  // Fourth: register websocket routes
  await app.register(import('./modules/websocket/websocket.module.js'), { prefix: '/ws' });

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  return app;
}
