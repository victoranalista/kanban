'use server';
import { validationSchema } from './validationSchema';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserFormValues } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';

export async function createUserAction(data: UserFormValues) {
  await requireSession([Role.ADMIN]);
  try {
    const validated = validationSchema.parse(data);
    const hashedPassword = validated.password
      ? await bcrypt.hash(validated.password, 10)
      : null;
    const taxpayerId = validated.taxpayerId
      ? validated.taxpayerId.replace(/\D/g, '').trim()
      : '';
    if (taxpayerId) {
      const existing = await prisma.user.findUnique({ where: { taxpayerId } });
      if (existing)
        return {
          success: false,
          message:
            'Já existe um usuário com este CPF cadastrado. Por favor, informe um novo CPF.'
        };
    }
    await prisma.user.create({
      data: {
        taxpayerId: validated.taxpayerId
          ? validated.taxpayerId.replace(/\D/g, '').trim()
          : '',
        status: validated.status,
        versions: {
          create: {
            version: 1,
            name: validated.name,
            email: validated.email,
            role: validated.role,
            status: validated.status,
            password: hashedPassword
          }
        }
      }
    });
    return {
      success: true,
      message: 'Usuário criado com sucesso'
    };
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao criar usuário'
    };
  }
}
