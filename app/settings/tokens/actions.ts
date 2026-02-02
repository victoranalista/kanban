'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hashToken } from '@/lib/apiAuth';
import { validateAuthentication } from '@/lib/highSecurityAuthenticator';
import crypto from 'crypto';

const validateTokenName = (name: unknown): string => {
  if (typeof name !== 'string' || !name.trim())
    throw new Error('Nome é obrigatório');
  if (name.trim().length > 25)
    throw new Error('Nome deve ter no máximo 25 caracteres');
  return name.trim();
};

const validateTokenId = (tokenId: string): number => {
  const tokenIdNum = parseInt(tokenId);
  if (isNaN(tokenIdNum)) throw new Error('ID do token inválido');
  return tokenIdNum;
};

const findTokenOrThrow = async (tokenId: number) => {
  const token = await prisma.apiToken.findUnique({ where: { id: tokenId } });
  if (!token) throw new Error('Token não encontrado');
  return token;
};

export const createApiToken = async (formData: FormData) => {
  await validateAuthentication();
  const name = validateTokenName(formData.get('name'));
  const secret = crypto.randomBytes(32).toString('hex');
  const hashedSecret = await hashToken(secret);
  const created = await prisma.apiToken.create({
    data: { name, token: hashedSecret, expiresAt: null, active: true }
  });
  revalidatePath('/settings/tokens');
  return { token: `${created.id}.${secret}` };
};

export const getApiTokens = async () => {
  await validateAuthentication();
  return await prisma.apiToken.findMany({
    select: {
      id: true,
      name: true,
      active: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const toggleApiToken = async (tokenId: string) => {
  await validateAuthentication();
  const tokenIdNum = validateTokenId(tokenId);
  const token = await findTokenOrThrow(tokenIdNum);
  await prisma.apiToken.update({
    where: { id: tokenIdNum },
    data: { active: !token.active }
  });
  revalidatePath('/settings/tokens');
};
