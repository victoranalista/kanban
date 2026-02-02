'use client';
import DataTable, { Column, Action, BulkAction } from '@/components/DataTable';
import { Switch } from '@/components/ui/switch';
import React, { startTransition, useState } from 'react';
import { toast } from 'sonner';
import type { IUser } from './types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { bulkActivateUsers } from './bulck-activate/actions';
import { bulkInactivateUsers } from './bulck-inactivate/actions';
import { updateUserStatusAction } from './update-status/actions';
import { UsersTableClientProps } from './types';

const UsersTableClient: React.FC<UsersTableClientProps> = ({ usersData }) => {
  const [data, setData] = useState(usersData);

  const columns: Column<IUser>[] = [
    { header: 'Nome', accessor: 'name', sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'CPF', accessor: 'cpf', sortable: true },
    { header: 'Permissão', accessor: 'role', sortable: true },
    { header: 'Status', accessor: 'status', sortable: true }
  ];

  const renderEditLink = (user: IUser) => (
    <Link href={`/settings/users/edit/${user.id}`} prefetch={true} passHref>
      <Button variant="default" size="sm" className="mr-2">
        Editar
      </Button>
    </Link>
  );

  const actions: { individual?: Action<IUser>[]; bulk?: BulkAction<IUser>[] } =
    {
      individual: [
        {
          label: 'Editar',
          component: (id: IUser) => renderEditLink(id),
          variant: 'default'
        }
      ],
      bulk: [
        {
          label: 'Inativar',
          onClick: (selectedIds: Array<IUser['id']>) =>
            handleBulkInactivateUsers(selectedIds),
          variant: 'default'
        },
        {
          label: 'Ativar',
          onClick: (selectedIds: Array<IUser['id']>) =>
            handleBulkActivateUsers(selectedIds),
          variant: 'default'
        }
      ]
    };

  const handleBulkInactivateUsers = (userIds: Array<IUser['id']>) => {
    startTransition(async () => {
      const result = await bulkInactivateUsers({ userHistoryIds: userIds });
      if (result.success) {
        setData((prev) =>
          prev.map((u) =>
            userIds.includes(u.id) ? { ...u, status: 'Inativo' } : u
          )
        );
        toast('Usuários inativados com sucesso.');
      } else toast(result.error || 'Falha ao inativar usuários.');
    });
  };

  const handleBulkActivateUsers = (userIds: Array<IUser['id']>) => {
    startTransition(async () => {
      const result = await bulkActivateUsers({ userHistoryIds: userIds });
      if (result.success) {
        setData((prev) =>
          prev.map((u) =>
            userIds.includes(u.id) ? { ...u, status: 'Ativo' } : u
          )
        );
        toast('Usuários ativados com sucesso.');
      } else toast(result.error || 'Falha ao ativar usuários.');
    });
  };

  const handleStatusChange = (user: IUser) => {
    const previousStatus = user.status;
    const newStatus = previousStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    setData((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    startTransition(async () => {
      const result = await updateUserStatusAction(user.id, newStatus);
      if (!result.success) {
        setData((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, status: previousStatus } : u
          )
        );
        toast('Falha ao atualizar status');
      }
    });
  };

  const renderRowActions = (user: IUser) => (
    <Switch
      checked={user.status === 'Ativo'}
      onCheckedChange={() => handleStatusChange(user)}
    />
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>
      <DataTable<IUser>
        columns={columns}
        data={data}
        actions={actions}
        renderRowActions={renderRowActions}
        onRowSelect={(selectedIds) => console.log('Selecionados:', selectedIds)}
        onBulkAction={(action, selectedIds) => action.onClick(selectedIds)}
      />
    </div>
  );
};

export default UsersTableClient;
