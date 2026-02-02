'use server';
import { validationSchema } from './validationSchema';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserFormValues } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { logSecurityEvent, checkAdminQuota } from '@/lib/auditSecurity';

export async function createUserAction(data: UserFormValues) {
  const currentUser = await requireSession([Role.ADMIN]);
  try {
    const validated = validationSchema.parse(data);
    if (validated.role === Role.ADMIN) {
      const adminQuota = await checkAdminQuota();
      if (!adminQuota.allowed) {
        await logSecurityEvent({
          userId: currentUser.email || 'unknown',
          action: 'CREATE_ADMIN_REJECTED',
          resource: `user:${validated.email}`,
          newValue: 'ADMIN',
          success: false
        });
        return {
          success: false,
          message: `Limite de administradores atingido (${adminQuota.current}/${adminQuota.limit}). Contate o suporte técnico.`
        };
      }
      await logSecurityEvent({
        userId: currentUser.email || 'unknown',
        action: 'CREATE_ADMIN',
        resource: `user:${validated.email}`,
        newValue: 'ADMIN',
        success: true
      });
    }
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
