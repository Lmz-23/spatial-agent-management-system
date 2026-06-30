import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import websocket from '@fastify/websocket';
import { WebSocketGateway } from './websocket.gateway.js';

export interface WebsocketModuleOptions {
  prefix?: string;
}

// Module that registers WebSocket routes only
// Decoration is handled by websocket.decorate.ts
const websocketRoutesPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(websocket);

  fastify.get('/socket', { websocket: true }, (socket, request) => {
    fastify.wsGateway.handleConnection(socket, request);
  });

  fastify.log.info('WebSocket routes registered');
};

export default websocketRoutesPlugin;
