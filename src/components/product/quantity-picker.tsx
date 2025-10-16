'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuantityPicker({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">
      <Button size="icon" variant="ghost" onClick={() => onChange(Math.max(1, value - 1))}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center text-sm font-semibold text-white">{value}</span>
      <Button size="icon" variant="ghost" onClick={() => onChange(value + 1)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
