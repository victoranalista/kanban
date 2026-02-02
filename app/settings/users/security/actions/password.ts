'use server';
import { compare } from 'bcryptjs';
import { fetchHistoryById, isAdmin, validateRequired } from './userAuth';
import type { Result } from '../types';
import { requireSession } from '@/lib/requireSession';
import { Role } from '@prisma/client';
import { emailsAllowedToTx } from './whitelist';
import { generateStepToken } from '@/lib/stepTokens';

export interface PasswordValidationResult extends Result {
  token?: string;
}

export const validatePassword = async (
  password: string
): Promise<PasswordValidationResult> => {
  const user = await requireSession([Role.ADMIN]);
  if (!user.email || !user.id)
    return { success: false, message: 'Não autorizado' };
  if (!emailsAllowedToTx.includes(user.email))
    return { success: false, message: 'Não autorizado' };
  const error = validateRequired({ email: user.email, password });
  if (error) return error;
  if (!emailsAllowedToTx.includes(user.email))
    return {
      success: false,
      message: 'Usuário não autorizado para pagamentos'
    };
  try {
    if (!user.id) return { success: false, message: 'Usuário não encontrado' };
    const history = await fetchHistoryById(user.id);
    if (!isAdmin(history))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (!history?.password)
      return { success: false, message: 'Senha inválida' };
    if (!(await compare(password, history.password)))
      return { success: false, message: 'Senha inválida' };
    const token = await generateStepToken('otp');
    return { success: true, token };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};
