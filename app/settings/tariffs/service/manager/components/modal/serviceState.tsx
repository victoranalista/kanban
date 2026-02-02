'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateService } from '@/app/settings/tariffs/service/actions/service-actions';
import {
  createServiceTariff,
  updateServiceTariff,
  deleteServiceTariff
} from '@/app/settings/tariffs/service-tariff/actions/tariff-actions';
import {
  ServiceConverted,
  TariffFormData
} from '@/app/settings/tariffs/service/manager/types';

export const useServiceModalState = (service: ServiceConverted) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(service.name);
  const [code, setCode] = useState(service.code);
  const [active, setActive] = useState(service.active);
  const [tariffs, setTariffs] = useState<TariffFormData[]>(
    service.serviceTariffs.map((tariff) => ({
      id: tariff.id,
      unitPrice: tariff.unitPrice.toString(),
      validFrom: new Date(tariff.validFrom),
      validTo: tariff.validTo ? new Date(tariff.validTo) : undefined
    }))
  );
  const [showNewTariffForm, setShowNewTariffForm] = useState(false);
  const [newTariff, setNewTariff] = useState<TariffFormData>({
    unitPrice: '',
    validFrom: new Date(),
    validTo: undefined,
    isNew: true
  });
  const handleServiceUpdate = async () => {
    if (!name || !code) {
      toast.error('Preencha todos os campos obrigatórios do serviço');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('code', code);
      formData.append('active', active.toString());
      await updateService(service.id, formData);
      toast.success('Serviço atualizado com sucesso!');
      window.location.reload();
    } catch {
      toast.error(
        'Não foi possível atualizar o serviço. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };
  const handleAddTariff = async () => {
    if (!newTariff.unitPrice || !newTariff.validFrom) {
      toast.error('Preencha todos os campos obrigatórios da tarifa');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('serviceId', service.id.toString());
      formData.append('unitPrice', newTariff.unitPrice);
      if (newTariff.validFrom)
        formData.append('validFrom', newTariff.validFrom.toISOString());
      if (newTariff.validTo)
        formData.append('validTo', newTariff.validTo.toISOString());
      await createServiceTariff(formData);
      setNewTariff({
        unitPrice: '',
        validFrom: new Date(),
        validTo: undefined,
        isNew: true
      });
      setShowNewTariffForm(false);
      toast.success('Tarifa adicionada com sucesso!');
      window.location.reload();
    } catch {
      toast.error(
        'Não foi possível adicionar a tarifa. Verifique se já existe tarifa neste período.'
      );
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateTariff = async (tariffIndex: number) => {
    const tariff = tariffs[tariffIndex];
    if (!tariff.unitPrice || !tariff.validFrom || !tariff.id) {
      toast.error('Preencha todos os campos obrigatórios da tarifa');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('unitPrice', tariff.unitPrice);
      if (tariff.validFrom)
        formData.append('validFrom', tariff.validFrom.toISOString());
      if (tariff.validTo)
        formData.append('validTo', tariff.validTo.toISOString());
      await updateServiceTariff(tariff.id, formData);
      const updatedTariffs = [...tariffs];
      updatedTariffs[tariffIndex].isEditing = false;
      setTariffs(updatedTariffs);
      toast.success('Tarifa atualizada com sucesso!');
      window.location.reload();
    } catch {
      toast.error(
        'Não foi possível atualizar a tarifa. Verifique se há conflito de vigência.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTariff = async (tariffId: number) => {
    setLoading(true);
    try {
      await deleteServiceTariff(tariffId);
      setTariffs(tariffs.filter((t) => t.id !== tariffId));
      toast.success('Tarifa excluída com sucesso!');
      window.location.reload();
    } catch {
      toast.error('Não foi possível excluir a tarifa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const startEditingTariff = (index: number) => {
    const updatedTariffs = [...tariffs];
    updatedTariffs[index].isEditing = true;
    setTariffs(updatedTariffs);
  };

  const cancelEditingTariff = (index: number) => {
    const updatedTariffs = [...tariffs];
    updatedTariffs[index].isEditing = false;
    const originalTariff = service.serviceTariffs.find(
      (t) => t.id === updatedTariffs[index].id
    );
    if (originalTariff) {
      updatedTariffs[index] = {
        id: originalTariff.id,
        unitPrice: originalTariff.unitPrice.toString(),
        validFrom: new Date(originalTariff.validFrom),
        validTo: originalTariff.validTo
          ? new Date(originalTariff.validTo)
          : undefined
      };
    }
    setTariffs(updatedTariffs);
  };

  const updateTariffField = (
    index: number,
    field: keyof TariffFormData,
    value: string | Date | undefined
  ) => {
    const updatedTariffs = [...tariffs];
    updatedTariffs[index] = { ...updatedTariffs[index], [field]: value };
    setTariffs(updatedTariffs);
  };
  return {
    loading,
    name,
    setName,
    code,
    setCode,
    active,
    setActive,
    tariffs,
    showNewTariffForm,
    setShowNewTariffForm,
    newTariff,
    setNewTariff,
    handleServiceUpdate,
    handleAddTariff,
    handleUpdateTariff,
    handleDeleteTariff,
    startEditingTariff,
    cancelEditingTariff,
    updateTariffField
  };
};
