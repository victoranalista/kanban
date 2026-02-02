'use client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { BulkTariffInput } from '@/app/settings/tariffs/utils/types';
import { formatDate } from '@/lib/formatters';
import {
  ServiceWithApplicableFees,
  TariffBulkListProps,
  TariffBulkListItemProps
} from '@/app/settings/tariffs/utils/types';
import { formatCurrency } from '@/lib/formatters';

const getService = (serviceId: number, services: ServiceWithApplicableFees[]) =>
  services.find((s) => s.id === serviceId);

const TariffBulkListItem = ({
  item,
  index,
  services,
  onRemove,
  disabled
}: TariffBulkListItemProps) => {
  const service = getService(item.serviceId, services);
  return (
    <div className="group flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Badge variant="secondary" className="shrink-0 text-xs">
            {index + 1}
          </Badge>
          <span className="font-medium text-sm truncate">{service?.code}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={disabled}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground pl-8 break-words">
        {service?.name}
      </p>
      <div className="flex flex-wrap items-center gap-2 pl-8">
        <Badge variant="outline" className="font-mono">
          {formatCurrency(item.unitPrice)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatDate(new Date(item.validFrom))}
          {item.validTo && ` até ${formatDate(new Date(item.validTo))}`}
        </span>
      </div>
    </div>
  );
};

const ListHeader = ({ count }: { count: number }) => (
  <div className="flex items-center justify-between pb-2">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Lista para criação</span>
      <Badge variant="outline">
        {count} {count === 1 ? 'tarifa' : 'tarifas'}
      </Badge>
    </div>
  </div>
);

export const TariffBulkList = ({
  items,
  services,
  onRemove,
  disabled
}: TariffBulkListProps) => {
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      <Separator />
      <ListHeader count={items.length} />
      <ScrollArea className="h-[280px] rounded-lg border bg-muted/30 p-2">
        <div className="space-y-2">
          {items.map((item, index) => (
            <TariffBulkListItem
              key={`${item.serviceId}-${index}`}
              item={item}
              index={index}
              services={services}
              onRemove={onRemove}
              disabled={disabled}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export const isTariffInList = (serviceId: number, items: BulkTariffInput[]) =>
  items.some((item) => item.serviceId === serviceId);
