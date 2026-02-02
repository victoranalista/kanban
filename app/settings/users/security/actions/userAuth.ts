import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const fetchHistoryById = async (userHistoryId: number) => {
  if (!userHistoryId) return null;
  try {
    return await prisma.userHistory.findFirst({
      where: { id: userHistoryId, status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        totpSecret: true,
        totpEnabled: true,
        totpVerifiedAt: true,
        user: {
          select: {
            id: true,
            taxpayerId: true
          }
        }
      }
    });
  } catch {
    return null;
  }
};

export const isAdmin = (history: { role: Role } | null) =>
  !!history && history.role === Role.ADMIN;

export function validateRequired(fields: Record<string, string>) {
  for (const [key, value] of Object.entries(fields))
    if (!value?.trim())
      return { success: false, message: `${key} é obrigatório` };
  return null;
}
