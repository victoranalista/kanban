interface ParsedServiceTariffData {
  serviceId: number;
  unitPrice: number;
  validFrom: Date;
  validTo: Date | null;
}

export interface BulkTariffUpdate {
  serviceId: number;
  unitPrice: number;
  validFrom: string;
  validTo?: string | null;
  adjustmentPercent?: number | null;
  previousTariffId?: number | null;
}

export interface ParsedBulkDates {
  validFrom: Date;
  validTo: Date | null;
  validToDate: Date;
}

const extractFormValues = (formData: FormData) => ({
  serviceIdValue: formData.get('serviceId'),
  unitPriceValue: formData.get('unitPrice'),
  validFromValue: formData.get('validFrom'),
  validToValue: formData.get('validTo')
});

const validateRequiredFields = (
  serviceIdValue: FormDataEntryValue | null,
  unitPriceValue: FormDataEntryValue | null,
  validFromValue: FormDataEntryValue | null
) => {
  if (
    !serviceIdValue ||
    !unitPriceValue ||
    !validFromValue ||
    typeof serviceIdValue !== 'string' ||
    typeof unitPriceValue !== 'string' ||
    typeof validFromValue !== 'string'
  )
    throw new Error('Campos obrigatórios não preenchidos');
};

const parseValidTo = (validToValue: FormDataEntryValue | null): Date | null =>
  validToValue && typeof validToValue === 'string'
    ? new Date(validToValue)
    : null;

const validateParsedValues = (
  serviceId: number,
  unitPrice: number,
  validFrom: Date
) => {
  if (isNaN(serviceId) || serviceId <= 0)
    throw new Error('ID do serviço inválido');
  if (isNaN(unitPrice) || unitPrice < 0)
    throw new Error('Preço unitário deve ser um valor não negativo');
  if (isNaN(validFrom.getTime())) throw new Error('Data de início inválida');
};

export const parseServiceTariffFormData = (
  formData: FormData
): ParsedServiceTariffData => {
  const { serviceIdValue, unitPriceValue, validFromValue, validToValue } =
    extractFormValues(formData);
  validateRequiredFields(serviceIdValue, unitPriceValue, validFromValue);
  const serviceId = parseInt(serviceIdValue as string);
  const unitPrice = parseFloat(unitPriceValue as string);
  const validFrom = new Date(validFromValue as string);
  const validTo = parseValidTo(validToValue);
  validateParsedValues(serviceId, unitPrice, validFrom);
  return { serviceId, unitPrice, validFrom, validTo };
};

const validateBulkUpdateItem = (update: BulkTariffUpdate, index: number) => {
  if (!update.serviceId || update.serviceId <= 0)
    throw new Error(`Item ${index + 1}: ID do serviço inválido`);
  if (typeof update.unitPrice !== 'number' || update.unitPrice < 0)
    throw new Error(`Item ${index + 1}: Preço unitário deve ser não negativo`);
  const validFrom = new Date(update.validFrom);
  if (isNaN(validFrom.getTime()))
    throw new Error(`Item ${index + 1}: Data de início inválida`);
  if (update.validTo) {
    const validTo = new Date(update.validTo);
    if (isNaN(validTo.getTime()))
      throw new Error(`Item ${index + 1}: Data de término inválida`);
    if (validTo <= validFrom)
      throw new Error(`Item ${index + 1}: Data de término deve ser posterior`);
  }
};

export const validateBulkUpdates = (updates: BulkTariffUpdate[]) => {
  if (!updates.length) throw new Error('Nenhuma atualização fornecida');
  updates.forEach(validateBulkUpdateItem);
};

export const calculatePreviousDayEnd = (date: Date): Date => {
  const previousDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - 1,
      23,
      59,
      59,
      999
    )
  );
  return previousDay;
};

export const parseBulkDates = (
  updates: BulkTariffUpdate[]
): ParsedBulkDates => {
  const validFrom = new Date(updates[0].validFrom);
  if (isNaN(validFrom.getTime())) throw new Error('Data de início inválida');
  const validTo = updates[0].validTo ? new Date(updates[0].validTo) : null;
  return {
    validFrom,
    validTo,
    validToDate: calculatePreviousDayEnd(validFrom)
  };
};
