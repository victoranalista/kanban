'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface DatePickerConfig {
  label: string;
  placeholder: string;
}

interface DatePickerProps {
  config: DatePickerConfig;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}

export const DatePicker = ({ config, value, onChange }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <Label className="text-xs sm:text-sm font-medium">{config.label}</Label>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-8 sm:h-10 text-xs sm:text-sm',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDate(value) : config.placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
