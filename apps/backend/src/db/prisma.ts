import { PrismaClient } from '@prisma/client';
import { config } from '../config';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({
  datasourceUrl: config.databaseUrl,
  log: config.isProduction ? ['error'] : ['query', 'error', 'warn']
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
