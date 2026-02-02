import {
  ServiceConverted,
  ServiceTariffConverted,
  BulkAdjustmentItem
} from '../../types';

const findCurrentTariff = (
  service: ServiceConverted
): ServiceTariffConverted | null => {
  const now = new Date();
  return (
    service.serviceTariffs.find(
      (t) =>
        new Date(t.validFrom) <= now &&
        (!t.validTo || new Date(t.validTo) >= now)
    ) || null
  );
};

const findLatestTariff = (
  service: ServiceConverted
): ServiceTariffConverted | null => {
  if (!service.serviceTariffs.length) return null;
  return service.serviceTariffs.reduce((latest, current) =>
    new Date(current.validFrom) > new Date(latest.validFrom) ? current : latest
  );
};

export const getCurrentTariff = (
  service: ServiceConverted
): ServiceTariffConverted | null => {
  return findCurrentTariff(service) || findLatestTariff(service);
};

export const getDefaultValidFrom = (): Date => {
  const nextYear = new Date().getFullYear() + 1;
  return new Date(nextYear, 0, 1);
};

export const getDefaultValidTo = (): Date => {
  const nextYear = new Date().getFullYear() + 1;
  return new Date(nextYear, 11, 31, 23, 59, 59, 999);
};

export const parsePercentage = (value: string): number => {
  return parseFloat(value.replace(',', '.')) || 0;
};

export const formatPercentageInput = (value: string): string => {
  return value.replace(/[^0-9,.]/g, '');
};

export const applyPercentage = (price: number, percentage: number): number => {
  const priceInCents = Math.round(price * 100);
  const percentageMultiplier = 100 + percentage;
  return Math.round((priceInCents * percentageMultiplier) / 100) / 100;
};

const createItemData = (
  service: ServiceConverted,
  tariff: ServiceTariffConverted,
  percentage: number
): BulkAdjustmentItem => ({
  serviceId: service.id,
  serviceName: service.name,
  serviceCode: service.code,
  currentPrice: tariff.unitPrice,
  currentTariffId: tariff.id,
  newPrice: applyPercentage(tariff.unitPrice, percentage),
  isEditing: false
});

const buildItem = (
  service: ServiceConverted,
  percentage: number
): BulkAdjustmentItem | null => {
  const currentTariff = getCurrentTariff(service);
  if (!service.active || !currentTariff) return null;
  return createItemData(service, currentTariff, percentage);
};

export const buildBulkItems = (
  services: ServiceConverted[],
  percentage: number
): BulkAdjustmentItem[] =>
  services
    .map((s) => buildItem(s, percentage))
    .filter((item): item is BulkAdjustmentItem => item !== null);

export interface BulkUpdatePayload {
  serviceId: number;
  unitPrice: number;
  validFrom: string;
  validTo: string | null;
  adjustmentPercent: number;
  previousTariffId: number | null;
}

const buildUpdatePayload = (
  item: BulkAdjustmentItem,
  validFrom: Date,
  validTo: Date | undefined,
  percentage: number
): BulkUpdatePayload => ({
  serviceId: item.serviceId,
  unitPrice: item.newPrice,
  validFrom: validFrom.toISOString(),
  validTo: validTo?.toISOString() || null,
  adjustmentPercent: percentage / 100,
  previousTariffId: item.currentTariffId
});

export const transformItemsToUpdates = (
  items: BulkAdjustmentItem[],
  validFrom: Date,
  validTo: Date | undefined,
  percentage: number
): BulkUpdatePayload[] =>
  items.map((item) => buildUpdatePayload(item, validFrom, validTo, percentage));
