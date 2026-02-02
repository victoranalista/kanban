'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/requireSession';
import { Role, Prisma } from '@prisma/client';
import {
  BulkServiceInput,
  BulkCreateServicesResult
} from '@/app/settings/tariffs/utils/types';

const validateServiceFormData = (formData: FormData) => {
  const name = formData.get('name');
  const code = formData.get('code');
  if (!name || !code || typeof name !== 'string' || typeof code !== 'string')
    throw new Error('Código e nome são obrigatórios');
  return { name, code };
};

const checkServiceCodeExists = async (code: string) => {
  const existing = await prisma.service.findUnique({ where: { code } });
  if (existing) throw new Error('Já existe um serviço com esse código');
};

const formatServiceResponse = (service: {
  id: number;
  name: string;
  code: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: service.id,
  name: service.name,
  code: service.code,
  active: service.active,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt
});

export const createService = async (formData: FormData) => {
  await requireSession([Role.ADMIN]);
  const { name, code } = validateServiceFormData(formData);
  await checkServiceCodeExists(code);
  const service = await prisma.service.create({
    data: { name, code, active: true }
  });
  revalidatePath('/settings/tariffs');
  return formatServiceResponse(service);
};

const buildSearchWhereClause = (search?: string): Prisma.ServiceWhereInput => {
  if (!search) return {};
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  };
};

const formatTariff = (tariff: {
  id: number;
  serviceId: number;
  unitPrice: Prisma.Decimal;
  adjustmentPercent: Prisma.Decimal | null;
  validFrom: Date;
  validTo: Date | null;
  previousTariffId: number | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...tariff,
  unitPrice: Number(tariff.unitPrice),
  adjustmentPercent: tariff.adjustmentPercent
    ? Number(tariff.adjustmentPercent)
    : null,
  validFrom: tariff.validFrom.toISOString(),
  validTo: tariff.validTo?.toISOString(),
  createdAt: tariff.createdAt.toISOString(),
  updatedAt: tariff.updatedAt.toISOString()
});

const formatServiceWithTariffs = (service: {
  id: number;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceTariffs: Array<{
    id: number;
    serviceId: number;
    unitPrice: Prisma.Decimal;
    adjustmentPercent: Prisma.Decimal | null;
    validFrom: Date;
    validTo: Date | null;
    previousTariffId: number | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}) => ({
  ...service,
  createdAt: service.createdAt.toISOString(),
  updatedAt: service.updatedAt.toISOString(),
  serviceTariffs: service.serviceTariffs.map(formatTariff)
});

export const getServices = async (search?: string) => {
  await requireSession([Role.ADMIN, Role.API]);
  const where = buildSearchWhereClause(search);
  const now = new Date();
  const services = await prisma.service.findMany({
    where,
    include: {
      serviceTariffs: {
        where: {
          OR: [{ validTo: null }, { validTo: { gte: now } }]
        },
        orderBy: { validFrom: 'desc' },
        select: {
          id: true,
          serviceId: true,
          unitPrice: true,
          adjustmentPercent: true,
          validFrom: true,
          validTo: true,
          previousTariffId: true,
          createdAt: true,
          updatedAt: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  return services.map(formatServiceWithTariffs);
};

const parseUpdateServiceFormData = (formData: FormData) => {
  const name = formData.get('name');
  const code = formData.get('code');
  const description = formData.get('description');
  const activeValue = formData.get('active');
  if (!name || typeof name !== 'string' || !code || typeof code !== 'string')
    throw new Error('Campos obrigatórios não preenchidos');
  return {
    name,
    code,
    description:
      description && typeof description === 'string' ? description : null,
    active: activeValue === 'true'
  };
};

export const updateService = async (id: number, formData: FormData) => {
  await requireSession([Role.ADMIN]);
  const data = parseUpdateServiceFormData(formData);
  const existingService = await prisma.service.findFirst({
    where: {
      code: data.code,
      NOT: { id }
    }
  });
  if (existingService)
    throw new Error('There is already a service with this code.');
  const service = await prisma.service.update({ where: { id }, data });
  revalidatePath('/settings/tariffs');
  return formatServiceResponse(service);
};

export const deleteService = async (id: number) => {
  await requireSession([Role.ADMIN]);
  await prisma.service.update({
    where: { id },
    data: { active: false }
  });
  revalidatePath('/settings/tariffs');
};

const validateBulkServiceInput = (services: BulkServiceInput[]) => {
  if (!services.length) throw new Error('Lista de serviços vazia');
  services.forEach((s, i) => {
    if (!s.code?.trim() || !s.name?.trim())
      throw new Error(`Serviço ${i + 1}: código e nome são obrigatórios`);
  });
};

const findExistingServiceCodes = async (codes: string[]) => {
  const existing = await prisma.service.findMany({
    where: { code: { in: codes } },
    select: { code: true, name: true }
  });
  return existing;
};

export const bulkCreateServices = async (
  services: BulkServiceInput[]
): Promise<BulkCreateServicesResult> => {
  await requireSession([Role.ADMIN]);
  validateBulkServiceInput(services);
  const codes = services.map((s) => s.code.trim());
  const existing = await findExistingServiceCodes(codes);
  if (existing.length) {
    return {
      success: false,
      conflicts: existing.map((s) => ({ code: s.code, name: s.name })),
      message: `Códigos já existem: ${existing.map((s) => s.code).join(', ')}`
    };
  }
  await Promise.all(
    services.map((s) =>
      prisma.service.create({
        data: { code: s.code.trim(), name: s.name.trim(), active: true }
      })
    )
  );
  revalidatePath('/settings/tariffs');
  return { success: true };
};
