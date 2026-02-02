'use server';
import { ActivationStatus } from '@prisma/client';
import { bulkTransaction } from '../bulkTransaction';
import { BulkParams } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

export async function bulkActivateUsers({
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
      newStatus: ActivationStatus.ACTIVE
    });
    return { success: true, message: 'Usuários ativados com sucesso' };
  } catch (error) {
    console.error('Erro ao ativar usuários:', error);
    return { success: false, error: 'Erro ao ativar os usuários' };
  }
}
