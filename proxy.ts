import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { auth } from '@/lib/auth';
import {
  getClientIP,
  checkBlacklist,
  blockIp,
  log
} from '@/lib/middleware/utils';
import {
  apiTokenMiddleware,
  isApiRoute,
  isWebhookRoute,
  webhookMiddleware
} from '@/lib/middleware/apiTokenMiddleware';
import { redis, redisPrefix } from './lib/redis';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isWebhook = isWebhookRoute(pathname);
  const isExternalApiRoute = pathname.startsWith('/api/bankBb') || isWebhook;
  const isUploadRoute = pathname.startsWith('/file/upload');
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    isUploadRoute,
    isExternalApiRoute,
    isWebhook
  );
  if (rateLimitResponse) return rateLimitResponse;
  if (isWebhook) {
    const webhookResponse = webhookMiddleware(request);
    if (webhookResponse.status === 401) {
      const ip = getClientIP(request.headers);
      log({
        ip,
        routeType: 'webhook',
        status: 401,
        reason: 'Invalid webhook secret'
      });
      return webhookResponse;
    } else return NextResponse.next();
  }
  if (isApiRoute(pathname)) return await apiTokenMiddleware(request);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return auth(request as any);
}

const rateLimitMiddleware = async (
  request: NextRequest,
  isUploadRoute: boolean,
  isExternalApiRoute: boolean,
  isWebhook: boolean
): Promise<NextResponse | null> => {
  const ip = getClientIP(request.headers);
  const prefix = getRoutePrefix(isUploadRoute, isExternalApiRoute, isWebhook);
  const status = await checkBlacklist(ip);
  if (status === 'static') {
    log({ ip, routeType: prefix, status: 403, reason: 'Static blacklist' });
    return new NextResponse('Forbidden - IP blocked (static)', { status: 403 });
  }
  if (status === 'dynamic') {
    log({ ip, routeType: prefix, status: 403, reason: 'Dynamic blacklist' });
    return new NextResponse('Forbidden - IP blocked (dynamic)', {
      status: 403
    });
  }
  const ratelimit = getRateLimiter({
    isUploadRoute,
    isExternalApiRoute,
    isWebhook
  });
  const { success } = await ratelimit.limit(`${redisPrefix}${prefix}:${ip}`);
  if (!success) {
    await blockIp(ip, prefix);
    log({ ip, routeType: prefix, status: 429, reason: 'Rate limit exceeded' });
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  return null;
};

const getRoutePrefix = (
  isUploadRoute: boolean,
  isExternalApiRoute: boolean,
  isWebhook: boolean
): string => {
  if (isWebhook) return 'webhook';
  if (isUploadRoute) return 'upload';
  if (isExternalApiRoute) return 'external-api';
  return 'private';
};

const getRateLimiter = (params: {
  isUploadRoute: boolean;
  isExternalApiRoute: boolean;
  isWebhook: boolean;
}) => {
  const { isUploadRoute, isExternalApiRoute, isWebhook } = params;
  if (isWebhook) return createRateLimiter(250);
  if (isUploadRoute) return createRateLimiter(200);
  if (isExternalApiRoute) return createRateLimiter(100);
  return createRateLimiter(120);
};

const createRateLimiter = (limit: number) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '60 s'),
    ephemeralCache: new Map()
  });

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|images|login|login/unauthorized|favicon\\.ico).*)'
  ]
};
