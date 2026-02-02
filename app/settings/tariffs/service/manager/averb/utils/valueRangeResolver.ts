import { fetchValueRanges } from './valueRanges';

const isValueInRange = (value: number, min: number, max: number | null) =>
  value >= min && (max === null || value <= max);

export const findLetterByValue = async (
  value: number
): Promise<string | null> => {
  const ranges = await fetchValueRanges();
  const range = ranges.find((r) => isValueInRange(value, r.min, r.max));
  return range?.letter ?? null;
};
