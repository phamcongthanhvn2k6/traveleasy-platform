import React from 'react';
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
}

export const SortTabBar: React.FC<Props> = ({ currentSort, onChangeSort, resultCount }) => {
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
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginRight: '4px' }}>
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
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#2563eb' : '#64748b',
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

      <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
        Hiển thị <span style={{ color: '#0f172a', fontWeight: 800 }}>{resultCount}</span> chuyến
      </div>
    </div>
  );
};

