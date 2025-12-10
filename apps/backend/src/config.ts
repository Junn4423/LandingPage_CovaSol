import 'dotenv/config';

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

const getOptionalEnv = (key: string, fallback?: string) => process.env[key] ?? fallback;

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 4000,
  siteUrl: (() => {
    const candidates = [
      process.env.SITE_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
    ];
    const resolved = candidates.find(Boolean) ?? 'http://localhost:3000';
    try {
      return new URL(resolved).origin;
    } catch {
      return resolved;
    }
  })(),
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  jwt: {
    secret: getEnv('JWT_SECRET', 'super-secret-key'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '4h'
  },
  refreshToken: {
    secret: getEnv('REFRESH_TOKEN_SECRET', 'refresh-secret-key'),
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d'
  },
  databaseUrl: getEnv('DATABASE_URL', 'mysql://root:root@localhost:3306/covasol'),
  cloudinary: {
    url: getOptionalEnv('CLOUDINARY_URL'),
    cloudName: getOptionalEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: getOptionalEnv('CLOUDINARY_API_KEY'),
    apiSecret: getOptionalEnv('CLOUDINARY_API_SECRET'),
    folder: getOptionalEnv('CLOUDINARY_FOLDER', 'landing_page_assets')
  }
};
