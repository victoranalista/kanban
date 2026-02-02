'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  createService,
  bulkCreateServices
} from '../../actions/service-actions';
import { toast } from 'sonner';
import { BulkList, isServiceInList } from './BulkList';
import { BulkServiceInput } from '@/app/settings/tariffs/utils/types';

const createServiceSchema = z.object({
  code: z.string().min(3, 'Código de serviço é obrigatório'),
  name: z.string().min(3, 'Nome do serviço é obrigatório')
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

export default function CreateServiceForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [bulkItems, setBulkItems] = React.useState<BulkServiceInput[]>([]);
  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { code: '', name: '' }
  });

  const removeFromBulkList = (index: number) => {
    setBulkItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToList = (data: CreateServiceFormData) => {
    if (isServiceInList(data.code, bulkItems)) {
      toast.warning(`O serviço "${data.code}" já está na lista`);
      return;
    }
    setBulkItems((prev) => [...prev, { code: data.code, name: data.name }]);
    form.reset();
  };

  const handleSaveSingle = async (data: CreateServiceFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('code', data.code);
      formData.append('name', data.name);
      await createService(formData);
      toast.success('Serviço criado com sucesso!');
      form.reset();
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error('Erro ao criar serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBulk = async () => {
    if (!bulkItems.length) return;
    setIsLoading(true);
    try {
      const result = await bulkCreateServices(bulkItems);
      if (!result.success && result.conflicts) {
        const conflictList = result.conflicts
          .map((c) => `${c.code} (${c.name})`)
          .join(', ');
        toast.error(
          `Serviços já existem: ${conflictList}. Remova-os da lista para continuar.`
        );
        return;
      }
      toast.success(`${bulkItems.length} serviços criados com sucesso!`);
      setBulkItems([]);
      form.reset();
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error('Erro ao criar serviços');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[600px] mx-auto mt-0 px-1">
      <Card className="sm:max-h-[84vh] max-h-[74vh] overflow-auto">
        <CardHeader>
          <CardTitle>Criar Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Serviço</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Ex: IV.4.a.E"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Crie o código do serviço</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Ex: Emolumentos de Registro de título, documento ou papel"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Dê um nome ao serviço</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={form.handleSubmit(handleAddToList)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar em Lote
                </Button>
                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={form.handleSubmit(handleSaveSingle)}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar único
                </Button>
              </div>
            </form>
          </Form>
          <div className="mt-6">
            <BulkList
              items={bulkItems}
              onRemove={removeFromBulkList}
              disabled={isLoading}
            />
            {bulkItems.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveBulk} disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar todos ({bulkItems.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
