import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:.')) {
    return process.env.DATABASE_URL;
  }
  // On Vercel / serverless environment, ensure writable /tmp location
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT) {
    const tmpDb = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDb)) {
        const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(localDb)) {
          fs.copyFileSync(localDb, tmpDb);
        } else {
          fs.writeFileSync(tmpDb, '');
        }
      }
    } catch {}
    return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const resolvedDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;



