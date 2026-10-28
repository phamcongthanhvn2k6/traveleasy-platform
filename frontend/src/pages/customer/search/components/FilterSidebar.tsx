import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Bus,
  Building2,
  Star,
  Sparkles,
  ShieldCheck,
  Zap,
  MapPin,
  RotateCcw,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import { SortOption } from './SortTabBar';

export interface FilterState {
  timeRange: [number, number]; // [0, 24] hours
  timeSlots: string[]; // 'EARLY', 'MORNING', 'AFTERNOON', 'EVENING'
  priceRanges: string[]; // 'UNDER_300', 'FROM_300_TO_400', 'OVER_400'
  busTypes: string[]; // 'LIMOUSINE', 'SLEEPER', 'SEAT'
  companies: string[];
  pickupPoints: string[];
  dropoffPoints: string[];
  minRating: number | null; // 4.0 or 4.5
  popularTags: string[]; // 'XE_XIN', 'INSTANT_CONFIRM', 'MONEY_BACK_150'
}

export interface FacetCounts {
  under300Count: number;
  from300to400Count: number;
  over400Count: number;
  earlyCount: number;
  morningCount: number;
  afternoonCount: number;
  eveningCount: number;
  xeXinCount: number;
  instantCount: number;
  moneyBackCount: number;
  rating45Count: number;
  rating40Count: number;
}

