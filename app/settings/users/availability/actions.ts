'use server';
import { normalizeDocument } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { IAvailabilityResponse } from '../types';
import { requireSession } from '@/lib/requireSession';

const isCpfRequired = (role: Role): boolean =>
  role === Role.ADMIN || role === Role.USER;

export const checkTaxpayerIdAvailability = async (
  taxpayerId: string,
  role: Role | null,
  excludeUserId?: number
): Promise<IAvailabilityResponse> => {
  await requireSession([Role.ADMIN]);
  const cleanCpf = normalizeDocument(taxpayerId);
  if (!cleanCpf || cleanCpf.length !== 11)
    return {
      available: false,
      message: 'CPF deve conter 11 dígitos numéricos'
    };
  if (!role || !isCpfRequired(role)) return { available: true };
  const exists = await prisma.user.findFirst({
    where: {
      taxpayerId: cleanCpf,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {})
    },
    select: { id: true }
  });
  return exists
    ? { available: false, message: 'CPF já está em uso' }
    : { available: true };
};
