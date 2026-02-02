import { Role } from '@prisma/client';

export function sanitizePassword(
  role: Role,
  password: string | undefined | null
): string | undefined {
  if (role !== Role.ADMIN) return undefined;
  if (!password) return undefined;
  return password;
}
