import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { WebSocketGateway } from './websocket.gateway.js';
import { WebSocketService } from './websocket.service.js';

const websocketDecoratePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const wsService = new WebSocketService();
  const wsGateway = new WebSocketGateway(wsService, fastify.log);

  fastify.decorate('wsService', wsService);
  fastify.decorate('wsGateway', wsGateway);

  fastify.log.info('WebSocket decorators initialized');
};

export default fp(websocketDecoratePlugin, {
  name: 'ws-service-decorator',
  fastify: '4.x',
});

declare module 'fastify' {
  interface FastifyInstance {
    wsService: WebSocketService;
    wsGateway: WebSocketGateway;
  }
}
