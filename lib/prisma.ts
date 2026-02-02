import { PrismaClient } from '@prisma/client';
declare global {
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  const prisma =
    process.env.NODE_ENV === 'development'
      ? new PrismaClient({
          log: ['query', 'info', 'warn', 'error'],
          datasourceUrl: `${process.env.POSTGRES_PRISMA_URL}&connection_limit=40`
        })
      : new PrismaClient({
          datasourceUrl: `${process.env.POSTGRES_PRISMA_URL}&connection_limit=40`
        });

  if (process.env.NODE_ENV === 'development') global.prisma = prisma;
  return prisma;
};

export const prisma = global.prisma || getPrisma();
