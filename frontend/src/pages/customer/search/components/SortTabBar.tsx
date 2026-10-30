import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { ArrowDownUp, Clock, TrendingDown, TrendingUp, Star } from 'lucide-react';

export type SortOption =
  | 'DEFAULT'
  | 'EARLIEST'
  | 'LATEST'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'RATING_DESC';

interface Props {
  currentSort: SortOption;
  onChangeSort: (sort: SortOption) => void;
  resultCount: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

export const SortTabBar: React.FC<Props> = ({
  currentSort,
  onChangeSort,
  resultCount,
  currentPage,
  pageSize,
  totalPages,
}) => {
  const { isDark } = useTheme();
  const tabs = [
    { id: 'DEFAULT' as SortOption, label: 'Mặc định', icon: ArrowDownUp },
    { id: 'EARLIEST' as SortOption, label: 'Giờ đi sớm nhất', icon: Clock },
    { id: 'LATEST' as SortOption, label: 'Giờ đi muộn nhất', icon: Clock },
    { id: 'PRICE_ASC' as SortOption, label: 'Giá tăng dần', icon: TrendingUp },
    { id: 'PRICE_DESC' as SortOption, label: 'Giá giảm dần', icon: TrendingDown },
    { id: 'RATING_DESC' as SortOption, label: 'Đánh giá cao nhất', icon: Star },
  ];

  return (
    <div
      style={{
        backgroundColor: isDark ? '#111827' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginRight: '4px' }}>
          Sắp xếp theo:
        </span>
        {tabs.map((tab) => {
          const isActive = currentSort === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeSort(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                border: isActive
                  ? `1px solid ${isDark ? '#38bdf8' : '#2563eb'}`
                  : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                backgroundColor: isActive
                  ? (isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff')
                  : (isDark ? '#0f172a' : '#ffffff'),
                color: isActive
                  ? (isDark ? '#38bdf8' : '#2563eb')
                  : (isDark ? '#94a3b8' : '#64748b'),
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
        {currentPage && pageSize && totalPages && resultCount > 0 ? (
          <>
            Hiển thị{' '}
            <span style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800 }}>
              {Math.min((currentPage - 1) * pageSize + 1, resultCount)} –{' '}
              {Math.min(currentPage * pageSize, resultCount)}
            </span>{' '}
            / <span style={{ color: isDark ? '#38bdf8' : '#2563eb', fontWeight: 800 }}>{resultCount}</span> chuyến{' '}
            <span
              style={{
                marginLeft: '6px',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                color: isDark ? '#38bdf8' : '#2563eb',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              Trang {currentPage}/{totalPages}
            </span>
          </>
        ) : (
          <>
            Hiển thị <span style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 800 }}>{resultCount}</span> chuyến
          </>
        )}
      </div>
    </div>
  );
};

