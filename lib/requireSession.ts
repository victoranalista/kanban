import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

export async function requireSession(allowedRoles: Role[] = []) {
  const session = await auth();
  if (!session?.user?.email)
    throw NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  const userRole = session.user.role;
  if (!userRole)
    throw NextResponse.json(
      { error: 'User profile without defined role' },
      { status: 401 }
    );
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole))
    throw NextResponse.json({ error: 'Access denied' }, { status: 403 });
  return session.user;
}
