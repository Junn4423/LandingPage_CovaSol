import { useEffect, useMemo, useState } from 'react';

interface UsePaginationOptions {
  pageSize?: number;
}

export function useClientPagination<T>(items: T[] | undefined, options?: UsePaginationOptions) {
  const dataset = items ?? [];
  const pageSize = options?.pageSize ?? 10;
  const [pageState, setPageState] = useState(1);
  const hasData = dataset.length > 0;
  const derivedTotalPages = hasData ? Math.ceil(dataset.length / pageSize) : 1;
  const safePage = hasData ? Math.min(pageState, derivedTotalPages) : 1;

  const pageItems = useMemo(() => {
    if (!hasData) return [];
    const start = (safePage - 1) * pageSize;
    return dataset.slice(start, start + pageSize);
  }, [dataset, hasData, safePage, pageSize]);

  useEffect(() => {
    setPageState(1);
  }, [dataset.length]);

  function goToPage(nextPage: number) {
    if (!hasData) return;
    setPageState(Math.min(Math.max(1, nextPage), derivedTotalPages));
  }

  function goToPrev() {
    if (!hasData) return;
    setPageState(prev => Math.max(prev - 1, 1));
  }

  function goToNext() {
    if (!hasData) return;
    setPageState(prev => Math.min(prev + 1, derivedTotalPages));
  }

  const startIndex = hasData ? (safePage - 1) * pageSize + 1 : 0;
  const endIndex = hasData ? Math.min(safePage * pageSize, dataset.length) : 0;

  return {
    items: pageItems,
    page: hasData ? safePage : 0,
    totalPages: hasData ? derivedTotalPages : 0,
    totalItems: dataset.length,
    pageSize,
    startIndex,
    endIndex,
    hasData,
    goToPage,
    goToPrev,
    goToNext
  };
}
