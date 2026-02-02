'use client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { BulkServiceInput } from '@/app/settings/tariffs/utils/types';

interface BulkListProps {
  items: BulkServiceInput[];
  onRemove: (index: number) => void;
  disabled: boolean;
}

const BulkListItem = ({
  item,
  index,
  onRemove,
  disabled
}: {
  item: BulkServiceInput;
  index: number;
  onRemove: (index: number) => void;
  disabled: boolean;
}) => (
  <div className="group flex flex-col gap-1 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Badge variant="secondary" className="shrink-0 text-xs">
          {index + 1}
        </Badge>
        <span className="font-medium text-sm">{item.code}</span>
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
      {item.name}
    </p>
  </div>
);

const ListHeader = ({ count }: { count: number }) => (
  <div className="flex items-center justify-between pb-2">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Lista para criação</span>
      <Badge variant="outline">
        {count} {count === 1 ? 'serviço' : 'serviços'}
      </Badge>
    </div>
  </div>
);

export const BulkList = ({ items, onRemove, disabled }: BulkListProps) => {
  if (!items.length) return null;
  return (
    <div className="space-y-3">
      <Separator />
      <ListHeader count={items.length} />
      <ScrollArea className="h-[240px] rounded-lg border bg-muted/30 p-2">
        <div className="space-y-2">
          {items.map((item, index) => (
            <BulkListItem
              key={`${item.code}-${index}`}
              item={item}
              index={index}
              onRemove={onRemove}
              disabled={disabled}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export const isServiceInList = (code: string, items: BulkServiceInput[]) =>
  items.some((item) => item.code.toLowerCase() === code.toLowerCase());
