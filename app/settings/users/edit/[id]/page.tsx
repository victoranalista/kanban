import { prisma } from '@/lib/prisma';
import EditUserForm from './EditUserForm';
import { EditFormValues } from '../../types';

export default async function EditUserPage({
  params
}: {
  params: Promise<{ id: number }>;
}) {
  const userHistoryId = (await params).id;
  const userData = await prisma.userHistory.findUnique({
    where: { id: Number(userHistoryId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      user: { select: { id: true, taxpayerId: true } }
    }
  });
  if (!userData)
    return (
      <div className="text-center text-red-500">Usuário não encontrado.</div>
    );
  if (userData.role === 'API')
    return (
      <div className="text-center text-red-500">
        Usuários de API não podem ser editados.
      </div>
    );
  const initialValues: EditFormValues = {
    id: userData.id,
    userId: userData.user.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    status: userData.status,
    taxpayerId: userData.user.taxpayerId
  };
  return <EditUserForm initialValues={initialValues} />;
}
