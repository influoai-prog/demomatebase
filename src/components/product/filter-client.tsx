'use client';

import { useState } from 'react';
import { FilterPanel, type FilterState } from './filter-panel';

export function FilterClient({
  initial,
}: {
  initial: Partial<FilterState>;
}) {
  const [filters, setFilters] = useState<FilterState>({
    categories: initial.categories ?? [],
    sort: initial.sort ?? 'popularity',
    search: initial.search ?? '',
    inStock: initial.inStock ?? false,
    min: initial.min ?? 0,
    max: initial.max ?? 500
  });

  const apply = (next: FilterState) => {
    const params = new URLSearchParams();
    if (next.search) params.set('q', next.search);
    if (next.inStock) params.set('stock', 'in');
    next.categories.forEach((category) => params.append('category', category));
    if (next.min) params.set('min', String(next.min));
    if (next.max && next.max !== 500) params.set('max', String(next.max));
    if (next.sort) params.set('sort', next.sort);
    window.location.search = params.toString();
  };

  return <FilterPanel onApply={apply} filters={filters} setFilters={setFilters} />;
}