interface Props {
  filters: FilterState;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableCompanies: { name: string; count: number }[];
  availablePickupPoints: { name: string; count: number }[];
  availableDropoffPoints: { name: string; count: number }[];
  availableBusTypes: { type: string; name: string; count: number }[];
  facetCounts: FacetCounts;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<Props> = ({
  filters,
  sortOption,
  onSortChange,
  availableCompanies,
  availablePickupPoints,
  availableDropoffPoints,
  availableBusTypes,
  facetCounts,
  onChange,
  onReset,
}) => {
  // Accordion Expand/Collapse State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    time: true,
    popular: true,
    company: true,
    pickup: true,
    dropoff: true,
    price: true,
    rating: true,
    busType: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatHourString = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(h)}:${pad(m)}`;
  };

  const handleTimeRangeChange = (index: 0 | 1, value: number) => {
    const next: [number, number] = [...filters.timeRange];
    if (index === 0) {
      next[0] = Math.min(value, next[1]);
    } else {
      next[1] = Math.max(value, next[0]);
    }
    onChange({ ...filters, timeRange: next });
  };

  const toggleTimeSlot = (slot: string) => {
    const next = filters.timeSlots.includes(slot)
      ? filters.timeSlots.filter((s) => s !== slot)
      : [...filters.timeSlots, slot];
    onChange({ ...filters, timeSlots: next });
  };

  const toggleCompany = (company: string) => {
    const next = filters.companies.includes(company)
      ? filters.companies.filter((c) => c !== company)
      : [...filters.companies, company];
    onChange({ ...filters, companies: next });
  };

  const togglePickupPoint = (point: string) => {
    const next = filters.pickupPoints.includes(point)
      ? filters.pickupPoints.filter((p) => p !== point)
      : [...filters.pickupPoints, point];
    onChange({ ...filters, pickupPoints: next });
  };

  const toggleDropoffPoint = (point: string) => {
    const next = filters.dropoffPoints.includes(point)
      ? filters.dropoffPoints.filter((p) => p !== point)
      : [...filters.dropoffPoints, point];
    onChange({ ...filters, dropoffPoints: next });
  };

  const togglePriceRange = (range: string) => {
    const next = filters.priceRanges.includes(range)
      ? filters.priceRanges.filter((r) => r !== range)
      : [...filters.priceRanges, range];
    onChange({ ...filters, priceRanges: next });
  };

  const toggleBusType = (type: string) => {
    const next = filters.busTypes.includes(type)
      ? filters.busTypes.filter((t) => t !== type)
      : [...filters.busTypes, type];
    onChange({ ...filters, busTypes: next });
  };

  const togglePopularTag = (tag: string) => {
    const next = filters.popularTags.includes(tag)
      ? filters.popularTags.filter((t) => t !== tag)
      : [...filters.popularTags, tag];
    onChange({ ...filters, popularTags: next });
  };

  const hasActiveFilters =
    filters.timeRange[0] > 0 ||
    filters.timeRange[1] < 24 ||
    filters.timeSlots.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.busTypes.length > 0 ||
    filters.companies.length > 0 ||
    filters.pickupPoints.length > 0 ||
    filters.dropoffPoints.length > 0 ||
    filters.minRating !== null ||
    filters.popularTags.length > 0;

  const sortItems = [
    { id: 'DEFAULT' as SortOption, label: 'Mặc định' },
    { id: 'EARLIEST' as SortOption, label: 'Giờ đi sớm nhất' },
    { id: 'LATEST' as SortOption, label: 'Giờ đi muộn nhất' },
    { id: 'RATING_DESC' as SortOption, label: 'Đánh giá cao nhất' },
    { id: 'PRICE_ASC' as SortOption, label: 'Giá tăng dần' },
    { id: 'PRICE_DESC' as SortOption, label: 'Giá giảm dần' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 18px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        color: '#1e293b',
        fontSize: '13.5px',
      }}
    >
      {/* =========================================================================
          KHỐI 1: SẮP XẾP (SORTING RADIO GROUP)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('sort')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
            Sắp xếp
          </span>
          {openSections.sort ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.sort && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortItems.map((item) => {
              const isSelected = sortOption === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSortChange(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '2px 0',
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid #2563eb' : '2px solid #94a3b8',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '13.5px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#1d4ed8' : '#334155',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '16px 0 20px 0' }} />

      {/* =========================================================================
          TIÊU ĐỀ LỌC & NÚT XÓA LỌC
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="#2563eb" />
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Lọc</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '2px 4px',
            }}
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* =========================================================================
          MỤC 1: GIỜ ĐI (DUAL SLIDER + INPUTS)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('time')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Giờ đi</span>
          {openSections.time ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.time && (
          <div>
            {/* Visual Dual Slider Track */}
            <div style={{ padding: '0 4px', marginBottom: '14px' }}>
              <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
                  value={filters.timeRange[0]}
                  onChange={(e) => handleTimeRangeChange(0, parseFloat(e.target.value))}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    pointerEvents: 'auto',
                    accentColor: '#2563eb',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
                  value={filters.timeRange[1]}
                  onChange={(e) => handleTimeRangeChange(1, parseFloat(e.target.value))}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    pointerEvents: 'auto',
                    accentColor: '#2563eb',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* 2 Time Boxes: Từ [00:00] - Đến [24:00] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  flex: 1,
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Từ</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  {formatHourString(filters.timeRange[0])}
                </div>
              </div>

              <span style={{ color: '#94a3b8', fontWeight: 700 }}>-</span>

              <div
                style={{
                  flex: 1,
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Đến</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  {formatHourString(filters.timeRange[1])}
                </div>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { id: 'EARLY', label: 'Sáng sớm (00-06h)', count: facetCounts.earlyCount },
                { id: 'MORNING', label: 'Buổi sáng (06-12h)', count: facetCounts.morningCount },
                { id: 'AFTERNOON', label: 'Buổi chiều (12-18h)', count: facetCounts.afternoonCount },
                { id: 'EVENING', label: 'Buổi tối (18-24h)', count: facetCounts.eveningCount },
              ].map((slot) => {
                const isActive = filters.timeSlots.includes(slot.id);
                return (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => toggleTimeSlot(slot.id)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                      color: isActive ? '#1d4ed8' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {slot.label} {slot.count > 0 && `(${slot.count})`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 2: TIÊU CHÍ PHỔ BIẾN (POPULAR TAGS: ✨ XE XỊN 💺)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('popular')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
            Tiêu chí phổ biến
          </span>
          {openSections.popular ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.popular && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Tag 1: Xe Xịn (Giống hệt ảnh đính kèm) */}
            <div
              onClick={() => togglePopularTag('XE_XIN')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={filters.popularTags.includes('XE_XIN')}
                  onChange={() => {}}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      letterSpacing: '0.3px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(217, 119, 6, 0.25)',
                    }}
                  >
                    ✨ Xe Xịn 💺
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    ({facetCounts.xeXinCount})
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  marginTop: '4px',
                  paddingLeft: '26px',
                  lineHeight: '1.4',
                }}
              >
                Chuyến chất lượng cao, đánh giá trên 4 sao và xác nhận ngay sau khi đặt
              </div>
            </div>

            {/* Tag 2: Xác nhận tức thì */}
            <div
              onClick={() => togglePopularTag('INSTANT_CONFIRM')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={filters.popularTags.includes('INSTANT_CONFIRM')}
                  onChange={() => {}}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                    }}
                  >
                    ⚡ Xác nhận tức thì
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    ({facetCounts.instantCount})
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  marginTop: '4px',
                  paddingLeft: '26px',
                  lineHeight: '1.4',
                }}
              >
                Vé phát hành tự động qua mã QR ngay lập tức, không chờ duyệt
              </div>
            </div>

            {/* Tag 3: Cam kết hoàn 150% */}
            <div
              onClick={() => togglePopularTag('MONEY_BACK_150')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={filters.popularTags.includes('MONEY_BACK_150')}
                  onChange={() => {}}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                    }}
                  >
                    🛡️ Cam kết hoàn 150%
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    ({facetCounts.moneyBackCount})
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  marginTop: '4px',
                  paddingLeft: '26px',
                  lineHeight: '1.4',
                }}
              >
                Bồi thường 150% tiền vé nếu nhà xe không cung cấp dịch vụ vận chuyển
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 3: NHÀ XE (BUS COMPANIES)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('company')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Nhà xe</span>
          {openSections.company ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.company && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableCompanies.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có nhà xe</div>
            ) : (
              availableCompanies.map((c) => {
                const isChecked = filters.companies.includes(c.name);
                return (
                  <label
                    key={c.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCompany(c.name)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          color: isChecked ? '#1d4ed8' : '#334155',
                          fontWeight: isChecked ? 700 : 500,
                        }}
                      >
                        {c.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>({c.count})</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 4: ĐIỂM ĐÓN (PICKUP POINTS)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('pickup')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Điểm đón</span>
          {openSections.pickup ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.pickup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availablePickupPoints.map((p) => {
              const isChecked = filters.pickupPoints.includes(p.name);
              return (
                <label
                  key={p.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePickupPoint(p.name)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#1d4ed8' : '#334155',
                        fontWeight: isChecked ? 700 : 500,
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>({p.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 5: ĐIỂM TRẢ (DROPOFF POINTS)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('dropoff')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Điểm trả</span>
          {openSections.dropoff ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.dropoff && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableDropoffPoints.map((p) => {
              const isChecked = filters.dropoffPoints.includes(p.name);
              return (
                <label
                  key={p.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDropoffPoint(p.name)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#1d4ed8' : '#334155',
                        fontWeight: isChecked ? 700 : 500,
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>({p.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 6: GIÁ VÉ (PRICE BRACKETS)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('price')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Giá vé</span>
          {openSections.price ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.price && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'UNDER_300', label: 'Dưới 300.000 đ', count: facetCounts.under300Count },
              { id: 'FROM_300_TO_400', label: '300.000 đ - 400.000 đ', count: facetCounts.from300to400Count },
              { id: 'OVER_400', label: 'Trên 400.000 đ', count: facetCounts.over400Count },
            ].map((p) => {
              const isChecked = filters.priceRanges.includes(p.id);
              return (
                <label
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePriceRange(p.id)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#1d4ed8' : '#334155',
                        fontWeight: isChecked ? 700 : 500,
                      }}
                    >
                      {p.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>({p.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 7: ĐÁNH GIÁ (RATING FILTER)
         ========================================================================= */}
      <div style={{ marginBottom: '20px' }}>
        <div
          onClick={() => toggleSection('rating')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Đánh giá</span>
          {openSections.rating ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.rating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { rating: 4.5, label: 'Từ 4.5 sao trở lên', count: facetCounts.rating45Count },
              { rating: 4.0, label: 'Từ 4.0 sao trở lên', count: facetCounts.rating40Count },
            ].map((r) => {
              const isChecked = filters.minRating === r.rating;
              return (
                <label
                  key={r.rating}
                  onClick={() =>
                    onChange({ ...filters, minRating: filters.minRating === r.rating ? null : r.rating })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="radio"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span
                        style={{
                          fontSize: '13px',
                          color: isChecked ? '#1d4ed8' : '#334155',
                          fontWeight: isChecked ? 700 : 500,
                        }}
                      >
                        {r.label}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>({r.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '14px 0' }} />

      {/* =========================================================================
          MỤC 8: LOẠI XE (BUS TYPES)
         ========================================================================= */}
      <div>
        <div
          onClick={() => toggleSection('busType')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Loại xe</span>
          {openSections.busType ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>

        {openSections.busType && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableBusTypes.map((bt) => {
              const isChecked = filters.busTypes.includes(bt.type);
              return (
                <label
                  key={bt.type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBusType(bt.type)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#1d4ed8' : '#334155',
                        fontWeight: isChecked ? 700 : 500,
                      }}
                    >
                      {bt.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>({bt.count})</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
