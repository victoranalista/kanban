import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Parece que você não está autorizado a acessar o sistema!
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="w-full" prefetch={true} passHref>
            <Button className="w-full">Tentar outra conta</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
