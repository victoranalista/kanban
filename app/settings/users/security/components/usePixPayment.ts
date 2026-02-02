'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { processPixPayment } from '@/app/bankBb/pagBb/proof/actions/processPixPayment';
import {
  createPaymentProof,
  createScheduledPaymentProof
} from '@/app/bankBb/pagBb/proof/actions/paymentProofActions';
import { getBankConfig } from '@/app/bankBb/pagBb/proof/actions/getBankConfig';
import type { DebtDataRecord } from '@/app/posting/actions/documentActions';
import { PaymentStep } from './useAuthFlow';

export const PIX_KEY_TYPES = [
  { value: '1', label: 'CPF', placeholder: '000.000.000-00' },
  { value: '2', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { value: '3', label: 'E-mail', placeholder: 'exemplo@email.com' },
  { value: '4', label: 'Telefone', placeholder: '+5511999999999' },
  { value: '5', label: 'Chave Aleatória', placeholder: 'chave-aleatoria-uuid' }
];

export const usePixPayment = (
  setStep: (step: PaymentStep) => void,
  setLoading: (loading: boolean) => void,
  onSuccess?: () => void
) => {
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('1');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentResult, setPaymentResult] = useState<{
    batchId?: string;
    receiptUrl?: string;
    hasReceipt?: boolean;
  } | null>(null);

  const validatePixInput = (debtData: DebtDataRecord | undefined): boolean => {
    if (!pixKey.trim()) {
      toast.error('Chave PIX é obrigatória');
      return false;
    }
    if (!debtData) {
      toast.error('Dados do débito não encontrados');
      return false;
    }
    return true;
  };

  const createPaymentData = (
    debtData: DebtDataRecord,
    email: string,
    password: string,
    otp: string
  ) => {
    const selectedDate = new Date(paymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    const isScheduled = selectedDate > today;
    return {
      debtDataId: debtData.id,
      amount: Number(debtData.totalValue),
      pixKey,
      pixKeyType: Number(pixKeyType) as 1 | 2 | 3 | 4 | 5,
      description: debtData.description,
      paymentDate: paymentDate.split('-').reverse().join('-'),
      isScheduled,
      scheduledDate: isScheduled ? paymentDate : undefined,
      userEmail: email,
      userPassword: password,
      userOtp: otp
    };
  };

  const createReceiptData = async (
    debtData: DebtDataRecord,
    batchId: string
  ) => {
    const bankData = await getBankConfig();

    return {
      recipientName: debtData.description,
      recipientPixKey: pixKey,
      amount: Number(debtData.totalValue),
      description: debtData.description,
      transactionId: batchId,
      date: new Date(),
      status: 'CONCLUÍDO',
      receiptNumber: `${batchId}`,
      payerName: bankData.payerName,
      payerBank: bankData.payerBank,
      payerAgency: bankData.payerAgency,
      payerAccount: bankData.payerAccount,
      payerCnpj: bankData.payerCnpj
    };
  };

  const createScheduledReceiptData = async (
    debtData: DebtDataRecord,
    batchId: string,
    scheduledDate: string
  ) => {
    const bankData = await getBankConfig();
    return {
      recipientName: debtData.description,
      recipientPixKey: pixKey,
      amount: Number(debtData.totalValue),
      description: debtData.description,
      date: new Date(),
      status: 'AGENDADO',
      receiptNumber: `${batchId}`,
      payerName: bankData.payerName,
      payerBank: bankData.payerBank,
      payerAgency: bankData.payerAgency,
      payerAccount: bankData.payerAccount,
      payerCnpj: bankData.payerCnpj,
      scheduledDate: new Date(scheduledDate),
      createdDate: new Date(),
      batchId
    };
  };
  const handlePixKeySubmit = async (config: {
    debtData: DebtDataRecord | undefined;
    email: string;
    password: string;
    otp: string;
    stepToken: string;
  }) => {
    if (!validatePixInput(config.debtData)) return;

    setLoading(true);
    setStep(PaymentStep.PROCESSING);
    try {
      const paymentData = createPaymentData(
        config.debtData!,
        config.email,
        config.password,
        config.otp
      );
      const pixResult = await processPixPayment({
        ...paymentData,
        stepToken: config.stepToken
      });

      if (pixResult.success && pixResult.batchId) {
        let proofResult;
        if (pixResult.isScheduled && pixResult.scheduledDate) {
          const scheduledReceiptData = await createScheduledReceiptData(
            config.debtData!,
            pixResult.batchId,
            pixResult.scheduledDate
          );
          proofResult = await createScheduledPaymentProof(
            config.debtData!.id,
            scheduledReceiptData,
            pixResult.batchId
          );
        } else {
          const receiptData = await createReceiptData(
            config.debtData!,
            pixResult.batchId
          );
          proofResult = await createPaymentProof(
            config.debtData!.id,
            receiptData,
            pixResult.batchId,
            pixResult.contractNumber,
            pixResult.wasApproved
          );
        }
        setPaymentResult({
          batchId: pixResult.batchId,
          receiptUrl: proofResult.proofUrl,
          hasReceipt: proofResult.success
        });
        const successMessage = pixResult.isScheduled
          ? 'Pagamento PIX agendado com sucesso'
          : 'Pagamento PIX processado com sucesso';
        toast.success(successMessage);
        setStep(PaymentStep.DONE);
        onSuccess?.();
      } else {
        throw new Error(pixResult.error || 'Erro no processamento PIX');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro no pagamento PIX'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = () => {
    if (paymentResult?.receiptUrl)
      window.open(paymentResult.receiptUrl, '_blank');
  };

  return {
    pixKey,
    setPixKey,
    pixKeyType,
    setPixKeyType,
    paymentDate,
    setPaymentDate,
    paymentResult,
    handlePixKeySubmit,
    handleViewReceipt
  };
};
