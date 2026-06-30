// Server entry point
import { createApp } from './app.js';
import { loadConfig } from './config/index.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    const config = loadConfig();

    logger.info('Starting SAMS server...');
    logger.info({ env: config.nodeEnv }, 'Environment loaded');

    const app = await createApp(config);

    await app.listen({
      host: config.server.host,
      port: config.server.port,
    });

    logger.info(
      { host: config.server.host, port: config.server.port },
      'Server listening',
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();
