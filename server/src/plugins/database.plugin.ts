import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient | null;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const databaseUrl = process.env['DATABASE_URL'];

  // If no DATABASE_URL, skip database connection (useful for scaffolding)
  if (!databaseUrl) {
    fastify.log.warn('DATABASE_URL not set, skipping database connection');
    fastify.decorate('prisma', null);
    return;
  }

  const prisma = new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

  // Test connection
  try {
    await prisma.$connect();
    fastify.log.info('Database connected');
  } catch (error) {
    fastify.log.error({ error }, 'Database connection failed - continuing without DB');
    fastify.decorate('prisma', null);
    return;
  }

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
    fastify.log.info('Database disconnected');
  });
};

export default fp(databasePlugin, {
  name: 'database',
});
