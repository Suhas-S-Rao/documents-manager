import { PageSize } from '../../types';
import { pageSizeDropdownOptions } from '../../constants';
import { Select } from './index';

interface PaginationProps {
  currentPage: number;
  pageSize: PageSize;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

const Pagination = ({ currentPage, totalItems, onPageChange, onPageSizeChange, pageSize }: PaginationProps) => {
  const pgSize = pageSize !== 'All' ? Number(pageSize) : totalItems;
  const totalPages = Math.ceil(totalItems / pgSize);

  const start = totalItems === 0 ? 0 : (Number(currentPage) - 1) * pgSize + 1;
  const end = Math.min(Number(currentPage) * pgSize, totalItems);
  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => (i + 1).toString());
    }
    const pages: string[] = [];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    pages.push('1');
    if (start > 2) {
      pages.push('...');
    }
    for (let i = start; i <= end; i++) {
      pages.push(i.toString());
    }
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages.toString());
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-calm-surface px-4 py-3 shadow-soft border-0 rounded-xl">
      <div className="text-sm text-slate-500 flex items-center justify-center gap-2">
        <div>
          Showing {start}-{end} of {totalItems} records
        </div>
        <Select value={pageSize.toString()} onChange={(value) => onPageSizeChange(value as PageSize)} options={pageSizeDropdownOptions} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Number(currentPage) - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-300 bg-calm-background px-3 py-1 text-sm text-calm-text transition hover:text-calm-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {getPages().map((p) => {
          if (p === '...') {
            return <div>...</div>;
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={`min-w-9 rounded-lg px-3 py-1 text-sm font-medium transition cursor-pointer ${
                currentPage.toString() === p
                  ? 'bg-calm-accent text-white shadow-soft hover:bg-calm-accentHover hover:shadow-glow'
                  : 'border border-slate-300 bg-calm-background text-calm-text hover:text-calm-accent'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Number(currentPage) + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-300 bg-calm-background px-3 py-1 text-sm text-calm-text transition hover:text-calm-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
export default Pagination;
