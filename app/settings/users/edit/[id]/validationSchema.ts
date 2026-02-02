import { z } from 'zod';
import { ActivationStatus, Role } from '@prisma/client';
import { EditFormValues } from '../../types';
import { normalizeDocument } from '@/lib/validators';

const RoleEnum = [Role.ADMIN, Role.USER] as const;
const StatusEnum = [
  ActivationStatus.ACTIVE,
  ActivationStatus.INACTIVE
] as const;

export const validationSchema = z
  .object({
    id: z.number({
      error: (issue) =>
        issue.code === 'invalid_type' ? 'O ID deve ser um número' : undefined
    }),
    userId: z.number({
      error: (issue) =>
        issue.code === 'invalid_type'
          ? 'O userId deve ser um número'
          : undefined
    }),
    name: z.string({
      error: (issue) =>
        issue.code === 'invalid_type' ? 'O nome é obrigatório' : undefined
    }),
    email: z.email('Email inválido'),
    role: z.enum(RoleEnum, {
      error: () => 'Selecione uma permissão válida'
    }),
    status: z.enum(StatusEnum, {
      error: () => 'Selecione um status válido'
    }),
    taxpayerId: z
      .string({ error: () => 'O CPF é obrigatório' })
      .refine((cpf) => normalizeDocument(cpf)?.length === 11, {
        message: 'CPF inválido'
      }),
    password: z.string().optional()
  })
  .check((ctx) => {
    const { role, password } = ctx.value;
    if (role === Role.ADMIN) {
      if (!password) {
        ctx.issues.push({
          code: 'custom',
          message: 'A senha é obrigatória para administradores',
          path: ['password'],
          input: 'string'
        });
      } else {
        if (
          !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\\/[\]~`+=;']).+/.test(
            password
          )
        ) {
          ctx.issues.push({
            code: 'custom',
            message:
              'A senha deve conter ao menos uma letra maiúscula, um número e um caractere especial',
            path: ['password'],
            input: 'string'
          });
        }
        if (password.length < 24) {
          ctx.issues.push({
            code: 'too_small',
            minimum: 24,
            message: 'A senha deve ter no mínimo 24 caracteres',
            path: ['password'],
            input: password,
            origin: 'string'
          });
        }
      }
    }
  })
  .transform((data) => {
    const result: EditFormValues = {
      id: data.id,
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      taxpayerId: data.taxpayerId,
      ...(data.role === Role.ADMIN && data.password
        ? { password: data.password }
        : {})
    };
    return result;
  });

export default validationSchema;
