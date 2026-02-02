'use client';
import { useCallback } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { useSession } from 'next-auth/react';
import type { DebtDataRecord } from '@/app/posting/actions/documentActions';
import { useAuthFlow, PaymentStep } from './useAuthFlow';
import { usePixPayment, PIX_KEY_TYPES } from './usePixPayment';
import { PixConfirmStep } from './PixConfirmStep';
import { toast } from 'sonner';

interface PaymentModalConfig {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PaymentModalProps {
  config: PaymentModalConfig;
  debtData?: DebtDataRecord;
}

export default function PaymentModal({ config, debtData }: PaymentModalProps) {
  const { open, onClose, onSuccess } = config;
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const {
    step,
    setStep,
    password,
    setPassword,
    otp,
    setOtp,
    loading,
    setLoading,
    qrCode,
    timeLeft,
    inputRef,
    handlePassword,
    handleOtpValidation,
    handleEnableOtp
  } = useAuthFlow({ email, open, onClose });
  const {
    pixKey,
    setPixKey,
    pixKeyType,
    setPixKeyType,
    paymentDate,
    setPaymentDate,
    paymentResult,
    handlePixKeySubmit: handlePixSubmit,
    handleViewReceipt
  } = usePixPayment(setStep, setLoading, onSuccess);

  const handlePixKeyContinue = () => {
    if (!pixKey.trim()) {
      toast.error('Chave PIX é obrigatória');
      return;
    }
    if (!paymentDate) {
      toast.error('Data do pagamento é obrigatória');
      return;
    }
    setStep(PaymentStep.PIX_KEY_CONFIRM);
  };

  const handlePixKeyConfirm = () => {
    setStep(PaymentStep.PASSWORD);
  };

  const handlePixKeyEdit = () => {
    setStep(PaymentStep.PIX_KEY);
  };

  const handleOtpSubmit = async () => {
    const result = await handleOtpValidation();
    if (result.success && result.token) {
      handlePixSubmit({
        debtData,
        email,
        password,
        otp,
        stepToken: result.token
      });
    }
  };

  const handleEnableOtpSubmit = async (e: React.FormEvent) => {
    const result = await handleEnableOtp(e);
    if (result.success && result.token) {
      handlePixSubmit({
        debtData,
        email,
        password,
        otp,
        stepToken: result.token
      });
    }
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const selectedKeyType = PIX_KEY_TYPES.find(
    (type) => type.value === pixKeyType
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === PaymentStep.PIX_KEY && 'Dados do PIX'}
            {step === PaymentStep.PIX_KEY_CONFIRM && 'Confirmar Dados do PIX'}
            {step === PaymentStep.PASSWORD && 'Autenticação'}
            {step === PaymentStep.OTP && 'Verificação OTP'}
            {step === PaymentStep.REGISTER_OTP && 'Configurar Autenticador'}
            {step === PaymentStep.PROCESSING && 'Processando Pagamento'}
            {step === PaymentStep.DONE && 'Pagamento Concluído'}
          </DialogTitle>
          {debtData && (
            <div className="text-sm text-muted-foreground">
              <p>Descrição: {debtData.description}</p>
              <p>
                Valor:{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(Number(debtData.totalValue))}
              </p>
            </div>
          )}
        </DialogHeader>
        {step === PaymentStep.PIX_KEY && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pixKeyType">Tipo da Chave PIX</Label>
              <Select value={pixKeyType} onValueChange={setPixKeyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo da chave" />
                </SelectTrigger>
                <SelectContent>
                  {PIX_KEY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={selectedKeyType?.placeholder}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="paymentDate">Data do Pagamento</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handlePixKeyContinue}
                disabled={!pixKey.trim() || !paymentDate || loading}
              >
                {loading ? 'Processando...' : 'Continuar'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === PaymentStep.PIX_KEY_CONFIRM && (
          <PixConfirmStep
            pixKey={pixKey}
            paymentDate={paymentDate}
            debtData={debtData}
            onConfirm={handlePixKeyConfirm}
            onEdit={handlePixKeyEdit}
          />
        )}

        {step === PaymentStep.PASSWORD && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePassword();
            }}
            className="space-y-4"
          >
            <Input
              ref={inputRef}
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <DialogFooter>
              <Button type="submit" disabled={loading || !password}>
                {loading ? 'Validando...' : 'Avançar'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        )}
        {step === PaymentStep.OTP && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOtpSubmit();
            }}
            className="space-y-4"
          >
            <div className="text-center text-sm text-muted-foreground mb-2">
              Tempo restante: {Math.floor(timeLeft / secondsPerMinute)}:
              {(timeLeft % secondsPerMinute).toString().padStart(2, '0')}
            </div>
            <div className="flex justify-center my-4">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading || otp.length !== 6}>
                {loading ? 'Validando...' : 'Confirmar pagamento'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        )}
        {step === PaymentStep.REGISTER_OTP && (
          <div className="flex flex-col justify-center items-center space-y-4">
            <p className="text-center">
              Escaneie o QR Code no 1Password, Google Authenticator ou outro app
              de OTP:
            </p>
            {loading && !qrCode && <p>Carregando QR Code...</p>}
            {qrCode && (
              <Image
                src={qrCode}
                alt="QR Code OTP"
                className="mb-8"
                width={200}
                height={200}
              />
            )}
            <form
              onSubmit={handleEnableOtpSubmit}
              className="w-full flex flex-col items-center space-y-7"
            >
              <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <DialogFooter>
                <Button type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? 'Validando...' : 'Validar OTP'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}

        {step === PaymentStep.PROCESSING && (
          <div className="text-center space-y-4">
            <p className="text-lg">Processando pagamento PIX...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        )}

        {step === PaymentStep.DONE && (
          <div className="text-center space-y-4">
            <p className="text-lg font-bold text-600">
              Pagamento PIX realizado com sucesso!
            </p>
            {paymentResult?.batchId && (
              <p className="text-sm text-muted-foreground">
                ID do Lote: {paymentResult.batchId}
              </p>
            )}
            <DialogFooter className="flex justify-center space-x-2">
              <Button onClick={handleClose}>Fechar</Button>
              {paymentResult?.hasReceipt && (
                <Button variant="outline" onClick={handleViewReceipt}>
                  Visualizar Comprovante
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const secondsPerMinute = 60;
