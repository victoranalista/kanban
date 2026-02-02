import { Service, ServiceTariff } from '@prisma/client';

export interface EditServiceModalProps {
  service: ServiceConverted;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TariffFormData {
  id?: number;
  unitPrice: string;
  validFrom: Date | undefined;
  validTo: Date | undefined;
  isNew?: boolean;
  isEditing?: boolean;
}

export interface ServiceFormProps {
  name: string;
  setName: (name: string) => void;
  code: string;
  setCode: (code: string) => void;
  active: boolean;
  setActive: (active: boolean) => void;
  handleServiceUpdate: () => void;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
}

export interface TariffManagementProps {
  showNewTariffForm: boolean;
  setShowNewTariffForm: (show: boolean) => void;
  newTariff: TariffFormData;
  setNewTariff: (tariff: TariffFormData) => void;
  handleAddTariff: () => void;
  tariffs: TariffFormData[];
  handleUpdateTariff: (index: number) => void;
  handleDeleteTariff: (id: number) => void;
  startEditingTariff: (index: number) => void;
  cancelEditingTariff: (index: number) => void;
  updateTariffField: (
    index: number,
    field: keyof TariffFormData,
    value: string | Date | undefined
  ) => void;
  loading: boolean;
}

export interface TariffFormProps {
  newTariff: TariffFormData;
  setNewTariff: (tariff: TariffFormData) => void;
  handleAddTariff: () => void;
  setShowNewTariffForm: (show: boolean) => void;
  loading: boolean;
}

export type ServiceTariffConverted = Omit<
  ServiceTariff,
  | 'unitPrice'
  | 'adjustmentPercent'
  | 'validFrom'
  | 'validTo'
  | 'createdAt'
  | 'updatedAt'
> & {
  unitPrice: number;
  adjustmentPercent: number | null;
  validFrom: string;
  validTo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceConverted = Omit<Service, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  serviceTariffs: ServiceTariffConverted[];
};

export interface BulkAdjustmentItem {
  serviceId: number;
  serviceName: string;
  serviceCode: string;
  currentPrice: number;
  currentTariffId: number | null;
  newPrice: number;
  isEditing: boolean;
}

export interface BulkAdjustmentDialogProps {
  services: ServiceConverted[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
