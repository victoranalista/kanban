'use server';
import { ActivationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

type HumanStates = 'Ativo' | 'Inativo';

export async function updateUserStatusAction(
  userHistoryId: number,
  status: HumanStates
): Promise<{ success: boolean; message?: string; error?: string }> {
  await requireSession([Role.ADMIN]);
  if (!['Ativo', 'Inativo'].includes(status))
    return { success: false, error: 'Status inválido' };
  const translateStatus = {
    Ativo: ActivationStatus.ACTIVE,
    Inativo: ActivationStatus.INACTIVE
  } as const;
  const translatedStatus = translateStatus[status];
  try {
    await prisma.$transaction(async (tx) => {
      const history = await tx.userHistory.findUnique({
        where: { id: userHistoryId },
        select: { userId: true }
      });
      if (!history) throw new Error('User not found');
      const user = await tx.user.findFirst({
        where: { id: history.userId },
        select: {
          id: true,
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
            select: { id: true }
          }
        }
      });
      if (!user || user.versions[0]?.id !== userHistoryId)
        throw new Error('User history not found');
      await Promise.all([
        tx.userHistory.update({
          where: { id: userHistoryId },
          data: { status: translatedStatus }
        }),
        tx.user.update({
          where: { id: user.id },
          data: { status: translatedStatus }
        })
      ]);
    });
    return { success: true, message: 'Usuário atualizado com sucesso' };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Erro ao atualizar o usuário' };
  }
}
