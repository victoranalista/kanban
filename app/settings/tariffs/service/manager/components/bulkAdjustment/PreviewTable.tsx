'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { BulkAdjustmentItem } from '../../types';
import { PreviewRow } from './PreviewRow';

interface PreviewTableProps {
  items: BulkAdjustmentItem[];
  percentage: string;
  onPriceChange: (i: number, v: string) => void;
  onToggleEdit: (i: number) => void;
}

export const PreviewTable = ({
  items,
  percentage,
  onPriceChange,
  onToggleEdit
}: PreviewTableProps) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm">Preview dos Novos Valores</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Serviço</TableHead>
              <TableHead className="px-4">Código</TableHead>
              <TableHead className="px-4 text-right">Valor Atual</TableHead>
              <TableHead className="px-4 text-right">Novo Valor</TableHead>
              <TableHead className="px-4 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <PreviewRow
                key={item.serviceId}
                item={item}
                index={index}
                percentage={percentage}
                onPriceChange={onPriceChange}
                onToggleEdit={onToggleEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);
