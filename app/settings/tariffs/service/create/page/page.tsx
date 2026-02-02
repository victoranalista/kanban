import { Metadata } from 'next';
import Form from './Form';

export const metadata: Metadata = {
  title: 'Criar Novo Serviço'
};

export default function Page() {
  return <Form />;
}
