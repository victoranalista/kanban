'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Search, Percent } from 'lucide-react';
import { ServiceConverted } from '@/app/settings/tariffs/service/manager/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { EditServiceModal } from './modal/serviceModal';
import { BulkAdjustmentDialog } from './bulkAdjustment/percentTariff';
import { getCurrentTariff } from './bulkAdjustment/tariffUtils';

interface ServicesTableProps {
  services: ServiceConverted[];
}

const getFutureTariff = (service: ServiceConverted) => {
  const now = new Date();
  return service.serviceTariffs.find((t) => new Date(t.validFrom) > now);
};

export const ServicesTable = ({ services }: ServicesTableProps) => {
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkAdjustment, setShowBulkAdjustment] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ServiceConverted | null>(null);
  const filteredServices = services
    .filter(
      (service) =>
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.code.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.code.localeCompare(b.code));
  const handleEditService = (service: ServiceConverted) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowBulkAdjustment(true)}>
            <Percent className="h-4 w-4 mr-2" />
            Ajuste em Lote
          </Button>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredServices.length} serviços
          </span>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">
            Serviços Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="hidden sm:table-header-group">
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nome
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Código
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valor Atual
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tarifas
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredServices.map((service) => {
                const currentTariff = getCurrentTariff(service);
                const futureTariff = getFutureTariff(service);
                return (
                  <TableRow
                    key={service.id}
                    className="border-b sm:border-b flex flex-col sm:table-row py-4 sm:py-0 space-y-3 sm:space-y-0 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="sm:hidden px-4 py-0">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium text-sm mb-1"
                              title={service.name}
                            >
                              {service.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              Código: {service.code}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Badge
                              variant={service.active ? 'default' : 'secondary'}
                              className="text-xs px-2 py-1"
                            >
                              {service.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditService(service)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex-1">
                            {currentTariff ? (
                              <div>
                                <div className="font-semibold text-sm">
                                  {formatCurrency(currentTariff.unitPrice)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Desde {formatDate(currentTariff.validFrom)}
                                  {currentTariff.validTo &&
                                    ` até ${formatDate(currentTariff.validTo)}`}
                                </div>
                                {futureTariff && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Reajuste Futuro:{' '}
                                    {formatCurrency(futureTariff.unitPrice)} a
                                    partir de{' '}
                                    {formatDate(futureTariff.validFrom)}
                                  </div>
                                )}
                              </div>
                            ) : futureTariff ? (
                              <div>
                                <div className="font-semibold text-sm text-muted-foreground">
                                  {formatCurrency(futureTariff.unitPrice)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  A partir de{' '}
                                  {formatDate(futureTariff.validFrom)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Sem tarifa
                              </div>
                            )}
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-1"
                            >
                              {service.serviceTariffs.length} tarifa
                              {service.serviceTariffs.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className="font-medium text-sm truncate max-w-[200px]"
                          title={service.name}
                        >
                          {service.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-6 py-4">
                      <div className="text-sm font-mono text-muted-foreground">
                        {service.code}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-6 py-4">
                      {currentTariff ? (
                        <div>
                          <div className="font-semibold text-sm">
                            {formatCurrency(currentTariff.unitPrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Desde {formatDate(currentTariff.validFrom)}
                            {currentTariff.validTo &&
                              ` até ${formatDate(currentTariff.validTo)}`}
                          </div>
                          {futureTariff && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatCurrency(futureTariff.unitPrice)} a partir
                              de {formatDate(futureTariff.validFrom)}
                            </div>
                          )}
                        </div>
                      ) : futureTariff ? (
                        <div>
                          <div className="font-semibold text-sm text-muted-foreground">
                            {formatCurrency(futureTariff.unitPrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            A partir de {formatDate(futureTariff.validFrom)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Sem tarifa
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-6 py-4 text-center">
                      <Badge variant="outline" className="text-xs font-medium">
                        {service.serviceTariffs.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-6 py-4 text-center">
                      <Badge
                        variant={service.active ? 'default' : 'secondary'}
                        className="text-xs font-medium"
                      >
                        {service.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditService(service)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredServices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-sm font-medium">
                        Nenhum serviço encontrado
                      </div>
                      <div className="text-xs">
                        Tente ajustar sua pesquisa ou adicionar um novo serviço
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {showEditModal && selectedService && (
        <EditServiceModal
          service={selectedService}
          open={showEditModal}
          onOpenChange={setShowEditModal}
        />
      )}
      <BulkAdjustmentDialog
        services={services}
        open={showBulkAdjustment}
        onOpenChange={setShowBulkAdjustment}
      />
    </div>
  );
};
