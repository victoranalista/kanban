import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  BulkTariffUpdate,
  ParsedBulkDates,
  calculatePreviousDayEnd
} from './validators';

const buildOverlappingQuery = (serviceId: number, newValidFrom: Date) => ({
  serviceId,
  validFrom: { lt: newValidFrom },
  OR: [{ validTo: null }, { validTo: { gte: newValidFrom } }]
});

const findOverlappingTariffs = (serviceId: number, newValidFrom: Date) =>
  prisma.serviceTariff.findMany({
    where: buildOverlappingQuery(serviceId, newValidFrom)
  });

const updateTariffValidTo = (tariffId: number, validToDate: Date) =>
  prisma.serviceTariff.update({
    where: { id: tariffId },
    data: { validTo: validToDate }
  });

export const closeOverlappingTariffs = async (
  serviceId: number,
  newValidFrom: Date
) => {
  const overlappingTariffs = await findOverlappingTariffs(
    serviceId,
    newValidFrom
  );
  if (overlappingTariffs.length > 0) {
    const validToDate = calculatePreviousDayEnd(newValidFrom);
    await Promise.all(
      overlappingTariffs.map((t) => updateTariffValidTo(t.id, validToDate))
    );
  }
  return overlappingTariffs[0]?.id || null;
};

const closeExistingTariffs = (
  tx: Prisma.TransactionClient,
  serviceIds: number[],
  dates: ParsedBulkDates
) =>
  tx.serviceTariff.updateMany({
    where: {
      serviceId: { in: serviceIds },
      validFrom: { lt: dates.validFrom },
      OR: [{ validTo: null }, { validTo: { gte: dates.validFrom } }]
    },
    data: { validTo: dates.validToDate }
  });

const createNewTariff = (
  tx: Prisma.TransactionClient,
  update: BulkTariffUpdate,
  dates: ParsedBulkDates
) =>
  tx.serviceTariff.create({
    data: {
      serviceId: update.serviceId,
      unitPrice: update.unitPrice,
      validFrom: dates.validFrom,
      validTo: dates.validTo,
      adjustmentPercent: update.adjustmentPercent,
      previousTariffId: update.previousTariffId
    }
  });

export const executeBulkTransaction = async (
  updates: BulkTariffUpdate[],
  dates: ParsedBulkDates
) => {
  const serviceIds = updates.map((u) => u.serviceId);
  await prisma.$transaction(async (tx) => {
    await closeExistingTariffs(tx, serviceIds, dates);
    await Promise.all(
      updates.map((update) => createNewTariff(tx, update, dates))
    );
  });
};
