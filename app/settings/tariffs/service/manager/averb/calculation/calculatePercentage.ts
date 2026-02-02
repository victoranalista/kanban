import type {
  AverbServiceTariff,
  AverbCalculationResult
} from '../types/averb-types';

const AVERB_PERCENTAGE = 20;

const calculatePercentageOf = (price: number, percentage: number): number => {
  const valueInCents = Math.round(price * 100);
  const resultInCents = Math.round((valueInCents * percentage) / 100);
  return resultInCents / 100;
};

const calculateTotal = (emoluments: number, ccrcpn: number, iss: number) =>
  emoluments + ccrcpn + iss;

export const calculateAverbTariffs = (
  tariffs: AverbServiceTariff,
  letter: string,
  baseValue: number
): AverbCalculationResult => {
  const emoluments = calculatePercentageOf(
    tariffs.emoluments,
    AVERB_PERCENTAGE
  );
  const ccrcpn = calculatePercentageOf(tariffs.ccrcpn, AVERB_PERCENTAGE);
  const iss = calculatePercentageOf(tariffs.iss, AVERB_PERCENTAGE);
  return {
    emoluments,
    ccrcpn,
    iss,
    total: calculateTotal(emoluments, ccrcpn, iss),
    appliedLetter: letter,
    baseValue
  };
};
