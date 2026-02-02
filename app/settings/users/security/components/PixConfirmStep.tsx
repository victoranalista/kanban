import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DebtDataRecord } from '@/app/posting/actions/documentActions';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface PixConfirmStepProps {
  pixKey: string;
  paymentDate: string;
  debtData: DebtDataRecord | undefined;
  onConfirm: () => void;
  onEdit: () => void;
}

export const PixConfirmStep = ({
  pixKey,
  paymentDate,
  debtData,
  onConfirm,
  onEdit
}: PixConfirmStepProps) => (
  <div className="space-y-6">
    <div className="text-center space-y-1">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        Valor a transferir
      </Label>
      <p className="text-4xl font-bold tracking-tight">
        {debtData ? formatCurrency(Number(debtData.totalValue)) : '-'}
      </p>
    </div>
    <Separator />
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Destino
        </Label>
        <Card>
          <CardContent className="pt-6 pb-6">
            <p className="text-xl font-semibold break-all text-center leading-relaxed">
              {pixKey}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Agendamento
        </Label>
        <p className="text-base font-medium">{formatDate(paymentDate)}</p>
      </div>
    </div>
    <Separator />
    <p className="text-xs text-muted-foreground text-center leading-relaxed">
      Revise cuidadosamente os dados antes de confirmar a transação
    </p>
    <DialogFooter className="gap-3 sm:gap-3">
      <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-1">
        Editar
      </Button>
      <Button onClick={onConfirm} className="flex-1 sm:flex-1">
        Confirmar
      </Button>
    </DialogFooter>
  </div>
);
