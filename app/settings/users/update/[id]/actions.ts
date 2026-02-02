'use server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import checker from '../../versionChecker';
import { validationSchema } from '../../edit/[id]/validationSchema';
import bcrypt from 'bcryptjs';
import { requireSession } from '@/lib/requireSession';
import { UpdateUserDataInput } from '../../types';
import { normalizeDocument } from '@/lib/validators';

const checkTaxpayerIdUniqueness = async (
  taxpayerId: string,
  excludeUserId: number
): Promise<{ unique: boolean; message?: string }> => {
  const cleanCpf = normalizeDocument(taxpayerId);
  if (!cleanCpf || cleanCpf.length !== 11)
    return { unique: false, message: 'CPF inválido' };
  const existing = await prisma.user.findFirst({
    where: { taxpayerId: cleanCpf, id: { not: excludeUserId } },
    select: { id: true }
  });
  return existing
    ? { unique: false, message: 'CPF já está em uso por outro usuário' }
    : { unique: true };
};

export const updateUserDataAction = async (data: UpdateUserDataInput) => {
  try {
    const currentUser = await requireSession([Role.ADMIN]);
    const validBody = await validationSchema.parse(data);
    if (!validBody) return { success: false, message: 'Invalid data type' };
    if (
      validBody.role !== Role.ADMIN &&
      typeof validBody.password === 'string' &&
      validBody.password.trim() !== ''
    )
      return {
        success: false,
        message: 'Only ADMIN users can set or update a password'
      };
    const { id: userHistoryId } = validBody;
    const targetUser = await prisma.userHistory.findUnique({
      where: { id: userHistoryId },
      select: { role: true, email: true }
    });
    if (!targetUser)
      return { success: false, message: 'Usuário não encontrado' };
    if (
      targetUser.role === Role.ADMIN &&
      targetUser.email !== currentUser.email &&
      typeof validBody.password === 'string' &&
      validBody.password.trim() !== ''
    )
      return {
        success: false,
        message: 'Apenas o próprio admin pode trocar sua senha'
      };
    if (targetUser.role !== Role.ADMIN && validBody.role === Role.ADMIN) {
    }
    try {
      const normalizedTaxpayerId = normalizeDocument(validBody.taxpayerId);
      if (!normalizedTaxpayerId)
        return { success: false, message: 'CPF inválido' };
      await prisma.$transaction(async (tx) => {
        const check = await checker(tx, userHistoryId);
        if (!check) throw new Error('User not found');
        if (check.taxpayerId !== normalizedTaxpayerId) {
          const uniqueCheck = await checkTaxpayerIdUniqueness(
            normalizedTaxpayerId,
            check.userId
          );
          if (!uniqueCheck.unique)
            throw new Error(uniqueCheck.message ?? 'CPF já está em uso');
        }
        const isPasswordModified =
          validBody.role === Role.ADMIN &&
          typeof validBody.password === 'string' &&
          validBody.password.trim() !== '' &&
          !(await bcrypt.compare(validBody.password, check.password ?? ''));
        let finalPassword: string | null | undefined = undefined;
        if (validBody.role === Role.ADMIN)
          if (isPasswordModified)
            finalPassword = await bcrypt.hash(validBody.password!, 12);
          else finalPassword = check.password ?? undefined;
        else finalPassword = null;
        const dataModified =
          check.name !== validBody.name ||
          check.email !== validBody.email ||
          check.role !== validBody.role ||
          check.status !== validBody.status ||
          check.taxpayerId !== normalizedTaxpayerId ||
          isPasswordModified ||
          (validBody.role !== Role.ADMIN && check.password !== null);
        if (!dataModified) throw new Error('No data was modified');
        const existingUserHistory = await tx.userHistory.findUnique({
          where: { id: userHistoryId }
        });
        if (!existingUserHistory)
          throw new Error('UserHistory record not found');
        const existingUser = await tx.user.findUnique({
          where: { id: check.userId }
        });
        if (!existingUser) throw new Error('User record not found');
        await Promise.all([
          tx.userHistory.update({
            where: { id: userHistoryId },
            data: {
              name: validBody.name,
              email: validBody.email,
              role: validBody.role,
              status: validBody.status,
              password: finalPassword
            }
          }),
          tx.user.update({
            where: { id: check.userId },
            data: {
              status: validBody.status,
              taxpayerId: normalizedTaxpayerId
            }
          })
        ]);
      });
      return { success: true, message: 'User updated successfully' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
      ) {
        const msg = (error as { message: string }).message;
        const knownErrors = [
          'No data was modified',
          'User not found',
          'UserHistory record not found',
          'User record not found',
          'CPF is already in use',
          'CPF is already in use by another user',
          'Invalid CPF'
        ];
        if (knownErrors.includes(msg)) return { success: false, message: msg };
        return { success: false, message: 'Error updating user' };
      }
      return { success: false, message: 'Error updating user' };
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return {
        success: false,
        message: (error as { message: string }).message
      };
    }
    return { success: false, message: 'Invalid data type' };
  }
};
