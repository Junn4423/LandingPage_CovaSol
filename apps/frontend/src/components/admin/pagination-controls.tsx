interface PaginationControlsProps {
  start: number;
  end: number;
  total: number;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  isLoading?: boolean;
  className?: string;
}

export function PaginationControls({
  start,
  end,
  total,
  page,
  totalPages,
  onPrev,
  onNext,
  isLoading,
  className
}: PaginationControlsProps) {
  const summaryText = isLoading
    ? 'Đang tải dữ liệu...'
    : total === 0
      ? 'Không có dữ liệu để hiển thị'
      : `Hiển thị ${start}-${end} trên tổng ${total}`;

  const prevDisabled = isLoading || total === 0 || page <= 1;
  const nextDisabled = isLoading || total === 0 || page >= totalPages;
  const pageLabelPage = total === 0 ? 0 : page;
  const pageLabelTotal = total === 0 ? 0 : totalPages;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500 ${className ?? ''}`}>
      <p>{summaryText}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={prevDisabled}
          className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Trước
        </button>
        <span className="font-semibold text-slate-600">
          Trang {pageLabelPage}/{pageLabelTotal}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-lg border border-slate-200 bg-white/80 px-4 py-2 font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
