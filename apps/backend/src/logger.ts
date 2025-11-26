import pino from 'pino';
import { config } from './config';

export const logger = pino({
  name: 'covasol-backend',
  level: config.isProduction ? 'info' : 'debug'
});
