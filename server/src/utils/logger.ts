// Logger utility - using pino directly from fastify
import pino from 'pino';

export const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export type { Logger } from 'pino';
