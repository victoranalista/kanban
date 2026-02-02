import { Metadata } from 'next';
import FormServer from './FormServer';

export const metadata: Metadata = {
  title: 'Criar Tarifa de Serviço'
};

export default async function Page() {
  return <FormServer />;
}
