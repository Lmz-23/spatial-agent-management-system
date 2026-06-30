import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export interface WebSocketPluginOptions {
  port: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
declare module 'fastify' {
  interface FastifyInstance {
    // TODO: Define proper websocket type
    websocket: unknown;
  }
}

const websocketPlugin: FastifyPluginAsync<WebSocketPluginOptions> = async (
  fastify: FastifyInstance,
  _options: WebSocketPluginOptions,
) => {
  // WebSocket plugin placeholder
  // Actual WebSocket implementation is in modules/websocket/websocket.module.ts
  fastify.log.info('WebSocket plugin initialized');
};

export default fp(websocketPlugin, {
  name: 'websocket',
});