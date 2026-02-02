'use client';
import { Button } from '@/components/ui/button';
import { handleSignIn } from './actions';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
export default function AuthActions() {
  return (
    <form action={() => handleSignIn('google')} className="w-full">
      <LoginButton />
    </form>
  );
}
const LoginButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {pending ? 'Entrando...' : 'Login com o Google'}
    </Button>
  );
};
