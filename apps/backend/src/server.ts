import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';

async function bootstrap() {
  try {
    const app = createApp();
    app.listen(config.port, () => {
      logger.info(`API server listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
