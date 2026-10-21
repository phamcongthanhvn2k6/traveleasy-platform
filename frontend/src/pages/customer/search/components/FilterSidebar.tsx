import React from 'react';
import { Filter, RotateCcw, Clock, DollarSign, Bus, Building2 } from 'lucide-react';

export interface FilterState {
  timeSlots: string[]; // 'EARLY', 'MORNING', 'AFTERNOON', 'EVENING'
  priceRanges: string[]; // 'UNDER_300', 'FROM_300_TO_400', 'OVER_400'
  busTypes: string[]; // 'SLEEPER', 'LIMOUSINE', 'SEATER'
  companies: string[];
}

interface Props {
  filters: FilterState;
  availableCompanies: string[];
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<Props> = ({
  filters,
  availableCompanies,
  onChange,
  onReset,
}) => {
  const toggleTimeSlot = (slot: string) => {
    const next = filters.timeSlots.includes(slot)
      ? filters.timeSlots.filter((s) => s !== slot)
      : [...filters.timeSlots, slot];
    onChange({ ...filters, timeSlots: next });
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

  const toggleCompany = (company: string) => {
    const next = filters.companies.includes(company)
      ? filters.companies.filter((c) => c !== company)
      : [...filters.companies, company];
    onChange({ ...filters, companies: next });
  };

  const hasActiveFilters =
    filters.timeSlots.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.busTypes.length > 0 ||
    filters.companies.length > 0;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#2563eb" />
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
            Bộ Lọc Tìm Kiếm
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Bỏ lọc
          </button>
        )}
      </div>

      {/* 1. Giờ khởi hành */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '10px',
          }}
        >
          <Clock size={15} color="#64748b" /> Giờ khởi hành
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'EARLY', label: 'Sáng sớm (00:00 - 06:00)' },
            { id: 'MORNING', label: 'Buổi sáng (06:00 - 12:00)' },
            { id: 'AFTERNOON', label: 'Buổi chiều (12:00 - 18:00)' },
            { id: 'EVENING', label: 'Buổi tối (18:00 - 24:00)' },
          ].map((slot) => {
            const checked = filters.timeSlots.includes(slot.id);
            return (
              <label
                key={slot.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: checked ? '#2563eb' : '#475569',
                  fontWeight: checked ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTimeSlot(slot.id)}
                  style={{ accentColor: '#2563eb', width: '15px', height: '15px' }}
                />
                {slot.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Giá vé */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '10px',
          }}
        >
          <DollarSign size={15} color="#64748b" /> Giá vé
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'UNDER_300', label: 'Dưới 300.000 đ' },
            { id: 'FROM_300_TO_400', label: '300.000 đ - 400.000 đ' },
            { id: 'OVER_400', label: 'Trên 400.000 đ' },
          ].map((range) => {
            const checked = filters.priceRanges.includes(range.id);
            return (
              <label
                key={range.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: checked ? '#2563eb' : '#475569',
                  fontWeight: checked ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePriceRange(range.id)}
                  style={{ accentColor: '#2563eb', width: '15px', height: '15px' }}
                />
                {range.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Loại xe */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '10px',
          }}
        >
          <Bus size={15} color="#64748b" /> Loại xe
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'SLEEPER', label: 'Xe Giường nằm tiêu chuẩn' },
            { id: 'LIMOUSINE', label: 'Xe Limousine VIP phòng riêng' },
            { id: 'SEATER', label: 'Xe Ghế ngồi' },
          ].map((type) => {
            const checked = filters.busTypes.includes(type.id);
            return (
              <label
                key={type.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: checked ? '#2563eb' : '#475569',
                  fontWeight: checked ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBusType(type.id)}
                  style={{ accentColor: '#2563eb', width: '15px', height: '15px' }}
                />
                {type.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Nhà xe */}
      {availableCompanies.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '10px',
            }}
          >
            <Building2 size={15} color="#64748b" /> Nhà xe
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableCompanies.map((company) => {
              const checked = filters.companies.includes(company);
              return (
                <label
                  key={company}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: checked ? '#2563eb' : '#475569',
                    fontWeight: checked ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCompany(company)}
                    style={{ accentColor: '#2563eb', width: '15px', height: '15px' }}
                  />
                  {company}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
