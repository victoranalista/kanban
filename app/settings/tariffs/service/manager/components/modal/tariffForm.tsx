import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { TariffFormProps } from '@/app/settings/tariffs/service/manager/types';

export const TariffForm = ({
  newTariff,
  setNewTariff,
  handleAddTariff,
  setShowNewTariffForm,
  loading
}: TariffFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-sm sm:text-base">Nova Tarifa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Valor Unitário *
            </Label>
            <div className="relative">
              <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newTariff.unitPrice}
                onChange={(e) =>
                  setNewTariff({
                    ...newTariff,
                    unitPrice: e.target.value
                  })
                }
                placeholder="0,00"
                className="pl-7 sm:pl-10 text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Válido Desde
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-8 sm:h-10 text-xs sm:text-sm',
                    !newTariff.validFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTariff.validFrom
                    ? formatDate(newTariff.validFrom)
                    : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTariff.validFrom}
                  onSelect={(date) =>
                    setNewTariff({
                      ...newTariff,
                      validFrom: date
                    })
                  }
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Válido Até</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal h-8 sm:h-10 text-xs sm:text-sm',
                    !newTariff.validTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTariff.validTo
                    ? formatDate(newTariff.validTo)
                    : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newTariff.validTo}
                  onSelect={(date) =>
                    setNewTariff({
                      ...newTariff,
                      validTo: date
                    })
                  }
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={handleAddTariff}
            disabled={loading}
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            {loading ? 'Salvando...' : 'Adicionar Tarifa'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNewTariffForm(false)}
            className="w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
