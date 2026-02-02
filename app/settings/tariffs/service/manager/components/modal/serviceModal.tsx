'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditServiceModalProps } from '@/app/settings/tariffs/service/manager/types';
import { useServiceModalState } from './serviceState';
import { ServiceForm } from './serviceForm';
import { TariffManagement } from './tariffTable';

export const EditServiceModal = ({
  service,
  open,
  onOpenChange
}: EditServiceModalProps) => {
  const {
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
  } = useServiceModalState(service);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg lg:text-xl truncate pr-2">
            Serviço - {service.name}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="service" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8 sm:h-10">
            <TabsTrigger
              value="service"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              Informações
            </TabsTrigger>
            <TabsTrigger
              value="tariffs"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              Tarifas
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="service"
            className="space-y-3 sm:space-y-4 mt-3 sm:mt-6"
          >
            <ServiceForm
              name={name}
              setName={setName}
              code={code}
              setCode={setCode}
              active={active}
              setActive={setActive}
              handleServiceUpdate={handleServiceUpdate}
              onOpenChange={onOpenChange}
              loading={loading}
            />
          </TabsContent>
          <TabsContent
            value="tariffs"
            className="space-y-3 sm:space-y-4 mt-3 sm:mt-6"
          >
            <TariffManagement
              showNewTariffForm={showNewTariffForm}
              setShowNewTariffForm={setShowNewTariffForm}
              newTariff={newTariff}
              setNewTariff={setNewTariff}
              handleAddTariff={handleAddTariff}
              tariffs={tariffs}
              handleUpdateTariff={handleUpdateTariff}
              handleDeleteTariff={handleDeleteTariff}
              startEditingTariff={startEditingTariff}
              cancelEditingTariff={cancelEditingTariff}
              updateTariffField={updateTariffField}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
