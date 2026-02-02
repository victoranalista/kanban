'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createServiceTariff,
  getAvailableServices
} from '../../actions/tariff-actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { ServiceCombobox } from '../../components/ServiceCombobox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { isTariffInList } from './TariffBulkList';
import { TariffBulkSection } from './TariffBulkSection';
import {
  BulkTariffInput,
  CreateServiceTariffFormProps,
  ServiceWithApplicableFees
} from '@/app/settings/tariffs/utils/types';

type CreateServiceTariffFormData = z.infer<typeof createServiceTariffSchema>;

const createServiceTariffSchema = z.object({
  serviceCode: z.string().min(1, 'Código do serviço é obrigatório'),
  price: z.string().regex(/^[0-9]{1,3}(\.[0-9]{3})*,[0-9]{2}$/g, {
    message: 'Formato R$ inválido (ex: 1.234,56)'
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  })
});

export default function CreateServiceTariffForm({
  services: initialServices
}: CreateServiceTariffFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingServices, setIsLoadingServices] = React.useState(false);
  const [bulkItems, setBulkItems] = React.useState<BulkTariffInput[]>([]);
  const [services, setServices] =
    React.useState<ServiceWithApplicableFees[]>(initialServices);
  const currentYear = new Date().getFullYear();
  const form = useForm<CreateServiceTariffFormData>({
    resolver: zodResolver(createServiceTariffSchema),
    defaultValues: {
      serviceCode: '',
      price: '',
      dateRange: {
        from: new Date(currentYear, 0, 1),
        to: new Date(currentYear, 11, 31)
      }
    }
  });
  const dateRange = form.watch('dateRange');
  const updateAvailableServices = React.useCallback(
    async (from: Date, to: Date) => {
      setIsLoadingServices(true);
      const available = await getAvailableServices(from, to);
      setServices(available);
      setIsLoadingServices(false);
    },
    []
  );
  const resetServicesToInitial = React.useCallback(() => {
    setServices(initialServices);
  }, [initialServices]);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!dateRange?.from || !dateRange?.to) {
        resetServicesToInitial();
        return;
      }
      updateAvailableServices(dateRange.from, dateRange.to);
    }, 300);
    return () => clearTimeout(timer);
  }, [
    dateRange?.from,
    dateRange?.to,
    resetServicesToInitial,
    updateAvailableServices
  ]);

  const parsePrice = (price: string) =>
    parseFloat(price.replace(/\./g, '').replace(',', '.'));

  const buildTariffInput = (
    data: CreateServiceTariffFormData
  ): BulkTariffInput | null => {
    const service = services.find((s) => s.code === data.serviceCode);
    if (!service) return null;
    return {
      serviceId: service.id,
      unitPrice: parsePrice(data.price),
      validFrom: data.dateRange.from.toISOString(),
      validTo: data.dateRange.to?.toISOString() || null
    };
  };

  const handleAddToList = (data: CreateServiceTariffFormData) => {
    const service = services.find((s) => s.code === data.serviceCode);
    if (!service) {
      toast.error('Serviço não encontrado');
      return;
    }
    if (isTariffInList(service.id, bulkItems)) {
      toast.warning(`Já existe uma tarifa para "${service.code}" na lista`);
      return;
    }
    const tariffInput = buildTariffInput(data);
    if (!tariffInput) return;
    setBulkItems((prev) => [...prev, tariffInput]);
    form.setValue('serviceCode', '');
    form.setValue('price', '');
  };

  const removeFromBulkList = (index: number) => {
    setBulkItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSingle = async (data: CreateServiceTariffFormData) => {
    setIsLoading(true);
    try {
      const service = services.find((s) => s.code === data.serviceCode);
      if (!service) {
        toast.error('Serviço não encontrado');
        return;
      }
      const formData = new FormData();
      formData.append('serviceId', service.id.toString());
      formData.append('unitPrice', parsePrice(data.price).toString());
      formData.append('validFrom', data.dateRange.from.toISOString());
      if (data.dateRange.to)
        formData.append('validTo', data.dateRange.to.toISOString());
      const result = await createServiceTariff(formData);
      if (result.success) {
        toast.success('Tarifa criada com sucesso');
        form.reset();
      } else {
        toast.error(result.error || 'Erro ao criar tarifa');
      }
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error('Erro ao criar tarifa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSuccess = () => {
    setBulkItems([]);
    form.reset();
  };

  return (
    <div className="flex flex-col w-full max-w-[600px] mx-auto mt-0 px-1">
      <Card className="sm:max-h-[84vh] max-h-[74vh] overflow-auto">
        <CardHeader>
          <CardTitle>Criar Tarifa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="serviceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Serviço</FormLabel>
                    <FormControl>
                      <ServiceCombobox
                        options={services.map((s) => ({
                          code: s.code,
                          name: s.name
                        }))}
                        value={field.value || null}
                        onValueChange={field.onChange}
                        disabled={isLoading || isLoadingServices}
                      />
                    </FormControl>
                    <FormDescription>
                      Código do serviço ao qual a tarifa será aplicada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="34,56"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Indique o valor do serviço
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vigência</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            disabled={isLoading}
                            className={cn(
                              'w-[300px] justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value?.from ? (
                              field.value?.to ? (
                                <>
                                  {formatDate(field.value.from)} -{' '}
                                  {formatDate(field.value.to)}
                                </>
                              ) : (
                                formatDate(field.value.from)
                              )
                            ) : (
                              <span>Selecione o período de vigência</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        sideOffset={4}
                      >
                        <Calendar
                          mode="range"
                          defaultMonth={field.value?.from || new Date()}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                          className="rounded-lg border shadow-sm"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Selecione o intervalo de vigência da tarifa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading || isLoadingServices}
                  onClick={form.handleSubmit(handleAddToList)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar em Lote
                </Button>
                <Button
                  type="button"
                  disabled={isLoading || isLoadingServices}
                  onClick={form.handleSubmit(handleSaveSingle)}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar única
                </Button>
              </div>
            </form>
          </Form>
          <TariffBulkSection
            items={bulkItems}
            services={services}
            onRemove={removeFromBulkList}
            onSuccess={handleBulkSuccess}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
