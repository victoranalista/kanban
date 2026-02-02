import { prisma } from '@/lib/prisma';
import { ActivationStatus, Role } from '@prisma/client';
import { requireSession } from '@/lib/requireSession';

export const bulkTransaction = async (params: {
  userHistoryIds: number[];
  newStatus: ActivationStatus;
}) => {
  await requireSession([Role.ADMIN]);
  const { userHistoryIds, newStatus } = params;
  await prisma.$transaction(async (tx) => {
    const userHistories = await tx.userHistory.findMany({
      where: { id: { in: userHistoryIds } },
      select: { id: true, userId: true, version: true }
    });
    if (userHistories.length !== userHistoryIds.length)
      throw new Error('Some selected users were not found');
    const userIds = Array.from(new Set(userHistories.map((oh) => oh.userId)));
    const latestVersions = await tx.userHistory.groupBy({
      where: { userId: { in: userIds } },
      by: ['userId'],
      _max: { version: true }
    });
    const latestuserHistories = await tx.userHistory.findMany({
      where: {
        userId: { in: userIds },
        version: {
          in: latestVersions
            .map((lv) => lv._max.version)
            .filter((v): v is number => v !== null)
        }
      },
      select: { id: true, userId: true }
    });
    const latestuserHistoryIds = latestuserHistories.map((loh) => loh.id);
    const allAreLatest = userHistoryIds.every((id) =>
      latestuserHistoryIds.includes(id)
    );
    if (!allAreLatest)
      throw new Error('Some users are not on the latest version');
    const usersToUpdate = latestuserHistories.map((loh) => loh.userId);
    await Promise.all([
      tx.userHistory.updateMany({
        where: { id: { in: userHistoryIds } },
        data: { status: newStatus }
      }),
      tx.user.updateMany({
        where: { id: { in: usersToUpdate } },
        data: { status: newStatus }
      })
    ]);
  });
};
