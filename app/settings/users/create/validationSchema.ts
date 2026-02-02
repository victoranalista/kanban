import { validateCpf } from '@/lib/validators';
import { z } from 'zod';
import { Role, ActivationStatus } from '@prisma/client';
import { UserFormValues } from '../types';

const RoleEnum = [Role.ADMIN, Role.USER] as const;
const StatusEnum = [
  ActivationStatus.ACTIVE,
  ActivationStatus.INACTIVE
] as const;

export const validationSchema = z
  .object({
    name: z
      .string({
        error: (issue) =>
          issue.code === 'invalid_type' || issue.code === 'too_small'
            ? 'O nome é obrigatório'
            : undefined
      })
      .min(1, 'O nome é obrigatório'),
    email: z.email('Email inválido'),
    role: z.enum(RoleEnum, {
      error: () => 'Selecione uma permissão válida'
    }),
    status: z.enum(StatusEnum, {
      error: () => 'Selecione um status válido'
    }),
    taxpayerId: z.string().optional(),
    password: z.string().optional()
  })
  .check((ctx) => {
    const { role, taxpayerId, password } = ctx.value;
    if (role === Role.ADMIN || role === Role.USER) {
      if (!taxpayerId) {
        ctx.issues.push({
          code: 'custom',
          message: 'CPF é obrigatório',
          path: ['taxpayerId'],
          input: taxpayerId
        });
      } else if (!/^[0-9]{11}$/.test(taxpayerId)) {
        ctx.issues.push({
          code: 'custom',
          message: 'CPF deve conter 11 dígitos numéricos',
          path: ['taxpayerId'],
          input: taxpayerId
        });
      } else if (!validateCpf(taxpayerId)) {
        ctx.issues.push({
          code: 'custom',
          message: 'CPF inválido',
          path: ['taxpayerId'],
          input: taxpayerId
        });
      }
    }
    if (role === Role.ADMIN) {
      if (!password) {
        ctx.issues.push({
          code: 'custom',
          message: 'A senha é obrigatória para administradores',
          path: ['password'],
          input: password
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
            input: password
          });
        }
        if (password.length < 24) {
          ctx.issues.push({
            code: 'too_small',
            minimum: 24,
            type: 'string',
            message: 'A senha deve ter no mínimo 24 caracteres',
            path: ['password'],
            input: password,
            origin: 'string'
          });
        }
      }
    } else {
      if (password && password.length > 0) {
        ctx.issues.push({
          code: 'custom',
          message: 'Somente administradores podem definir senha',
          path: ['password'],
          input: password
        });
      }
    }
  })
  .transform((data) => {
    const result: UserFormValues = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      taxpayerId:
        data.role === Role.ADMIN || data.role === Role.USER
          ? (data.taxpayerId ?? '')
          : '',
      password: data.role === Role.ADMIN ? (data.password ?? '') : ''
    };
    return result;
  });

export default validationSchema;
