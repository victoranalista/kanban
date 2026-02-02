'use client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditUserRedirect() {
  const router = useRouter();
  useEffect(() => {
    toast('Escolha um usuário para editar');
    router.replace('/settings/users');
  }, [router]);
  return null;
}
