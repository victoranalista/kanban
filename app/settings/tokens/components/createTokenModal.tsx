'use client';
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { createApiToken } from '../actions';
import { toast } from 'sonner';
import { saleLabels } from '@/app/posting/utils/labels';

interface CreateTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createToken = async (selectedSaleType: string) => {
  const formData = new FormData();
  formData.append('name', saleLabels[selectedSaleType]);
  return await createApiToken(formData);
};
export const CreateTokenModal = ({
  open,
  onOpenChange
}: CreateTokenModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedSaleType, setSelectedSaleType] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const handleSubmit = useCallback(async () => {
    if (!selectedSaleType) {
      toast.error('Unidade é obrigatória');
      return;
    }
    setLoading(true);
    try {
      const result = await createToken(selectedSaleType);
      setGeneratedToken(result.token);
      toast.success('Token criado com sucesso');
    } catch {
      toast.error('Erro ao criar token');
    } finally {
      setLoading(false);
    }
  }, [selectedSaleType]);
  const copyToken = useCallback(() => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      toast.success('Token copiado para área de transferência');
    }
  }, [generatedToken]);
  const handleClose = useCallback(() => {
    setSelectedSaleType('');
    setGeneratedToken(null);
    setShowToken(false);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:w-full">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base sm:text-lg">
            {generatedToken ? 'Token Criado' : 'Criar Novo Token'}
          </DialogTitle>
        </DialogHeader>

        {!generatedToken ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="saleType" className="text-sm font-medium">
                Unidade
              </Label>
              <Select
                value={selectedSaleType}
                onValueChange={setSelectedSaleType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(saleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-sm">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {loading ? 'Criando...' : 'Criar Token'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-sm">
                Guarde este token em local seguro. Ele não será exibido
                novamente.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Seu Token de API</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedToken}
                  type={showToken ? 'text' : 'password'}
                  readOnly
                  className="font-mono text-xs sm:text-sm flex-1 min-w-0"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowToken(!showToken)}
                  className="flex-shrink-0"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToken}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
