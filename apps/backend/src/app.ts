import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { router } from './routes';
import { errorHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction ? undefined : false
    })
  );

  app.use(
    cors({
      origin: config.corsOrigins.length ? config.corsOrigins : true,
      credentials: true
    })
  );

  // Allow large payloads (uploads use multer, but some clients may send base64 or large JSON)
  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ extended: true, limit: '200mb' }));
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/v1', router);

  app.use(errorHandler);

  return app;
}
