import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encode, decode } from 'next-auth/jwt';
import { Role } from '@prisma/client';
import { after } from 'next/server';

export const JWT_MAX_AGE = 1800;
const RENEWAL_THRESHOLD = 300;
const AUTH_SECRET = process.env.AUTH_SECRET!;
const AUTH_SALT = 'authjs.session-token';

export const hashToken = async (token: string): Promise<string> => {
  return await bcrypt.hash(token, 10);
};

const updateTokenLastUsed = (tokenId: number) => {
  after(async () => {
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { lastUsedAt: new Date() }
    });
  });
};

const parseToken = (token: string): { id: number; secret: string } | null => {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const id = parseInt(parts[0]);
  if (isNaN(id)) return null;
  return { id, secret: parts[1] };
};

const findTokenById = async (id: number) => {
  return await prisma.apiToken.findUnique({
    where: { id, active: true },
    select: { id: true, name: true, token: true, expiresAt: true }
  });
};

const isTokenExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return false;
  return expiresAt <= new Date();
};

export const verifyApiToken = async (token: string) => {
  const parsed = parseToken(token);
  if (!parsed) {
    return null;
  }
  const apiToken = await findTokenById(parsed.id);
  if (!apiToken) {
    return null;
  }
  if (isTokenExpired(apiToken.expiresAt)) {
    return null;
  }
  const isValid = await bcrypt.compare(parsed.secret, apiToken.token);
  if (!isValid) {
    return null;
  }
  updateTokenLastUsed(apiToken.id);
  return { id: apiToken.id, name: apiToken.name };
};

export const createApiJwt = async (apiToken: { id: number; name: string }) => {
  return await encode({
    token: {
      id: apiToken.id,
      name: apiToken.name,
      email: `api-${apiToken.id}@system`,
      role: Role.API
    },
    secret: AUTH_SECRET,
    salt: AUTH_SALT,
    maxAge: JWT_MAX_AGE
  });
};

export const shouldRenewJwt = async (jwt: string): Promise<boolean> => {
  try {
    const decoded = await decode({
      token: jwt,
      secret: AUTH_SECRET,
      salt: AUTH_SALT
    });
    if (!decoded?.exp) return true;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return expiresIn < RENEWAL_THRESHOLD;
  } catch {
    return true;
  }
};

export const validateApiToken = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return null;
  }
  const token = extractBearerToken(authHeader);
  return await verifyApiToken(token);
};

const extractBearerToken = (authHeader: string): string => {
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
};
