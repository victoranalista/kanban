import { prisma } from '@/lib/prisma';
import CreateServiceTariffForm from './Form';

export default async function FormServer() {
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
    orderBy: { code: 'asc' }
  });
  return <CreateServiceTariffForm services={services} />;
}
