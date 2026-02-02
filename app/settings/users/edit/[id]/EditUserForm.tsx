'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Role, ActivationStatus } from '@prisma/client';
import { useEditPersonTaxPayerIdAvailability } from '@/lib/hooks/usePersonTaxPayerIdAvailability';
import { validationSchema } from './validationSchema';
import { updateUserDataAction } from '../../update/[id]/actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form
} from '@/components/ui/form';
import { sanitizePassword } from '../../security/sanitizePassword';
import { EditFormValues, FieldEdit } from '../../types';

export default function EditUserForm({
  initialValues
}: {
  initialValues: EditFormValues;
}) {
  const router = useRouter();
  const methods = useForm<EditFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...initialValues,
      password: initialValues.password ?? ''
    },
    mode: 'onChange'
  });
  useEditPersonTaxPayerIdAvailability(methods, initialValues.userId);
  const currentRole = useWatch({
    control: methods.control,
    name: 'role',
    defaultValue: initialValues.role
  });
  const fields = useMemo<Array<FieldEdit>>(() => {
    const baseFields: Array<FieldEdit> = [
      {
        name: 'id',
        label: 'ID',
        type: 'hidden'
      },
      {
        name: 'userId',
        label: 'userId',
        type: 'hidden'
      },
      {
        name: 'name',
        label: 'Nome',
        type: 'text',
        placeholder: 'Digite o nome'
      },
      {
        name: 'taxpayerId',
        label: 'CPF',
        type: 'text',
        placeholder: 'Digite o CPF'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Digite o email'
      },
      {
        name: 'role',
        label: 'Permissão',
        type: 'select',
        options: [
          { value: Role.ADMIN, label: 'Admin' },
          { value: Role.USER, label: 'Usuário' }
        ]
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: ActivationStatus.ACTIVE, label: 'Ativo' },
          { value: ActivationStatus.INACTIVE, label: 'Inativo' }
        ]
      }
    ];
    if (currentRole === Role.ADMIN) {
      baseFields.splice(3, 0, {
        name: 'password',
        label: 'Senha',
        type: 'password',
        placeholder: 'Digite a senha'
      });
    }
    return baseFields;
  }, [currentRole]);

  const handleSubmit = async (data: EditFormValues) => {
    try {
      const userData = validationSchema.parse(data) as EditFormValues;
      const result = await updateUserDataAction({
        ...userData,
        password: sanitizePassword(userData.role, userData.password)
      });

      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          toast.success('Usuário atualizado com sucesso');
          router.push('/settings/users');
        } else {
          toast.error('Erro ao atualizar usuário', {
            description:
              result.message || 'Erro inesperado ao atualizar usuário.'
          });
        }
      } else {
        toast.error('Erro ao atualizar usuário', {
          description: 'Resposta inesperada do servidor.'
        });
      }
    } catch (err) {
      const description =
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao atualizar usuário.';
      toast.error('Erro ao atualizar usuário', { description });
    }
  };

  const renderField = (field: FieldEdit) => {
    if (field.type === 'hidden') {
      return (
        <input
          key={field.name}
          type="hidden"
          {...methods.register(field.name)}
        />
      );
    }
    return (
      <FormField
        key={field.name}
        control={methods.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value as string | undefined}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Selecione ${field.label.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="flex flex-col w-full max-w-[600px] mx-auto mt-0 px-1">
      <Card className="sm:max-h-[84vh] max-h-[74vh] overflow-auto">
        <CardHeader>
          <CardTitle>Editar Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <Form {...methods}>
              <form
                onSubmit={methods.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {fields.map(renderField)}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/settings/users')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={methods.formState.isSubmitting}
                  >
                    {methods.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
