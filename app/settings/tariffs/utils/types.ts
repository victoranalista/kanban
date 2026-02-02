export interface BulkServiceInput {
  code: string;
  name: string;
}

interface BulkServiceConflict {
  code: string;
  name: string;
}

export interface BulkCreateServicesResult {
  success: boolean;
  conflicts?: BulkServiceConflict[];
  message?: string;
}

export interface BulkTariffInput {
  serviceId: number;
  unitPrice: number;
  validFrom: string;
  validTo: string | null;
}

export interface BulkTariffConflict {
  serviceId: number;
  serviceCode: string;
  existingPrice: number;
  validFrom: string;
  validTo: string | null;
}

export interface BulkCreateTariffsResult {
  success: boolean;
  conflicts?: BulkTariffConflict[];
  message?: string;
}

export interface ServiceWithApplicableFees {
  id: number;
  name: string;
  code: string;
}

export interface TariffBulkListProps {
  items: BulkTariffInput[];
  services: ServiceWithApplicableFees[];
  onRemove: (index: number) => void;
  disabled: boolean;
}

export interface CreateServiceTariffFormProps {
  services: ServiceWithApplicableFees[];
}

export interface TariffBulkListItemProps {
  item: BulkTariffInput;
  index: number;
  services: ServiceWithApplicableFees[];
  onRemove: (index: number) => void;
  disabled: boolean;
}
