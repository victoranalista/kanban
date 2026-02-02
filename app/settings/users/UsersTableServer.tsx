import UsersTableClient from './UsersTableClient';
import { Role } from '@prisma/client';
import { ActivationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { IUser, StatusLabel, RoleLabel } from './types';

const UsersTableServer = async () => {
  const user = await prisma.user.findMany({
    select: {
      id: true,
      taxpayerId: true,
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
        select: { id: true, name: true, email: true, role: true, status: true }
      }
    }
  });

  const activeTranslation: Record<ActivationStatus, StatusLabel> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo'
  };

  const usersData: IUser[] = user.map((user) => {
    const status: StatusLabel =
      activeTranslation[user.versions[0]?.status ?? ActivationStatus.INACTIVE];
    return {
      id: user.versions[0]?.id ?? 0,
      cpf: user.taxpayerId,
      name: user.versions[0]?.name ?? '',
      email: user.versions[0]?.email ?? '',
      role: roleTranslation[user.versions[0]?.role ?? 'USER'],
      status: status
    };
  });
  return <UsersTableClient usersData={usersData} />;
};

const roleTranslation: Record<Role, RoleLabel> = {
  ADMIN: 'Admin',
  USER: 'Usuário',
  API: 'API'
};

export default UsersTableServer;
