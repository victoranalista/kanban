import { get as getEdgeConfig } from '@vercel/edge-config';
import { redis } from '@/lib/redis';

const edgeBlacklistKey = 'blacklist';

export const getClientIP = (headers: Headers): string => {
  const xForwardedFor = headers.get('x-forwarded-for');
  const xRealIp = headers.get('x-real-ip');
  const ip = xForwardedFor
    ? xForwardedFor.split(',')[0].trim()
    : xRealIp || 'unknown';
  return ip;
};

export const isArrayOfStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number';

export const log = ({
  ip,
  routeType,
  status,
  reason
}: {
  ip: string;
  routeType: string;
  status: number;
  reason: string;
}) => {
  console.warn(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ip,
      routeType,
      status,
      reason
    })
  );
};

export const updateBlackList = async (blackList: string[]) => {
  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VERCEL_REST_API_TOKEN}`
      },
      body: JSON.stringify({
        items: [
          { operation: 'update', key: edgeBlacklistKey, value: blackList }
        ]
      })
    }
  );
  if (!res.ok)
    console.error(
      '[updateBlackList] Failed to update Edge Config:',
      res.statusText
    );
};

export const checkBlacklist = async (ip: string) => {
  const kvKey = `blacklist:${ip}`;
  const edgeList = await getEdgeConfig(edgeBlacklistKey);
  if (!isArrayOfStrings(edgeList))
    throw new Error('[checkBlacklist] Blacklist must be an array of strings');
  const kvBlocked = await redis.get(kvKey);
  if (edgeList.includes(ip)) {
    if (kvBlocked) return 'static';
    const newList = edgeList.filter((item) => item !== ip);
    await updateBlackList(newList);
    console.warn(
      `[checkBlacklist] IP ${ip} removed from edge list (not present in Redis)`
    );
  }
  return kvBlocked ? 'dynamic' : false;
};

export const blockIp = async (ip: string, prefix: string) => {
  const kvKey = `blacklist:${ip}`;
  const blockDataKey = `block-time:${ip}`;
  const edgeList = await getEdgeConfig(edgeBlacklistKey);
  const previousBlock = await redis.get(blockDataKey);
  const newBlockTime =
    isNumber(previousBlock) && previousBlock > 0 ? previousBlock * 2 : 60;
  await redis.set(blockDataKey, newBlockTime, { ex: 3600 });
  await redis.set(kvKey, 'true', { ex: newBlockTime });
  if (
    newBlockTime > 120 &&
    isArrayOfStrings(edgeList) &&
    !edgeList.includes(ip)
  ) {
    const newList = [...edgeList, ip];
    await updateBlackList(newList);
  }
  log({
    ip,
    routeType: prefix,
    status: 429,
    reason: 'Rate limit exceeded (blocked)'
  });
};
