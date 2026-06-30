export const serverConfig = {
  host: process.env['HOST'] ?? '0.0.0.0',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
} as const;

export type ServerConfig = typeof serverConfig;
