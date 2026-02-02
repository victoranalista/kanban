'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
import {
  parseServiceTariffFormData,
  validateBulkUpdates,
  parseBulkDates,
  BulkTariffUpdate
} from '../../utils/validators';
import {
  closeOverlappingTariffs,
  executeBulkTransaction
} from '../../utils/tariff-helpers';
import {
  BulkTariffInput,
  BulkCreateTariffsResult
} from '@/app/settings/tariffs/utils/types';

export const getAvailableServices = async (
  validFrom: Date,
  validTo: Date | null
) => {
  await requireSession([Role.ADMIN]);
  const allServices = await prisma.service.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' }
  });
  const servicesWithTariffs = await prisma.serviceTariff.findMany({
    where: {
      validFrom: { lte: validTo || new Date('2099-12-31') },
      OR: [{ validTo: null }, { validTo: { gte: validFrom } }]
    },
    select: { serviceId: true },
    distinct: ['serviceId']
  });
  const tariffsServiceIds = new Set(
    servicesWithTariffs.map((t) => t.serviceId)
  );
  return allServices.filter((s) => !tariffsServiceIds.has(s.id));
};

export const createServiceTariff = async (formData: FormData) => {
  try {
    await requireSession([Role.ADMIN]);
    const { serviceId, unitPrice, validFrom, validTo } =
      parseServiceTariffFormData(formData);
    const previousTariffId = await closeOverlappingTariffs(
      serviceId,
      validFrom
    );
    const tariff = await prisma.serviceTariff.create({
      data: { serviceId, unitPrice, validFrom, validTo, previousTariffId }
    });
    revalidatePath('/settings/tariffs');
    return {
      success: true,
      data: { ...tariff, unitPrice: Number(tariff.unitPrice) }
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      return {
        success: false,
        error:
          'Já existe uma tarifa para este serviço com a mesma data de início'
      };
    if (error instanceof Error && error.message.includes('Campos obrigatórios'))
      return { success: false, error: 'Preencha todos os campos obrigatórios' };
    return { success: false, error: 'Erro ao criar tarifa. Tente novamente.' };
  }
};

const parseUpdateTariffFormData = (formData: FormData) => {
  const unitPriceValue = formData.get('unitPrice');
  const validFromValue = formData.get('validFrom');
  const validToValue = formData.get('validTo');
  if (
    !unitPriceValue ||
    !validFromValue ||
    typeof unitPriceValue !== 'string' ||
    typeof validFromValue !== 'string'
  )
    throw new Error('Required fields missing');
  const unitPrice = parseFloat(unitPriceValue);
  const validFrom = new Date(validFromValue);
  const validTo =
    validToValue && typeof validToValue === 'string'
      ? new Date(validToValue)
      : null;
  if (isNaN(unitPrice) || isNaN(validFrom.getTime()))
    throw new Error('Invalid field values');
  return { unitPrice, validFrom, validTo };
};

const findCurrentTariff = async (id: number) => {
  const tariff = await prisma.serviceTariff.findUnique({ where: { id } });
  if (!tariff) throw new Error('Tarifa não encontrada');
  return tariff;
};

const checkTariffConflict = async (
  serviceId: number,
  id: number,
  validFrom: Date,
  validTo: Date | null
) => {
  const hasConflict = await prisma.serviceTariff.findFirst({
    where: {
      serviceId,
      id: { not: id },
      OR: [
        {
          AND: [
            { validFrom: { lte: validTo || new Date('2099-12-31') } },
            { OR: [{ validTo: null }, { validTo: { gte: validFrom } }] }
          ]
        }
      ]
    }
  });
  if (hasConflict)
    throw new Error('Há tarifa para este serviço com vigência conflitante');
};

export const updateServiceTariff = async (id: number, formData: FormData) => {
  await requireSession([Role.ADMIN]);
  const { unitPrice, validFrom, validTo } = parseUpdateTariffFormData(formData);
  const currentTariff = await findCurrentTariff(id);
  await checkTariffConflict(currentTariff.serviceId, id, validFrom, validTo);
  await prisma.serviceTariff.update({
    where: { id },
    data: { unitPrice, validFrom, validTo }
  });
  revalidatePath('/settings/tariffs');
};

export const deleteServiceTariff = async (id: number) => {
  await requireSession([Role.ADMIN]);
  await prisma.serviceTariff.delete({ where: { id } });
  revalidatePath('/settings/tariffs');
};

export const bulkUpdateServiceTariffs = async (updates: BulkTariffUpdate[]) => {
  await requireSession([Role.ADMIN]);
  validateBulkUpdates(updates);
  const dates = parseBulkDates(updates);
  await executeBulkTransaction(updates, dates);
  revalidatePath('/settings/tariffs');
};

const validateBulkTariffInput = (tariffs: BulkTariffInput[]) => {
  if (!tariffs.length) throw new Error('Lista de tarifas vazia');
  tariffs.forEach((t, i) => {
    if (!t.serviceId) throw new Error(`Tarifa ${i + 1}: serviço é obrigatório`);
    if (t.unitPrice < 0) throw new Error(`Tarifa ${i + 1}: valor inválido`);
    if (!t.validFrom)
      throw new Error(`Tarifa ${i + 1}: data início é obrigatória`);
  });
};

const findExistingTariffs = async (serviceIds: number[]) => {
  const now = new Date();
  const existing = await prisma.serviceTariff.findMany({
    where: {
      serviceId: { in: serviceIds },
      OR: [{ validTo: null }, { validTo: { gte: now } }]
    },
    include: { service: { select: { code: true } } },
    orderBy: { validFrom: 'desc' }
  });
  return existing;
};

export const bulkCreateServiceTariffs = async (
  tariffs: BulkTariffInput[]
): Promise<BulkCreateTariffsResult> => {
  await requireSession([Role.ADMIN]);
  validateBulkTariffInput(tariffs);
  const serviceIds = tariffs.map((t) => t.serviceId);
  const existing = await findExistingTariffs(serviceIds);
  if (existing.length) {
    const conflicts = existing.map((t) => ({
      serviceId: t.serviceId,
      serviceCode: t.service.code,
      existingPrice: Number(t.unitPrice),
      validFrom: t.validFrom.toISOString(),
      validTo: t.validTo?.toISOString() || null
    }));
    return {
      success: false,
      conflicts,
      message: `Tarifas já existem para: ${conflicts.map((c) => c.serviceCode).join(', ')}`
    };
  }
  await Promise.all(
    tariffs.map((t) =>
      prisma.serviceTariff.create({
        data: {
          serviceId: t.serviceId,
          unitPrice: t.unitPrice,
          validFrom: new Date(t.validFrom),
          validTo: t.validTo ? new Date(t.validTo) : null
        }
      })
    )
  );
  revalidatePath('/settings/tariffs');
  return { success: true };
};
