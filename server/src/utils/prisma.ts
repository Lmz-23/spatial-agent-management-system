import type { PrismaClient } from '@prisma/client';

/**
 * Returns the PrismaClient or throws if not available.
 * Use this instead of the `!` operator for safer null handling.
 */
export function requirePrisma(prisma: PrismaClient | null): PrismaClient {
  if (!prisma) {
    throw new Error('Database connection not available. Ensure DATABASE_URL is set and database is reachable.');
  }
  return prisma;
}
