import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string; // e.g. "chuyến xe", "vé", "đơn hàng"
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  itemLabel = 'chuyến xe',
}) => {
  const [jumpPage, setJumpPage] = useState<string>('');

  if (totalItems === 0 || totalPages <= 1 && (!pageSizeOptions || pageSizeOptions.length <= 1)) {
    return null;
  }

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination items with ellipses
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage('');
    }
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 18px',
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* 1. Left: Summary & Page Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          Hiển thị{' '}
          <strong style={{ color: '#0f172a', fontWeight: 700 }}>
            {startItem} – {endItem}
          </strong>{' '}
          trong tổng số{' '}
          <strong style={{ color: '#2563eb', fontWeight: 800 }}>{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>|</span>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>Mỗi trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Center/Right: Navigation Buttons & Numbers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* First Page */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#475569',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Trang đầu"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '32px',
            padding: '0 10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#475569',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Trang trước"
        >
          <ChevronLeft size={15} />
          <span>Trước</span>
        </button>

        {/* Number Buttons */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  width: '28px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#94a3b8',
                  fontWeight: 700,
                }}
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              type="button"
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 8px',
                borderRadius: '8px',
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 4px rgba(37,99,235,0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '32px',
            padding: '0 10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage === totalPages ? '#f8fafc' : '#ffffff',
            color: currentPage === totalPages ? '#cbd5e1' : '#475569',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Trang sau"
        >
          <span>Sau</span>
          <ChevronRight size={15} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: currentPage === totalPages ? '#f8fafc' : '#ffffff',
            color: currentPage === totalPages ? '#cbd5e1' : '#475569',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Trang cuối"
        >
          <ChevronsRight size={16} />
        </button>

        {/* 3. Jump to Page Form (if more than 5 pages) */}
        {totalPages > 5 && (
          <form
            onSubmit={handleJump}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}
          >
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="Trang"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              style={{
                width: '54px',
                height: '30px',
                textAlign: 'center',
                padding: '2px 4px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                height: '30px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đi
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
