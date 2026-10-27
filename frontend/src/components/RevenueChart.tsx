import React, { useState } from 'react';
import { TrendingUp, BarChart2, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';

export interface ChartDataPoint {
  label: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  title?: string;
  subtitle?: string;
  accentColor?: string;
  currencyPrefix?: string;
  data?: ChartDataPoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  title = 'Biểu Đồ Xu Hướng Doanh Thu Thực Tế',
  subtitle = 'Dữ liệu đối soát vé bán thành công theo thời gian thực',
  accentColor = '#2563eb',
  data: customData,
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'MONTHLY'>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default dataset for 7 days
  const default7Days: ChartDataPoint[] = [
    { label: '21/10', revenue: 640000, bookings: 2 },
    { label: '22/10', revenue: 1280000, bookings: 4 },
    { label: '23/10', revenue: 960000, bookings: 3 },
    { label: '24/10', revenue: 1920000, bookings: 6 },
    { label: '25/10', revenue: 2560000, bookings: 8 },
    { label: '26/10', revenue: 3200000, bookings: 10 },
    { label: '27/10', revenue: 3840000, bookings: 12 },
  ];

  // Default dataset for 30 days
  const default30Days: ChartDataPoint[] = [
    { label: 'Tuần 1', revenue: 8400000, bookings: 28 },
    { label: 'Tuần 2', revenue: 12600000, bookings: 42 },
    { label: 'Tuần 3', revenue: 16800000, bookings: 56 },
    { label: 'Tuần 4', revenue: 21500000, bookings: 71 },
  ];

  // Default dataset for months
  const defaultMonthly: ChartDataPoint[] = [
    { label: 'T07', revenue: 32000000, bookings: 105 },
    { label: 'T08', revenue: 45000000, bookings: 148 },
    { label: 'T09', revenue: 62000000, bookings: 204 },
    { label: 'T10', revenue: 84500000, bookings: 278 },
  ];

  const data = customData || (timeRange === '7D' ? default7Days : timeRange === '30D' ? default30Days : defaultMonthly);

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000);
  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalPeriodBookings = data.reduce((sum, d) => sum + d.bookings, 0);

  // SVG Chart dimensions
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * chartW;
    const y = paddingY + chartH - (d.revenue / maxRevenue) * chartH;
    return { x, y, ...d };
  });

  // Construct SVG paths
  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '24px',
      }}
    >
      {/* Chart Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: `${accentColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
              }}
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {title}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Range Selector & Total Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', display: 'none', smDisplay: 'block' } as any}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tổng doanh thu kỳ:</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPeriodRevenue)}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
            }}
          >
            {(['7D', '30D', 'MONTHLY'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                style={{
                  border: 'none',
                  backgroundColor: timeRange === r ? '#ffffff' : 'transparent',
                  color: timeRange === r ? accentColor : '#64748b',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: timeRange === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {r === '7D' ? '7 Ngày' : r === '30D' ? '30 Ngày' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '480px' }}
        >
          <defs>
            <linearGradient id={`grad-${accentColor.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + chartH * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Filled Area */}
          <path d={areaPath} fill={`url(#grad-${accentColor.replace('#', '')})`} />

          {/* Line Stroke */}
          <path d={linePath} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Hover Interactivity */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                fill={hoveredIndex === i ? '#ffffff' : accentColor}
                stroke={accentColor}
                strokeWidth={hoveredIndex === i ? 3 : 2}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* X Axis Labels */}
              <text
                x={p.x}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="11"
                fill={hoveredIndex === i ? '#0f172a' : '#94a3b8'}
                fontWeight={hoveredIndex === i ? '800' : '600'}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
              transform: 'translateX(-50%)',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: '11px', marginBottom: '2px' }}>
              Thời điểm: {points[hoveredIndex].label}
            </div>
            <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#4ade80' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(points[hoveredIndex].revenue)}
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
              Số vé bán: <strong>{points[hoveredIndex].bookings} vé</strong>
            </div>
          </div>
        )}
      </div>

      {/* Footer KPI Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center',
        }}
      >
        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Doanh thu kỳ này</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPeriodRevenue)}
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Tổng số vé xuất</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
            {totalPeriodBookings} vé
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Giá trị trung bình/vé</div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              totalPeriodBookings > 0 ? Math.round(totalPeriodRevenue / totalPeriodBookings) : 320000
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;

