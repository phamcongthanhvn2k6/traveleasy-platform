import React from 'react';
import { TrendingUp, Calendar, Ticket, Star } from 'lucide-react';

export const CompanyDashboardPage: React.FC = () => {
  const kpis = [
    {
      label: 'Doanh thu thang',
      value: '2.740.000 đ',
      subtext: '',
      icon: TrendingUp,
      iconBg: '#ecfdf5',
      iconColor: '#10b981',
    },
    {
      label: 'Chuyen da dat',
      value: '6',
      subtext: '',
      icon: Calendar,
      iconBg: '#f5f3ff',
      iconColor: '#8b5cf6',
    },
    {
      label: 'Ve da dat',
      value: '6',
      subtext: '',
      icon: Ticket,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Danh gia TB',
      value: '3.7/5',
      subtext: '3 danh gia',
      icon: Star,
      iconBg: '#fffbeb',
      iconColor: '#f59e0b',
    },
  ];

  const upcomingTrips = [
    { code: 'Chuyen t1', departure: 'Khoi hanh: 02:00:00 22/9/2026', status: 'SCHEDULED' },
    { code: 'Chuyen t2', departure: 'Khoi hanh: 04:00:00 22/9/2026', status: 'SCHEDULED' },
    { code: 'Chuyen t5', departure: 'Khoi hanh: 02:00:00 23/9/2026', status: 'DELAYED' },
    { code: 'Chuyen t7', departure: 'Khoi hanh: 02:00:00 24/9/2026', status: 'SCHEDULED' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tong quan
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Tong quan nha xe
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          TravelEasy Express
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
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
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
                  {kpi.label}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {kpi.value}
                </div>
                {kpi.subtext ? (
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginTop: '8px' }}>
                    {kpi.subtext}
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
                  backgroundColor: kpi.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={19} color={kpi.iconColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '18px' }}>
        {/* Left: Bar Chart */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              So chuyen theo thang
            </h2>
          </div>

          {/* Bar Chart Canvas Simulation */}
          <div style={{ height: '220px', position: 'relative', display: 'flex', alignItems: 'flex-end', paddingBottom: '28px', paddingLeft: '40px', paddingRight: '20px' }}>
            {/* Grid horizontal lines */}
            {[60, 45, 30, 15, 0].map((val) => {
              const bottomPercent = (val / 60) * 180 + 28;
              return (
                <div
                  key={val}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${bottomPercent}px`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ width: '32px', fontSize: '10px', color: '#94a3b8', textAlign: 'right', paddingRight: '8px' }}>
                    {val}
                  </span>
                  <div style={{ flex: 1, borderBottom: '1px dashed #e2e8f0' }} />
                </div>
              );
            })}

            {/* Bars */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', zIndex: 2, height: '180px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}>
                <div style={{ width: '100%', height: '135px', backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>T7</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}>
                <div style={{ width: '100%', height: '155px', backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>T8</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}>
                <div style={{ width: '100%', height: '115px', backgroundColor: '#10b981', borderRadius: '4px 4px 0 0' }} />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>T9</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '2px' }} />
            <span>So chuyen</span>
          </div>
        </div>

        {/* Right: Chuyến xe tới hành */}
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
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Chuyen toi hanh
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingTrips.map((trip, idx) => {
              const isDelayed = trip.status === 'DELAYED';
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{trip.code}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{trip.departure}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '5px',
                      backgroundColor: isDelayed ? '#fffbeb' : '#eff6ff',
                      color: isDelayed ? '#d97706' : '#2563eb',
                      border: isDelayed ? '1px solid #fde68a' : '1px solid #bfdbfe',
                    }}
                  >
                    {trip.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;

