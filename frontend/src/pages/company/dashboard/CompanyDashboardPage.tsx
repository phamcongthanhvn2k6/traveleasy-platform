import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Ticket, Star, RefreshCw, Bus, Clock, MapPin, CheckCircle } from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import { RevenueChart } from '../../../components/RevenueChart';

interface DashboardStats {
  totalRevenue: number;
  totalTrips: number;
  scheduledTrips: number;
  totalBookings: number;
  avgRating: number;
  totalReviews: number;
  upcomingTrips: any[];
}

export const CompanyDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTrips: 0,
    scheduledTrips: 0,
    totalBookings: 0,
    avgRating: 4.8,
    totalReviews: 0,
    upcomingTrips: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/dashboard/stats');
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load company dashboard stats:', err);
      toast.error('Không thể tải thống kê nhà xe từ CSDL', 'Lỗi Kết Nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDateTime = (dtStr: string) => {
    if (!dtStr) return '-';
    try {
      const d = new Date(dtStr);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dtStr;
    }
  };

  const kpis = [
    {
      label: 'Doanh thu tích lũy',
      value: formatCurrency(stats.totalRevenue),
      subtext: 'Đã thanh toán thực tế',
      icon: TrendingUp,
      iconBg: '#ecfdf5',
      iconColor: '#10b981',
    },
    {
      label: 'Chuyến xe vận hành',
      value: `${stats.totalTrips}`,
      subtext: `${stats.scheduledTrips || 0} chuyến sẵn sàng chạy`,
      icon: Calendar,
      iconBg: '#f5f3ff',
      iconColor: '#8b5cf6',
    },
    {
      label: 'Vé đã đặt',
      value: `${stats.totalBookings}`,
      subtext: 'Hành khách trên sàn',
      icon: Ticket,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Đánh giá trung bình',
      value: `${stats.avgRating}/5`,
      subtext: `${stats.totalReviews} phản hồi hành khách`,
      icon: Star,
      iconBg: '#fffbeb',
      iconColor: '#f59e0b',
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Tổng quan vận hành
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Tổng Quan Điều Hành Nhà Xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            TravelEasy Express — Dữ liệu thời gian thực đồng bộ trực tiếp từ CSDL MySQL 8.0
          </div>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '9px 14px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới chỉ số</span>
        </button>
      </div>

      {/* Row of 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '26px',
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
                borderRadius: '14px',
                padding: '20px 22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginTop: '8px' }}>
                  {kpi.subtext}
                </div>
              </div>

              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: kpi.iconBg,
                  color: kpi.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Revenue Trend Chart */}
      <RevenueChart
        title="Biểu Đồ Doanh Thu Nhà Xe Thực Tế"
        subtitle="Thống kê doanh số bán vé và biến động dòng tiền đồng bộ từ CSDL"
        accentColor="#0d9488"
      />

      {/* Upcoming Trips Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Chuyến Xe Sắp Khởi Hành
            </h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Danh sách các chuyến xe mới nhất từ CSDL thực tế
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
            {stats.upcomingTrips?.length || 0} chuyến xe
          </span>
        </div>

        {stats.upcomingTrips && stats.upcomingTrips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.upcomingTrips.map((trip: any) => (
              <div
                key={trip.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  >
                    #{trip.id}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                      {trip.originCity || 'TP. Hồ Chí Minh'} → {trip.destinationCity || 'Đà Lạt'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#f59e0b" /> {formatDateTime(trip.departureTime)}
                      </span>
                      <span>Loại: {trip.busType || 'SLEEPER'}</span>
                      <span>Chỗ trống: {trip.availableSeats || 34}/{trip.totalSeats || 34}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#0284c7' }}>
                    {formatCurrency(trip.price)}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: trip.status === 'RUNNING' ? '#fef3c7' : '#dcfce7',
                      color: trip.status === 'RUNNING' ? '#b45309' : '#166534',
                    }}
                  >
                    {trip.status === 'RUNNING' ? 'ĐANG CHẠY' : 'SẴN SÀNG'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
            <Calendar size={32} style={{ margin: '0 auto 8px' }} />
            <div>Chưa có chuyến xe nào được tạo trong CSDL</div>
          </div>
        )}
      </div>
    </div>
  );
};
