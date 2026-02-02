import { getServices } from '@/app/settings/tariffs/service/actions/service-actions';
import { ServicesTable } from './components/servicesTable';

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between"></div>
      <ServicesTable services={services} />
    </div>
  );
}
