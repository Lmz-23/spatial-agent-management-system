import { z } from 'zod';
import type { FastifyRequest } from 'fastify';
import { ValidationError } from './errors/app.error.js';

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest) => {
    const result = await schema.safeParseAsync(request.body);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }
    request.body = result.data;
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest) => {
    const result = await schema.safeParseAsync(request.params);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }
    request.params = result.data;
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest) => {
    const result = await schema.safeParseAsync(request.query);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }
    request.query = result.data;
  };
}
