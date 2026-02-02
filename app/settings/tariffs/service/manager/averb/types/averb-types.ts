export interface ValueRange {
  min: number;
  max: number | null;
  letter: string;
}

export interface AverbServiceTariff {
  emoluments: number;
  ccrcpn: number;
  iss: number;
}

export interface AverbCalculationResult {
  emoluments: number;
  ccrcpn: number;
  iss: number;
  total: number;
  appliedLetter: string;
  baseValue: number;
}
