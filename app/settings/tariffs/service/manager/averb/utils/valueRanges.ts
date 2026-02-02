import { prisma } from '@/lib/prisma';
import type { ValueRange } from '../types/averb-types';

const extractLetter = (code: string): string | null => {
  const cleanCode = code.trim();
  const match = cleanCode.match(/IV\.1\.([a-z])\.E/i);
  return match?.[1] ?? null;
};

const parseValueFromName = (name: string, isMin: boolean): number | null => {
  const patterns = {
    min: /(?:até|de)\s+R\$\s+([\d.,]+)/,
    max: /(?:a|até)\s+R\$\s+([\d.,]+)$/,
    above: /acima de\s+R\$\s+([\d.,]+)/
  };
  const match = isMin
    ? name.match(patterns.min)
    : name.match(patterns.max) || name.match(patterns.above);
  if (!match) return null;
  return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
};

const buildRange = (service: {
  name: string;
  code: string;
}): ValueRange | null => {
  const letter = extractLetter(service.code);
  if (!letter) return null;
  const minValue = parseValueFromName(service.name, true);
  const maxValue = parseValueFromName(service.name, false);
  if (minValue === null) return null;
  const isAbove = service.name.includes('acima de');
  const isUntil = service.name.includes('até') && !service.name.includes(' a ');
  return {
    min: isUntil ? 0 : minValue,
    max: isAbove ? null : maxValue,
    letter
  };
};

const isEmolumentsCode = (code: string) => code.trim().endsWith('.E');

export const fetchValueRanges = async (): Promise<ValueRange[]> => {
  const services = await prisma.service.findMany({
    where: {
      code: { contains: 'IV.1.' },
      name: {
        contains:
          'Registro de contrato, título ou documento com conteúdo econômico'
      }
    },
    select: { name: true, code: true }
  });
  const emolumentsServices = services.filter((s) => isEmolumentsCode(s.code));
  const ranges = emolumentsServices
    .map(buildRange)
    .filter((r): r is ValueRange => r !== null)
    .sort((a, b) => a.min - b.min);
  return ranges;
};
