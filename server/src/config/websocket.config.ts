export const websocketConfig = {
  port: parseInt(process.env['WS_PORT'] ?? '3001', 10),
  options: {
    maxPayload: 1024 * 1024, // 1MB
    pingInterval: 30000,
    pingTimeout: 5000,
  },
} as const;

export type WebsocketConfig = typeof websocketConfig;
