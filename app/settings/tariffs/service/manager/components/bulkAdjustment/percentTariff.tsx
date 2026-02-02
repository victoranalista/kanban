'use client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BulkAdjustmentDialogProps } from '../../types';
import { useBulkAdjustment } from './useBulkAdjustment';
import { PercentageInput } from './PercentageInput';
import { DatePicker } from './DatePicker';
import { PreviewTable } from './PreviewTable';

export const BulkAdjustmentDialog = ({
  services,
  open,
  onOpenChange
}: BulkAdjustmentDialogProps) => {
  const state = useBulkAdjustment(services, () => onOpenChange(false));
  const handleClose = () => {
    state.resetState();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajuste de Tarifas em Lote</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Configuração do Ajuste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <PercentageInput
                  value={state.percentage}
                  onChange={state.setPercentage}
                />
                <DatePicker
                  config={{
                    label: 'Válido Desde',
                    placeholder: 'Selecione a data'
                  }}
                  value={state.validFrom}
                  onChange={(d) => d && state.setValidFrom(d)}
                />
                <DatePicker
                  config={{ label: 'Válido Até', placeholder: 'Indefinido' }}
                  value={state.validTo}
                  onChange={state.setValidTo}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={state.handleCalculate}
                  disabled={!state.percentage}
                >
                  Calcular
                </Button>
                {state.showPreview && (
                  <Button variant="outline" onClick={state.handleRecalculate}>
                    Recalcular
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          {state.showPreview && (
            <PreviewTable
              items={state.items}
              percentage={state.percentage}
              onPriceChange={state.updateItemPrice}
              onToggleEdit={state.toggleEditing}
            />
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {state.showPreview && (
            <Button
              onClick={state.handleApply}
              disabled={state.loading || !state.items.length}
            >
              {state.loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {state.loading
                ? 'Aplicando...'
                : `Aplicar para ${state.items.length} serviços`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
