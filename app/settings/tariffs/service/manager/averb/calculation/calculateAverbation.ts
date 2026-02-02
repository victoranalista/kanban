import { findLetterByValue } from '../utils/valueRangeResolver';
import { fetchServiceTariffs } from '../utils/serviceFetcher';
import { calculateAverbTariffs } from './calculatePercentage';
import type { AverbCalculationResult } from '../types/averb-types';

export const calculateAverbation = async (
  baseValue: number
): Promise<AverbCalculationResult | null> => {
  const letter = await findLetterByValue(baseValue);
  if (!letter) return null;
  const tariffs = await fetchServiceTariffs(letter);
  if (!tariffs) return null;
  return calculateAverbTariffs(tariffs, letter, baseValue);
};
