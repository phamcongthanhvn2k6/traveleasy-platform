import React from 'react';
import { Users, Bus, TrendingUp, Ticket } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  // Dữ liệu hiển thị chuẩn theo kiến trúc TravelEasy Admin
  const kpiStats = [
    {
      label: 'Nguoi dung',
      value: '7',
      subtext: '+12% so voi thang truoc',
      icon: Users,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Nha xe',
      value: '2',
      subtext: '1 cho duyet',
      icon: Bus,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      label: 'Tong doanh thu',
      value: '3.130.000 đ',
      subtext: '',
      icon: TrendingUp,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Dat ve (confirmed)',
      value: '7',
      subtext: '3 chuyen sap khoi hanh',
      icon: Ticket,
      iconBg: '#fffbeb',
      iconColor: '#d97706',
    },
  ];

  const upcomingTrips = [
    {
      code: 'rt1 / v1',
      departureTime: 'Khoi hanh: 02:00:00 22/9/2026',
      status: 'SCHEDULED',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
    },
    {
      code: 'rt2 / v2',
      departureTime: 'Khoi hanh: 04:00:00 22/9/2026',
      status: 'SCHEDULED',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
    },
    {
      code: 'rt3 / v3',
      departureTime: 'Khoi hanh: 03:00:00 21/9/2026',
      status: 'RUNNING',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
    },
    {
      code: 'rt1 / v1',
      departureTime: 'Khoi hanh: 02:00:00 23/9/2026',
      status: 'DELAYED',
      badgeColor: '#d97706',
      badgeBg: '#fffbeb',
      badgeBorder: '#fed7aa',
    },
    {
      code: 'rt1 / v1',
      departureTime: 'Khoi hanh: 02:00:00 24/9/2026',
      status: 'SCHEDULED',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
    },
  ];

  // Dữ liệu biểu đồ cột 60M max
  const chartBars = [
    { month: 'T7', value: 42, heightPercent: 70 },
    { month: 'T8', value: 52, heightPercent: 86 },
    { month: 'T9', value: 38, heightPercent: 63 },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tong quan
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Tong quan he thong
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          TravelEasy Admin Dashboard
        </div>
      </div>

      {/* Row of 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '22px',
        }}
      >
        {kpiStats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px 20px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {item.value}
                </div>
                {item.subtext ? (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginTop: '8px' }}>
                    {item.subtext}
                  </div>
                ) : (
                  <div style={{ height: '17px', marginTop: '8px' }} />
                )}
              </div>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: item.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={19} color={item.iconColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '18px',
          alignItems: 'start',
        }}
      >
        {/* ======================================================== */}
        {/* Left Column: Biểu đồ doanh thu theo tháng (VND)           */}
        {/* ======================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Doanh thu theo thang (VND)
            </h3>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              6 thang gan day
            </div>
          </div>

          {/* Bar Chart Container */}
          <div style={{ position: 'relative', height: '220px', marginTop: '16px' }}>
            {/* Horizontal Grid lines and Y-axis labels */}
            {[
              { label: '60M', top: 0 },
              { label: '45M', top: 25 },
              { label: '30M', top: 50 },
              { label: '15M', top: 75 },
              { label: '0M', top: 100 },
            ].map((tick, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: `${tick.top}%`,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  transform: 'translateY(-50%)',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    textAlign: 'right',
                    paddingRight: '10px',
                    fontFamily: 'monospace',
                  }}
                >
                  {tick.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    borderTop: '1px dashed #e2e8f0',
                    height: '1px',
                  }}
                />
              </div>
            ))}

            {/* Bars Area */}
            <div
              style={{
                position: 'absolute',
                left: '42px',
                right: '16px',
                top: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
              }}
            >
              {chartBars.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: `${bar.heightPercent}%`,
                      backgroundColor: '#6366f1',
                      borderTopLeftRadius: '3px',
                      borderTopRightRadius: '3px',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      fontWeight: 600,
                      marginTop: '8px',
                    }}
                  >
                    {bar.month}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '28px',
            }}
          >
            <div style={{ width: '10px', height: '10px', backgroundColor: '#6366f1', borderRadius: '2px' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Doanh thu</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Column: Chuyen xe sap toi                           */}
        {/* ======================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Chuyen xe sap toi
            </h3>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Cac chuyen dang hoat dong
            </div>
          </div>

          {/* Trips list */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingTrips.map((trip, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: idx === upcomingTrips.length - 1 ? 'none' : '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                    {trip.code}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    {trip.departureTime}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: trip.badgeColor,
                    backgroundColor: trip.badgeBg,
                    border: `1px solid ${trip.badgeBorder}`,
                    borderRadius: '9999px',
                    padding: '2px 9px',
                    letterSpacing: '0.4px',
                  }}
                >
                  {trip.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
