import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ServiceFormProps } from '@/app/settings/tariffs/service/manager/types';

export const ServiceForm = ({
  name,
  setName,
  code,
  setCode,
  active,
  setActive,
  handleServiceUpdate,
  onOpenChange,
  loading
}: ServiceFormProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
            Nome
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs sm:text-sm h-8 sm:h-10"
            placeholder="Nome do serviço"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="code" className="text-xs sm:text-sm font-medium">
            Código do Serviço
          </Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-xs sm:text-sm h-8 sm:h-10"
            placeholder="Código do serviço"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="active" className="text-xs sm:text-sm font-medium">
          Status do Serviço
        </Label>
        <div className="flex items-center gap-2">
          <Switch
            id="active"
            checked={active}
            onCheckedChange={setActive}
            className="scale-90 sm:scale-100"
          />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto text-xs sm:text-sm"
          size="sm"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleServiceUpdate}
          disabled={loading}
          className="w-full sm:w-auto text-xs sm:text-sm"
          size="sm"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};
