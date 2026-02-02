'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BulkAdjustmentItem, ServiceConverted } from '../../types';
import { bulkUpdateServiceTariffs } from '@/app/settings/tariffs/service-tariff/actions/tariff-actions';
import {
  getDefaultValidFrom,
  getDefaultValidTo,
  parsePercentage,
  buildBulkItems,
  transformItemsToUpdates
} from './tariffUtils';

export const useBulkAdjustment = (
  services: ServiceConverted[],
  onClose: () => void
) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState('');
  const [validFrom, setValidFrom] = useState<Date>(getDefaultValidFrom());
  const [validTo, setValidTo] = useState<Date | undefined>(getDefaultValidTo());
  const [items, setItems] = useState<BulkAdjustmentItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const validateAndCalculate = useCallback(() => {
    const pct = parsePercentage(percentage);
    if (pct <= 0) {
      toast.error('Informe uma porcentagem válida');
      return;
    }
    setItems(buildBulkItems(services, pct));
    setShowPreview(true);
  }, [percentage, services]);
  const handleRecalculate = useCallback(() => {
    setItems(buildBulkItems(services, parsePercentage(percentage)));
  }, [percentage, services]);
  const updateItemPrice = useCallback((index: number, value: string) => {
    const newPrice = parseFloat(value.replace(',', '.')) || 0;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, newPrice } : item))
    );
  }, []);
  const toggleEditing = useCallback((index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  }, []);
  const handleApply = useCallback(async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const updates = transformItemsToUpdates(
        items,
        validFrom,
        validTo,
        parsePercentage(percentage)
      );
      await bulkUpdateServiceTariffs(updates);
      toast.success('Tarifas atualizadas com sucesso!');
      onClose();
      router.refresh();
    } catch {
      toast.error(
        'Não foi possível aplicar o ajuste. Verifique se as datas já não foram aplicadas.'
      );
    } finally {
      setLoading(false);
    }
  }, [items, validFrom, validTo, percentage, onClose, router]);
  const resetState = useCallback(() => {
    setPercentage('');
    setItems([]);
    setShowPreview(false);
    setValidFrom(getDefaultValidFrom());
    setValidTo(getDefaultValidTo());
  }, []);
  return {
    loading,
    percentage,
    setPercentage,
    validFrom,
    setValidFrom,
    validTo,
    setValidTo,
    items,
    showPreview,
    handleCalculate: validateAndCalculate,
    handleRecalculate,
    updateItemPrice,
    toggleEditing,
    handleApply,
    resetState
  };
};
