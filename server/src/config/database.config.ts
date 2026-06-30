export const databaseConfig = {
  url: process.env['DATABASE_URL'] ?? 'postgresql://user:password@localhost:5432/sams?schema=public',
  debug: process.env['NODE_ENV'] === 'development',
} as const;

export type DatabaseConfig = typeof databaseConfig;
