import { prisma } from '@/lib/prisma';
import type { Decimal } from '@prisma/client/runtime/library';

const buildServiceCodes = (letter: string) => {
  const basePattern = `IV.1.${letter}`;
  return [`${basePattern}.E`, `${basePattern}.C`, `${basePattern}.I`];
};

const getCurrentTariff = (
  tariffs: { validFrom: Date; validTo: Date | null; unitPrice: Decimal }[]
) => {
  const now = new Date();
  return tariffs.find(
    (t) => t.validFrom <= now && (!t.validTo || t.validTo >= now)
  );
};

export const fetchServiceTariffs = async (letter: string) => {
  const codes = buildServiceCodes(letter);
  const services = await prisma.service.findMany({
    where: {
      OR: codes.map((code) => ({
        code: { contains: code }
      }))
    },
    include: {
      serviceTariffs: {
        where: {
          validFrom: { lte: new Date() },
          OR: [{ validTo: null }, { validTo: { gte: new Date() } }]
        },
        orderBy: [{ validFrom: 'desc' }, { updatedAt: 'desc' }],
        take: 1
      }
    }
  });

  const emolumentsService = services.find((s) => s.code.trim().endsWith('.E'));
  const ccrcpnService = services.find((s) => s.code.trim().endsWith('.C'));
  const issService = services.find((s) => s.code.trim().endsWith('.I'));
  if (!emolumentsService || !ccrcpnService || !issService) return null;
  const emolumentsTariff = getCurrentTariff(emolumentsService.serviceTariffs);
  const ccrcpnTariff = getCurrentTariff(ccrcpnService.serviceTariffs);
  const issTariff = getCurrentTariff(issService.serviceTariffs);
  if (!emolumentsTariff || !ccrcpnTariff || !issTariff) return null;
  return {
    emoluments: Number(emolumentsTariff.unitPrice),
    ccrcpn: Number(ccrcpnTariff.unitPrice),
    iss: Number(issTariff.unitPrice)
  };
};
