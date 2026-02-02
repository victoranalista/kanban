import { Role, ActivationStatus } from '@prisma/client';

export type RoleLabel = 'Admin' | 'Usuário' | 'API';
export type StatusLabel = 'Ativo' | 'Inativo';

export interface IUser {
  id: number;
  cpf: string;
  name: string;
  email: string;
  role: RoleLabel;
  status: StatusLabel;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: Exclude<Role, 'API'>;
  status: ActivationStatus;
  taxpayerId?: string;
  password?: string;
}

export interface Field {
  name: keyof UserFormValues;
  label: string;
  type: 'text' | 'email' | 'password' | 'select';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface UsersTableClientProps {
  usersData: IUser[];
}

export interface EditFormValues {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: Exclude<Role, 'API'>;
  status: ActivationStatus;
  taxpayerId: string;
  password?: string;
}

export interface FieldEdit {
  name: keyof EditFormValues;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'hidden';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface UpdateUserDataInput {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: ActivationStatus;
  taxpayerId: string;
  password?: string;
}

export interface IAvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface BulkParams {
  userHistoryIds: number[];
}

export interface ICheckResult {
  id: number;
  version: number;
  userId: number;
  name: string;
  email: string;
  role: Role;
  status: ActivationStatus;
}

export interface ICheckResultInternal extends ICheckResult {
  password: string | undefined | null;
  taxpayerId: string;
}
