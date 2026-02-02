'use client';
import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

type ServiceOption = {
  code: string;
  name: string;
};

type ServiceComboboxProps = {
  options: ServiceOption[];
  value: string | null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  onValueChange: Function;
  disabled?: boolean;
};

export const ServiceCombobox = ({
  options,
  value,
  onValueChange,
  disabled = false
}: ServiceComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const selected = options.find((opt) => opt.code === value);
  React.useEffect(() => {
    if (triggerRef.current) setWidth(triggerRef.current.offsetWidth);
  }, [open]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal h-auto min-h-9 py-2',
            !value && 'text-muted-foreground'
          )}
        >
          {selected ? (
            <span className="flex flex-col items-start text-left">
              <span className="font-medium">{selected.code}</span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {selected.name}
              </span>
            </span>
          ) : (
            <span>Selecione o serviço</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: width || 'auto' }}>
        <Command>
          <CommandInput placeholder="Buscar serviço..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.code}
                  value={`${opt.code} ${opt.name}`}
                  onSelect={() => {
                    onValueChange(opt.code);
                    setOpen(false);
                  }}
                  className="flex items-start py-2"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 mt-0.5 shrink-0',
                      value === opt.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">{opt.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {opt.name}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
