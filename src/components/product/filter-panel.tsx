'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const categoryOptions = [
  { label: 'Clothing', value: 'clothing' },
  { label: 'Food', value: 'food' },
  { label: 'Gifts', value: 'gifts' },
  { label: 'Erotic', value: 'erotic' }
];

const sortOptions = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'New', value: 'new' },
  { label: 'Price ↑', value: 'price-asc' },
  { label: 'Price ↓', value: 'price-desc' }
];

export type FilterState = {
  categories: string[];
  sort: string;
  search: string;
  inStock: boolean;
  min: number;
  max: number;
};

export function FilterPanel({
  onApply,
  filters,
  setFilters,
}: {
  onApply: (filters: FilterState) => void;
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
}) {
  const toggleCategory = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((item) => item !== value)
        : [...prev.categories, value]
    }));
  };

  const apply = () => onApply(filters);

  return (
    <div className="glass-card flex flex-col gap-6 p-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Categories</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleCategory(option.value)}
              className={cn(
                'rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-white/40 hover:text-white',
                filters.categories.includes(option.value) && 'bg-white/20 text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Price (USD)</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input
            type="number"
            min={0}
            value={filters.min}
            onChange={(event) => setFilters((prev) => ({ ...prev, min: Number(event.target.value) }))}
            placeholder="Min"
          />
          <Input
            type="number"
            min={0}
            value={filters.max}
            onChange={(event) => setFilters((prev) => ({ ...prev, max: Number(event.target.value) }))}
            placeholder="Max"
          />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-white/20 bg-white/10 accent-white"
            checked={filters.inStock}
            onChange={(event) => setFilters((prev) => ({ ...prev, inStock: event.target.checked }))}
          />
          In Stock Only
        </label>
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Sort</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, sort: option.value }))}
              className={cn(
                'rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/40 hover:text-white',
                filters.sort === option.value && 'bg-white/20 text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={apply} className="rounded-full">Apply Filters</Button>
    </div>
  );
}
