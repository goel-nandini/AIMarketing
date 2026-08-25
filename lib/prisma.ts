import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function getResolvedDatabaseUrl(): string {
  // If a custom cloud DB URL is provided (e.g. Postgres/MySQL/Neon/Supabase)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:.')) {
    return process.env.DATABASE_URL;
  }

  // On Vercel / AWS Lambda / Serverless environments, /var/task is read-only.
  // SQLite must write to /tmp to avoid "Error code 14: Unable to open the database file".
  const isServerless = !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    (process.env.NODE_ENV === 'production' && !process.env.LOCAL_DEV)
  );

  if (isServerless) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
        const rootDb = path.join(process.cwd(), 'dev.db');
        if (fs.existsSync(localDb)) {
          fs.copyFileSync(localDb, tmpDbPath);
        } else if (fs.existsSync(rootDb)) {
          fs.copyFileSync(rootDb, tmpDbPath);
        }
      }
    } catch (e) {
      console.warn('[Prisma] Database copy to /tmp note:', e);
    }
    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || 'file:./dev.db';
}

const resolvedUrl = getResolvedDatabaseUrl();
process.env.DATABASE_URL = resolvedUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolvedUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

