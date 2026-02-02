'use server';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { fetchHistoryById, isAdmin, validateRequired } from './userAuth';
import type { Result, OtpStatus, QrResult } from '../types';
import { emailsAllowedToTx } from './whitelist';
import {
  AuthenticatedUser,
  validateAuthentication
} from '@/lib/highSecurityAuthenticator';
import { validateStepToken, generateStepToken } from '@/lib/stepTokens';
import { redis } from '@/lib/redis';

export interface OtpValidationResult extends Result {
  token?: string;
}

export const validateOtp = async (
  otp: string,
  stepToken: string
): Promise<OtpValidationResult> => {
  let user: AuthenticatedUser;
  try {
    user = await validateAuthentication();
  } catch {
    return { success: false, message: 'Não autorizado' };
  }
  const isValidToken = await validateStepToken(stepToken, 'otp');
  if (!isValidToken)
    return { success: false, message: 'Token de step inválido ou expirado' };
  const error = validateRequired({ email: user.email, otp });
  if (error) return error;
  if (!emailsAllowedToTx.includes(user.email))
    return {
      success: false,
      message: 'Usuário não autorizado para pagamentos'
    };
  if (!/^\d{6}$/.test(otp))
    return { success: false, message: 'Formato de OTP inválido' };
  try {
    const history = await fetchHistoryById(user.id);
    if (!isAdmin(history))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (!history?.totpSecret || !history.totpEnabled)
      return { success: false, message: 'OTP não cadastrado' };
    const otpKey = `used_otp:${user.id}:${otp}`;
    const otpAlreadyUsed = await redis.get(otpKey);
    if (otpAlreadyUsed)
      return { success: false, message: 'OTP já foi utilizado' };
    if (
      !speakeasy.totp.verify({
        secret: history.totpSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      })
    )
      return { success: false, message: 'OTP inválido' };
    await redis.setex(otpKey, 3600, 'used');
    const token = await generateStepToken('pix-key');
    return { success: true, token };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};

export const getOtpStatus = async (): Promise<OtpStatus> => {
  try {
    let user: AuthenticatedUser;
    try {
      user = await validateAuthentication();
    } catch {
      return { enabled: false };
    }
    const history = await fetchHistoryById(user.id);
    return { enabled: !!history?.totpEnabled };
  } catch {
    return { enabled: false };
  }
};

export const generateOtpQrCode = async (): Promise<QrResult> => {
  let user: AuthenticatedUser;
  try {
    user = await validateAuthentication();
  } catch {
    return { success: false, message: 'Não autorizado' };
  }
  try {
    const historyRaw = await fetchHistoryById(user.id);
    if (!historyRaw) return { success: false };
    if (!isAdmin(historyRaw))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (historyRaw.totpEnabled) return { success: false };
    if (historyRaw.totpSecret) {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: historyRaw.totpSecret,
        label: `CC Catarina - ID:${user.id} - ${user.email}`,
        encoding: 'base32'
      });
      const qrCode = await qrcode.toDataURL(otpauthUrl);
      return { success: true, qrCode, secret: historyRaw.totpSecret };
    }
    const secretObj = speakeasy.generateSecret({
      name: `CC Catarina - ID:${user.id} - ${user.email}`
    });
    if (!secretObj.base32 || !secretObj.otpauth_url)
      return { success: false, message: 'Erro ao gerar secret' };
    const qrCode = await qrcode.toDataURL(secretObj.otpauth_url);
    await prisma.userHistory.update({
      where: { id: historyRaw.id },
      data: { totpSecret: secretObj.base32, totpEnabled: false }
    });
    return { success: true, qrCode, secret: secretObj.base32 };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};

export const enableOtp = async (otp: string): Promise<Result> => {
  let user: AuthenticatedUser;
  try {
    user = await validateAuthentication();
  } catch {
    return { success: false, message: 'Não autorizado' };
  }
  const error = validateRequired({ email: user.email, otp });
  if (error) return error;
  if (!/^\d{6}$/.test(otp))
    return { success: false, message: 'Formato de OTP inválido' };
  try {
    const historyRaw = await fetchHistoryById(user.id);
    if (!historyRaw)
      return { success: false, message: 'Usuário não encontrado' };
    if (!isAdmin(historyRaw))
      return { success: false, message: 'Você não pode realizar essa ação' };
    if (!historyRaw.totpSecret)
      return { success: false, message: 'Erro ao gerar secret' };
    if (
      !speakeasy.totp.verify({
        secret: historyRaw.totpSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      })
    )
      return { success: false, message: 'OTP inválido' };
    await prisma.userHistory.update({
      where: { id: historyRaw.id },
      data: { totpEnabled: true, totpVerifiedAt: new Date() }
    });
    return { success: true };
  } catch {
    return { success: false, message: 'Internal server error' };
  }
};
