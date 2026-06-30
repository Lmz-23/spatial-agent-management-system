import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app.error.js';

interface ValidationError extends Error {
  validation?: unknown;
}

export function httpErrorHandler(
  error: ValidationError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.code,
      message: error.message,
      details: error.details,
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.validation,
    });
  }

  // Log unexpected errors
  request.log.error({ error }, 'Unexpected error');

  return reply.status(500).send({
    statusCode: 500,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}

export function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  reply.status(404).send({
    statusCode: 404,
    error: 'NOT_FOUND',
    message: `Route ${request.method} ${request.url} not found`,
  });
}
