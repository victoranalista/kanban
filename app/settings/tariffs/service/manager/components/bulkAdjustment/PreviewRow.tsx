'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit3, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { BulkAdjustmentItem } from '../../types';
import { applyPercentage, parsePercentage } from './tariffUtils';

interface PreviewRowProps {
  item: BulkAdjustmentItem;
  index: number;
  percentage: string;
  onPriceChange: (i: number, v: string) => void;
  onToggleEdit: (i: number) => void;
}

const formatPriceForInput = (price: number): string =>
  price.toFixed(2).replace('.', ',');

const PriceInput = ({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative w-28 ml-auto">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
      R$
    </span>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
      className="pl-8 text-sm h-8 text-right"
    />
  </div>
);

const PriceDisplayValue = ({
  price,
  isModified
}: {
  price: number;
  isModified: boolean;
}) => (
  <span className={isModified ? 'font-semibold' : ''}>
    {formatCurrency(price)}
  </span>
);

const ActionButtons = ({
  isEditing,
  onConfirm,
  onCancel,
  onEdit
}: {
  isEditing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
}) => (
  <>
    {isEditing ? (
      <>
        <Button
          size="sm"
          variant="ghost"
          onClick={onConfirm}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </>
    ) : (
      <Button
        size="sm"
        variant="ghost"
        onClick={onEdit}
        className="h-8 w-8 p-0"
      >
        <Edit3 className="h-4 w-4" />
      </Button>
    )}
  </>
);

export const PreviewRow = ({
  item,
  index,
  percentage,
  onPriceChange,
  onToggleEdit
}: PreviewRowProps) => {
  const [editValue, setEditValue] = useState(
    formatPriceForInput(item.newPrice)
  );
  const expected = applyPercentage(
    item.currentPrice,
    parsePercentage(percentage)
  );
  const isModified = item.newPrice !== expected;
  const handleConfirm = () => {
    onPriceChange(index, editValue);
    onToggleEdit(index);
  };
  const handleCancel = () => {
    setEditValue(formatPriceForInput(item.newPrice));
    onToggleEdit(index);
  };
  const handleEdit = () => {
    setEditValue(formatPriceForInput(item.newPrice));
    onToggleEdit(index);
  };
  return (
    <TableRow>
      <TableCell className="px-4 font-medium">{item.serviceName}</TableCell>
      <TableCell className="px-4 text-muted-foreground font-mono text-sm">
        {item.serviceCode}
      </TableCell>
      <TableCell className="px-4 text-right">
        {formatCurrency(item.currentPrice)}
      </TableCell>
      <TableCell className="px-4 text-right">
        {item.isEditing ? (
          <PriceInput value={editValue} onChange={setEditValue} />
        ) : (
          <PriceDisplayValue price={item.newPrice} isModified={isModified} />
        )}
      </TableCell>
      <TableCell className="px-4 text-center">
        <ActionButtons
          isEditing={item.isEditing}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onEdit={handleEdit}
        />
      </TableCell>
    </TableRow>
  );
};
