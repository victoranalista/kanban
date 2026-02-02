import { cookies } from 'next/headers';
import { JWT_MAX_AGE } from '@/lib/apiAuth';

export const extractJwtFromCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('authjs.session-token');
  return cookie?.value || null;
};

export const setJwtCookie = async (jwt: string) => {
  const cookieStore = await cookies();
  cookieStore.set('authjs.session-token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_MAX_AGE
  });
};
