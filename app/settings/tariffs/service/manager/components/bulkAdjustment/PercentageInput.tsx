'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPercentageInput } from './tariffUtils';

interface PercentageInputProps {
  value: string;
  onChange: (v: string) => void;
}

export const PercentageInput = ({ value, onChange }: PercentageInputProps) => (
  <div className="space-y-1.5 sm:space-y-2">
    <Label className="text-xs sm:text-sm font-medium">
      Porcentagem de Ajuste
    </Label>
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(formatPercentageInput(e.target.value))}
        placeholder="Ex: 5,5"
        className="pr-8 h-8 sm:h-10 text-xs sm:text-sm"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
        %
      </span>
    </div>
    <p className="text-xs text-muted-foreground">Use vírgula para decimais.</p>
  </div>
);
