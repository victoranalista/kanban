'use server';
import { signOut, signIn, auth } from '@/lib/auth';
export async function handleSignOut() {
  const session = await auth();
  if (!session) throw new Error('Not authenticated');
  await signOut();
}
export async function handleSignIn(provider: 'google') {
  await signIn(provider);
}
