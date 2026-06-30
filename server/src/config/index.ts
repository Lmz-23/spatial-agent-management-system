import { serverConfig } from './server.config.js';
import { websocketConfig } from './websocket.config.js';
import { databaseConfig } from './database.config.js';

export interface AppConfig {
  nodeEnv: string;
  server: {
    host: string;
    port: number;
  };
  websocket: {
    port: number;
  };
  database: {
    url: string;
  };
  cors: {
    clientUrl: string;
  };
  logging: {
    level: string;
  };
}

export function loadConfig(): AppConfig {
  return {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    server: serverConfig,
    websocket: websocketConfig,
    database: databaseConfig,
    cors: {
      clientUrl: process.env['CLIENT_URL'] ?? 'http://localhost:5173',
    },
    logging: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  };
}

export { serverConfig, websocketConfig, databaseConfig };
