import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiToken, createApiJwt, shouldRenewJwt } from '@/lib/apiAuth';
import { timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'authjs.session-token';
const COOKIE_MAX_AGE = 1800;

const isExcludedApiRoute = (pathname: string): boolean =>
  pathname.startsWith('/api/auth');

export const isApiRoute = (pathname: string): boolean =>
  pathname.startsWith('/api/') && !isExcludedApiRoute(pathname);

export const isWebhookRoute = (pathname: string): boolean =>
  pathname.startsWith('/api/webhooks');

const safeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const webhookMiddleware = (request: NextRequest): NextResponse => {
  const secret = request.headers.get('x-webhook-secret') ?? '';
  const expected = process.env.PAGBB_WEBHOOK_SECRET ?? '';
  if (!expected || !safeCompare(secret, expected))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.next();
};

const createUnauthorizedResponse = (): NextResponse =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const getExistingJwt = (request: NextRequest): string | null =>
  request.cookies.get(COOKIE_NAME)?.value ?? null;

const needsJwtRenewal = async (jwt: string | null): Promise<boolean> => {
  if (!jwt) return true;
  return await shouldRenewJwt(jwt);
};

const createResponseWithCookie = (jwt: string): NextResponse => {
  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
  return response;
};

export const apiTokenMiddleware = async (
  request: NextRequest
): Promise<NextResponse> => {
  const apiToken = await validateApiToken(request);
  if (!apiToken) {
    return createUnauthorizedResponse();
  }
  const existingJwt = getExistingJwt(request);
  const shouldRenew = await needsJwtRenewal(existingJwt);
  if (!shouldRenew) return NextResponse.next();
  const jwt = await createApiJwt(apiToken);
  return createResponseWithCookie(jwt);
};
