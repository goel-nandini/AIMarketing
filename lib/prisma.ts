import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:.')) {
    return process.env.DATABASE_URL;
  }
  // On Vercel serverless environment, ensure writable /tmp location
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDb = path.join('/tmp', 'dev.db');
    try {
      if (!fs.existsSync(tmpDb)) {
        const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(localDb)) {
          fs.copyFileSync(localDb, tmpDb);
        }
      }
    } catch {}
    return `file:${tmpDb}`;
  }
  return undefined;
}

const resolvedDbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(resolvedDbUrl ? { datasources: { db: { url: resolvedDbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


