function isValidCpfOrCnpj(input: string): boolean {
  const cleanInput = input.replace(/[^\d]/g, '');
  if (cleanInput.length === 11) return validateCpf(cleanInput);
  else if (cleanInput.length === 14) return validateCnpj(cleanInput);
  return false;
}

function validateCpf(cpf: string): boolean {
  if (/^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf[10]);
}

function validateCnpj(cnpj: string): boolean {
  if (/^(\d)\1+$/.test(cnpj)) return false;
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) sum += parseInt(numbers[size - i]) * pos--;
  if (pos < 2) pos = 9;
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits[0])) return false;
  size += 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) sum += parseInt(numbers[size - i]) * pos--;
  if (pos < 2) pos = 9;
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits[1]);
}

const isValidPixKey = (key: string): boolean => {
  const clean = key.replace(/[^\d]/g, '');
  if (clean.length === 11) return validateCpf(clean);
  if (clean.length === 14) return validateCnpj(clean);
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(key)) return true;
  if (/^\+55\d{10,11}$/.test(key.replace(/\s/g, ''))) return true;
  if (
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)
  )
    return true;
  return false;
};

const isValidTxid = (txid: string): boolean =>
  /^[a-zA-Z0-9]{26,35}$/.test(txid);

const isValidFutureDateWithinDays =
  (maxDays: number) =>
  (dateStr: string): boolean => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDays);
    return date >= today && date <= maxDate;
  };

const normalizeDocument = (doc: string): string | null => {
  const clean = doc.replace(/[^\d]/g, '');
  if (clean.length !== 11 && clean.length !== 14) return null;
  if (!isValidCpfOrCnpj(clean)) return null;
  return clean;
};

const isValidNanoid = (id: string): boolean => /^[a-zA-Z0-9_-]{10}$/.test(id);

const isValidCuid = (id: string): boolean => /^c[a-z0-9]{24}$/.test(id);

const isValidSellerId = (id: string): boolean =>
  isValidNanoid(id) || isValidCuid(id);

const VALID_UF_CODES = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO'
]);

const isValidUf = (uf: string): boolean => VALID_UF_CODES.has(uf.toUpperCase());

const isValidCep = (cep: string): boolean => {
  const clean = cep.replace(/[^\d]/g, '');
  return clean.length === 8 && /^[0-9]{8}$/.test(clean);
};

const isValidStateOrRegion = (value: string): boolean => {
  if (value.length === 2) return isValidUf(value);
  return value.length >= 2 && value.length <= 50;
};

const isValidPostalCode = (value: string): boolean => {
  const clean = value.replace(/[^\d]/g, '');
  if (clean.length === 8) return isValidCep(value);
  return value.length >= 4 && value.length <= 20;
};

export {
  isValidCpfOrCnpj,
  validateCpf,
  validateCnpj,
  isValidPixKey,
  isValidTxid,
  isValidFutureDateWithinDays,
  normalizeDocument,
  isValidSellerId,
  isValidPostalCode,
  isValidStateOrRegion
};
