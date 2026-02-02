'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { bulkCreateServiceTariffs } from '../../actions/tariff-actions';
import { TariffBulkList } from './TariffBulkList';
import { formatDate, formatCurrency } from '@/lib/formatters';
import {
  BulkTariffInput,
  ServiceWithApplicableFees,
  BulkTariffConflict
} from '@/app/settings/tariffs/utils/types';

interface TariffBulkSectionProps {
  items: BulkTariffInput[];
  services: ServiceWithApplicableFees[];
  onRemove: (index: number) => void;
  onSuccess: () => void;
  disabled: boolean;
}

const buildConflictMessage = (conflicts: BulkTariffConflict[]) => {
  const list = conflicts.map((c) => {
    const from = formatDate(new Date(c.validFrom));
    const to = c.validTo ? formatDate(new Date(c.validTo)) : 'sem fim';
    return `${c.serviceCode}: ${formatCurrency(c.existingPrice)} (${from} até ${to})`;
  });
  return `Tarifas já existem: ${list.join('; ')}. Remova-os da lista para continuar.`;
};

export const TariffBulkSection = ({
  items,
  services,
  onRemove,
  onSuccess,
  disabled
}: TariffBulkSectionProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const handleSaveBulk = async () => {
    if (!items.length) return;
    setIsLoading(true);
    try {
      const result = await bulkCreateServiceTariffs(items);
      if (!result.success && result.conflicts) {
        toast.error(buildConflictMessage(result.conflicts));
        return;
      }
      toast.success(`${items.length} tarifas criadas com sucesso!`);
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error('Erro ao criar tarifas');
    } finally {
      setIsLoading(false);
    }
  };
  const isBusy = disabled || isLoading;
  return (
    <div className="mt-6">
      <TariffBulkList
        items={items}
        services={services}
        onRemove={onRemove}
        disabled={isBusy}
      />
      {items.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveBulk} disabled={isBusy}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar todas ({items.length})
          </Button>
        </div>
      )}
    </div>
  );
};
