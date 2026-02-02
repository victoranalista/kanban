import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { validatePassword } from '../actions/password';
import {
  getOtpStatus,
  validateOtp,
  generateOtpQrCode,
  enableOtp
} from '../actions/otp';
import { emailsAllowedToTx } from '../actions/whitelist';

export enum PaymentStep {
  PIX_KEY = 'pixKey',
  PIX_KEY_CONFIRM = 'pixKeyConfirm',
  PASSWORD = 'password',
  OTP = 'otp',
  REGISTER_OTP = 'registerOtp',
  PROCESSING = 'processing',
  DONE = 'done'
}

const stepOrder = [
  PaymentStep.PIX_KEY,
  PaymentStep.PIX_KEY_CONFIRM,
  PaymentStep.PASSWORD,
  PaymentStep.OTP,
  PaymentStep.REGISTER_OTP,
  PaymentStep.PROCESSING,
  PaymentStep.DONE
];

export const useAuthFlow = (config: {
  email: string;
  open: boolean;
  onClose: () => void;
}) => {
  const { email, open, onClose } = config;
  const [step, setStep] = useState(PaymentStep.PIX_KEY);
  const [maxStepReached, setMaxStepReached] = useState(PaymentStep.PIX_KEY);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [stepToken, setStepToken] = useState<string>('');
  const otpWindowSeconds = 180;
  const [timeLeft, setTimeLeft] = useState(otpWindowSeconds);
  const [_previousStep, setPreviousStep] = useState<PaymentStep | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const safeSetStep = useCallback(
    (newStep: PaymentStep) => {
      const currentIndex = stepOrder.indexOf(maxStepReached);
      const newIndex = stepOrder.indexOf(newStep);
      if (newIndex > currentIndex) {
        setMaxStepReached(newStep);
        if (newStep === PaymentStep.PROCESSING)
          setTimeLeft((prev) => Math.min(prev + secondsPerMinute, 300));
      }
      setStep(newStep);
    },
    [maxStepReached]
  );

  useEffect(() => {
    if (!open) return;
    if (!emailsAllowedToTx.includes(email)) {
      toast.error('Usuário não autorizado para pagamentos');
      onClose();
      return;
    }
    setStep(PaymentStep.PIX_KEY);
    setMaxStepReached(PaymentStep.PIX_KEY);
    setPassword('');
    setOtp('');
    setQrCode(null);
    setStepToken('');
    setTimeLeft(otpWindowSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    setPreviousStep(null);
  }, [open, email, onClose]);

  useEffect(() => {
    if (step === PaymentStep.PASSWORD && inputRef.current)
      inputRef.current.focus();
  }, [step]);

  useEffect(() => {
    if (!open || step === PaymentStep.PIX_KEY) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          toast.error('Sessão expirada por inatividade');
          onClose();
          return otpWindowSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, step, onClose]);

  const fetchQrCode = useCallback(async () => {
    setLoading(true);
    try {
      const res = await generateOtpQrCode();
      if (res.success && res.qrCode) {
        setQrCode(res.qrCode);
        toast('QR Code gerado com sucesso.');
      } else throw new Error(res.message ?? 'Erro ao gerar QR Code');
    } catch (err) {
      toast.error(
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Erro ao gerar QR Code'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePassword = useCallback(async () => {
    setLoading(true);
    try {
      const result = await validatePassword(password);
      if (!result.success) {
        toast.error(result.message ?? 'Senha inválida');
        return;
      }
      if (result.token) setStepToken(result.token);
      toast.success('Senha validada com sucesso');
      const { enabled } = await getOtpStatus();
      if (enabled) {
        safeSetStep(PaymentStep.OTP);
        setQrCode(null);
      } else {
        safeSetStep(PaymentStep.REGISTER_OTP);
        await fetchQrCode();
      }
    } catch {
      toast.error('Erro ao validar senha');
    } finally {
      setLoading(false);
    }
  }, [password, fetchQrCode, safeSetStep]);

  const handleOtpValidation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await validateOtp(otp, stepToken);
      if (!result.success) {
        toast.error(result.message ?? 'OTP inválido');
        return { success: false };
      }
      if (result.token) setStepToken(result.token);
      setPreviousStep(PaymentStep.OTP);
      safeSetStep(PaymentStep.PROCESSING);
      return { success: true, token: result.token };
    } catch {
      toast.error('Erro ao validar OTP');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [otp, stepToken, safeSetStep]);

  const handleEnableOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const res = await enableOtp(otp);
        if (!res.success) {
          toast.error(res.message ?? 'OTP inválido, tente novamente');
          return { success: false };
        }
        toast.success('OTP habilitado com sucesso');
        setPreviousStep(PaymentStep.REGISTER_OTP);
        safeSetStep(PaymentStep.PROCESSING);
        setQrCode(null);
        return { success: true, token: stepToken };
      } catch {
        toast.error('Erro ao habilitar OTP');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [otp, safeSetStep, stepToken]
  );

  return {
    step,
    setStep: safeSetStep,
    password,
    setPassword,
    otp,
    setOtp,
    loading,
    setLoading,
    qrCode,
    timeLeft,
    stepToken,
    inputRef,
    handlePassword,
    handleOtpValidation,
    handleEnableOtp
  };
};

const secondsPerMinute = 60;
