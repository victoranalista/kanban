import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="max-w-full sm:max-w-[600px] w-full mx-auto mt-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32 sm:w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Skeleton para PDF Dialog e Link */}
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <Skeleton className="h-10 w-full sm:w-40" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>

          {/* Skeletons para os Campos do Formulário */}
          <div className="space-y-4">
            {/* Campo Nome */}
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Campo Anexar CPF */}
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Skeleton para o Botão de Submit */}
          <div className="mt-6">
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>

          {/* Skeleton para a Barra de Progresso */}
          <div className="mt-4">
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
