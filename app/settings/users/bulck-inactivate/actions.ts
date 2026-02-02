'use server';
import { ActivationStatus } from '@prisma/client';
import { bulkTransaction } from '../bulkTransaction';
import { BulkParams } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

export async function bulkInactivateUsers({
  userHistoryIds
}: BulkParams): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  await requireSession([Role.ADMIN]);
  if (!Array.isArray(userHistoryIds) || userHistoryIds.length === 0)
    return { success: false, error: 'Nenhum usuário selecionado' };
  try {
    await bulkTransaction({
      userHistoryIds,
      newStatus: ActivationStatus.INACTIVE
    });
    return { success: true, message: 'Usuários inativados com sucesso' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Erro ao inativar os usuários' };
  }
}
