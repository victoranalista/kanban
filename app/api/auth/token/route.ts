import { verifyApiToken, createApiJwt, shouldRenewJwt } from '@/lib/apiAuth';
import { NextRequest } from 'next/server';
import {
  extractJwtFromCookie,
  setJwtCookie
} from '@/app/settings/tokens/cookies';
import { tokenAuthLimiter } from '@/lib/rateLimit';
import { redisPrefix } from '@/lib/redis';

export const POST = async (request: NextRequest) => {
  try {
    const ip = getClientIP(request);
    const { success } = await tokenAuthLimiter.limit(
      `${redisPrefix}token-auth:${ip}`
    );
    if (!success)
      return Response.json(
        { error: 'Muitas tentativas. Tente novamente em 1 minuto' },
        { status: 429 }
      );
    const body = await request.json();
    const { token } = body;
    if (typeof token !== 'string')
      return Response.json({ error: 'Token inválido' }, { status: 400 });
    const apiToken = await verifyApiToken(token);
    if (!apiToken)
      return Response.json({ error: 'Falha na autenticação' }, { status: 401 });
    const existingJwt = await extractJwtFromCookie();
    const needsRenewal = !existingJwt || (await shouldRenewJwt(existingJwt));
    if (!needsRenewal) return Response.json({ success: true, renewed: false });
    const jwt = await createApiJwt(apiToken);
    await setJwtCookie(jwt);
    return Response.json({ success: true, renewed: true });
  } catch (error) {
    console.error(
      '[Token Route] Authentication error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    if (error instanceof SyntaxError)
      return Response.json({ error: 'Body JSON inválido' }, { status: 400 });
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
};

const getClientIP = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
};
