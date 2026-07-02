import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export interface CorsPluginOptions {
  origin: string | string[] | boolean;
  credentials: boolean;
}

const corsPlugin: FastifyPluginAsync<CorsPluginOptions> = async (
  fastify: FastifyInstance,
  options: CorsPluginOptions,
) => {
  const origin = typeof options.origin === 'string' ? [options.origin] : options.origin;

  await fastify.register(cors, {
    origin,
    credentials: options.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
  });

  fastify.log.info('CORS plugin initialized');
};

export default fp(corsPlugin, {
  name: 'cors',
});
