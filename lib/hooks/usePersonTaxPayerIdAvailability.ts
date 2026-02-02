import { useCallback, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues, EditFormValues } from '../../app/settings/users/types';
import { validateCpf } from '@/lib/validators';
import debounce from 'lodash.debounce';
import { checkTaxpayerIdAvailability } from '@/app/settings/users/availability/actions';
import { Role } from '@prisma/client';

type SetErrorFn = (message: string) => void;
type ClearErrorsFn = () => void;

const createValidator = (
  setErr: SetErrorFn,
  clearErr: ClearErrorsFn,
  hasInteracted: () => boolean,
  excludeUserId?: number
) =>
  debounce(async (val: string, role: Role) => {
    if (!validateCpf(val) && hasInteracted()) {
      setErr('CPF inválido');
      return;
    }
    if (!hasInteracted()) return;
    try {
      const { available, message } = await checkTaxpayerIdAvailability(
        val,
        role,
        excludeUserId
      );
      if (!available) setErr(message ?? 'CPF indisponível');
      else clearErr();
    } catch {
      setErr('Erro ao verificar disponibilidade');
    }
  }, 900);

export const usePersonTaxPayerIdAvailability = (
  methods: UseFormReturn<UserFormValues>
) => {
  const {
    watch,
    setError,
    clearErrors,
    formState: { touchedFields, dirtyFields }
  } = methods;
  const taxpayerIdValue = watch('taxpayerId') || '';
  const roleValue = watch('role');
  const setErr: SetErrorFn = useCallback(
    (message) => setError('taxpayerId', { type: 'manual', message }),
    [setError]
  );
  const clearErr: ClearErrorsFn = useCallback(
    () => clearErrors('taxpayerId'),
    [clearErrors]
  );
  const hasInteracted = useCallback(
    () => !!(touchedFields.taxpayerId || dirtyFields.taxpayerId),
    [touchedFields.taxpayerId, dirtyFields.taxpayerId]
  );
  const validate = useMemo(
    () => createValidator(setErr, clearErr, hasInteracted),
    [setErr, clearErr, hasInteracted]
  );
  useEffect(() => {
    validate(taxpayerIdValue, roleValue);
    return () => validate.cancel();
  }, [taxpayerIdValue, roleValue, validate]);
};

export const useEditPersonTaxPayerIdAvailability = (
  methods: UseFormReturn<EditFormValues>,
  excludeUserId?: number
) => {
  const {
    watch,
    setError,
    clearErrors,
    formState: { touchedFields, dirtyFields }
  } = methods;
  const taxpayerIdValue = watch('taxpayerId') || '';
  const roleValue = watch('role');
  const setErr: SetErrorFn = useCallback(
    (message) => setError('taxpayerId', { type: 'manual', message }),
    [setError]
  );
  const clearErr: ClearErrorsFn = useCallback(
    () => clearErrors('taxpayerId'),
    [clearErrors]
  );
  const hasInteracted = useCallback(
    () => !!(touchedFields.taxpayerId || dirtyFields.taxpayerId),
    [touchedFields.taxpayerId, dirtyFields.taxpayerId]
  );
  const validate = useMemo(
    () => createValidator(setErr, clearErr, hasInteracted, excludeUserId),
    [setErr, clearErr, hasInteracted, excludeUserId]
  );
  useEffect(() => {
    validate(taxpayerIdValue, roleValue);
    return () => validate.cancel();
  }, [taxpayerIdValue, roleValue, validate]);
};

export default usePersonTaxPayerIdAvailability;
