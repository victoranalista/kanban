import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit3, Check, X, CalendarIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { TariffManagementProps } from '@/app/settings/tariffs/service/manager/types';
import { TariffForm } from './tariffForm';

export const TariffManagement = ({
  showNewTariffForm,
  setShowNewTariffForm,
  newTariff,
  setNewTariff,
  handleAddTariff,
  tariffs,
  handleUpdateTariff,
  handleDeleteTariff,
  startEditingTariff,
  cancelEditingTariff,
  updateTariffField,
  loading
}: TariffManagementProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tarifas do Serviço</h3>
        <Button
          onClick={() => setShowNewTariffForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Tarifa
        </Button>
      </div>
      {showNewTariffForm && (
        <TariffForm
          newTariff={newTariff}
          setNewTariff={setNewTariff}
          handleAddTariff={handleAddTariff}
          setShowNewTariffForm={setShowNewTariffForm}
          loading={loading}
        />
      )}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="hidden sm:table-header-group">
                <TableRow>
                  <TableHead className="px-4 text-sm">Valor</TableHead>
                  <TableHead className="px-4 text-sm">Válido Desde</TableHead>
                  <TableHead className="px-4 text-sm">Válido Até</TableHead>
                  <TableHead className="px-4 text-sm text-center">
                    Status
                  </TableHead>
                  <TableHead className="px-4 text-sm text-center">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs.map((tariff, index) => {
                  const now = new Date();
                  const isCurrent =
                    tariff.validFrom &&
                    now >= tariff.validFrom &&
                    (!tariff.validTo || now <= tariff.validTo);
                  const isFuture = tariff.validFrom && now < tariff.validFrom;
                  const isExpired =
                    tariff.validTo && now > tariff.validTo && !isCurrent;
                  const getStatusLabel = () => {
                    if (isCurrent) return 'Atual';
                    if (isFuture) return 'Futura';
                    if (isExpired) return 'Expirada';
                    return 'Inativa';
                  };
                  const getStatusVariant = () => {
                    if (isCurrent) return 'default' as const;
                    if (isFuture) return 'outline' as const;
                    return 'secondary' as const;
                  };
                  return (
                    <TableRow
                      key={tariff.id || index}
                      className="flex flex-col sm:table-row border-b sm:border-b-0 py-4 sm:py-0 space-y-3 sm:space-y-0"
                    >
                      <TableCell className="sm:table-cell px-4 py-0 sm:py-3">
                        <div className="flex sm:block justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground sm:hidden">
                            Valor:
                          </span>
                          {tariff.isEditing ? (
                            <div className="relative w-32">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                                R$
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={tariff.unitPrice}
                                onChange={(e) =>
                                  updateTariffField(
                                    index,
                                    'unitPrice',
                                    e.target.value
                                  )
                                }
                                className="pl-8 text-sm h-8"
                                placeholder="0,00"
                              />
                            </div>
                          ) : (
                            <div className="font-medium text-sm">
                              {formatCurrency(
                                parseFloat(tariff.unitPrice || '0')
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell px-4 py-0 sm:py-3">
                        <div className="flex sm:block justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground sm:hidden">
                            Válido desde:
                          </span>
                          {tariff.isEditing ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-left font-normal h-8 text-sm',
                                    !tariff.validFrom && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {tariff.validFrom
                                    ? formatDate(tariff.validFrom)
                                    : 'Selecione'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={tariff.validFrom}
                                  onSelect={(date) =>
                                    updateTariffField(index, 'validFrom', date)
                                  }
                                  className="rounded-lg border shadow-sm"
                                />
                              </PopoverContent>
                            </Popover>
                          ) : tariff.validFrom ? (
                            <div className="text-sm">
                              {formatDate(tariff.validFrom)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Não definido
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell px-4 py-0 sm:py-3">
                        <div className="flex sm:block justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground sm:hidden">
                            Válido até:
                          </span>
                          {tariff.isEditing ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-left font-normal h-8 text-sm',
                                    !tariff.validTo && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {tariff.validTo
                                    ? formatDate(tariff.validTo)
                                    : 'Selecione'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={tariff.validTo}
                                  onSelect={(date) =>
                                    updateTariffField(index, 'validTo', date)
                                  }
                                  className="rounded-lg border shadow-sm"
                                />
                              </PopoverContent>
                            </Popover>
                          ) : tariff.validTo ? (
                            <div className="text-sm">
                              {formatDate(tariff.validTo)}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Indefinido
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell px-4 py-0 sm:py-3 sm:text-center">
                        <div className="flex sm:block justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground sm:hidden">
                            Status:
                          </span>
                          <Badge
                            variant={getStatusVariant()}
                            className="text-xs"
                          >
                            {getStatusLabel()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell px-4 py-0 sm:py-3 sm:text-center">
                        <div className="flex justify-end sm:justify-center gap-1">
                          {tariff.isEditing ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateTariff(index)}
                                disabled={loading}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelEditingTariff(index)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingTariff(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={loading}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmar Exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir esta
                                      tarifa? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="w-full sm:w-auto">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        tariff.id &&
                                        handleDeleteTariff(tariff.id)
                                      }
                                      className="w-full sm:w-auto"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {tariffs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm"
                    >
                      Nenhuma tarifa cadastrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
