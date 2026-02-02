import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PoolConfig } from '@neondatabase/serverless';

declare global {
  var prismaNeon: PrismaClient | undefined;
}

const getPrismaNeon = () => {
  const poolConfig: PoolConfig =
    process.env.NODE_ENV === 'development'
      ? {
          connectionString: process.env.POSTGRES_PRISMA_URL,
          log(...messages) {
            console.log('[Neon]', ...messages);
          }
        }
      : {
          connectionString: process.env.POSTGRES_PRISMA_URL
        };
  const adapter = new PrismaNeon(poolConfig);
  const prismaNeon =
    process.env.NODE_ENV === 'development'
      ? new PrismaClient({
          adapter,
          log: ['query', 'info', 'warn', 'error']
        })
      : new PrismaClient({ adapter });
  if (process.env.NODE_ENV === 'development')
    globalThis.prismaNeon = prismaNeon;
  return prismaNeon;
};

export const prismaNeon = globalThis.prismaNeon || getPrismaNeon();
