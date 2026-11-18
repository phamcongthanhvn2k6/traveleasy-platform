import React, { useState, useEffect } from 'react';
import { Users, Bus, TrendingUp, Ticket, Calendar, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import api from '../../../services/api';
import { RevenueChart, type ChartDataPoint } from '../../../components/RevenueChart';
import { Skeleton, CardSkeleton } from '../../../components/common/Skeleton';

const revenueFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const formatRevenue = (value: number) => `${revenueFormatter.format(value)} đ`;

const renderRevenuePlot = (data: ChartDataPoint[], accentColor: string) => (
  <ResponsiveContainer width="100%" aspect={2} minHeight={180} maxHeight={320}>
    <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 8 }}>
      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
      <XAxis
        dataKey="label"
        padding={{ left: 20, right: 20 }}
        minTickGap={12}
        tick={{ fontSize: 11, fill: '#64748b' }}
        tickLine={false}
        axisLine={false}
      />
      <Tooltip content={({ active, label, payload }) => {
        const point = payload?.[0]?.payload as ChartDataPoint | undefined;
        if (!active || !point) return null;

        return (
          <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
            <div>Thời điểm: {label}</div>
            <strong>{formatRevenue(point.revenue)}</strong>
            <div>Số vé bán: {point.bookings} vé</div>
          </div>
        );
      }} />
      <Area
        type="linear"
        dataKey="revenue"
        stroke={accentColor}
        strokeWidth={3}
        fill={accentColor}
        fillOpacity={0.15}
        dot={{ r: 3 }}
        isAnimationActive={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const AdminDashboardPage: React.FC = () => {
  const getCachedDashboard = () => {
    try {
      const raw = sessionStorage.getItem('traveleasy_admin_dashboard_cache');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const initialCache = getCachedDashboard();

  const [stats, setStats] = useState({
    userCount: initialCache?.stats?.userCount ?? 0,
    busCompanyCount: initialCache?.stats?.busCompanyCount ?? 0,
    pendingCompanies: initialCache?.stats?.pendingCompanies ?? 0,
    revenue: initialCache?.stats?.revenue?.replace(/\s*₫$/, ' đ') ?? formatRevenue(0),
    confirmedBookings: initialCache?.stats?.confirmedBookings ?? 0,
    totalTrips: initialCache?.stats?.totalTrips ?? 0,
  });

  const [upcomingTrips, setUpcomingTrips] = useState<any[]>(initialCache?.upcomingTrips ?? []);
  const [revenueTrend, setRevenueTrend] = useState<any[]>(initialCache?.revenueTrend ?? []);
  const [loading, setLoading] = useState(!initialCache);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!initialCache) setLoading(true);
      try {
        const [statsRes, companiesRes, tripsRes, trendRes] = await Promise.allSettled([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/bus-companies'),
          api.get('/admin/trips?limit=5'),
          api.get('/admin/dashboard/revenue-trend'),
        ]);

        let revenueFormatted = formatRevenue(0);
        let confirmedCount = 0;
        let uCount = 0;
        let tCount = 0;

        if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
          const d = statsRes.value.data.data;
          uCount = d.totalUsers ?? 0;
          confirmedCount = d.confirmedBookings ?? 0;
          tCount = d.totalTrips ?? 0;
          if (d.totalRevenue !== undefined) {
            revenueFormatted = formatRevenue(d.totalRevenue);
          }
        }

        let cCount = 0;
        let pending = 0;
        if (companiesRes.status === 'fulfilled' && Array.isArray(companiesRes.value.data?.data)) {
          cCount = companiesRes.value.data.data.length;
          pending = companiesRes.value.data.data.filter((c: any) => c.status === 'PENDING' || c.status === 'PENDING_APPROVAL').length;
        }

        let mappedTrips: any[] = [];
        if (tripsRes.status === 'fulfilled' && Array.isArray(tripsRes.value.data?.data)) {
          const rawTrips = tripsRes.value.data.data.slice(0, 5);
          mappedTrips = rawTrips.map((t: any) => ({
            code: `${t.originCity} → ${t.destinationCity}`,
            company: t.busCompanyName,
            departureTime: new Date(t.departureTime).toLocaleString('vi-VN', {
              hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
            }),
            status: t.status,
            availableSeats: t.availableSeats,
            price: formatRevenue(t.price),
            badgeColor: t.status === 'SCHEDULED' ? '#2563eb' : t.status === 'CANCELLED' ? '#ef4444' : '#16a34a',
            badgeBg: t.status === 'SCHEDULED' ? '#eff6ff' : t.status === 'CANCELLED' ? '#fef2f2' : '#f0fdf4',
            badgeBorder: t.status === 'SCHEDULED' ? '#bfdbfe' : t.status === 'CANCELLED' ? '#fecaca' : '#bbf7d0',
          }));
          setUpcomingTrips(mappedTrips);
        }

        let mappedTrend: any[] = [];
        if (trendRes.status === 'fulfilled' && Array.isArray(trendRes.value.data?.data)) {
          mappedTrend = trendRes.value.data.data.map((item: any) => ({
            label: item.label,
            revenue: Number(item.revenue) || 0,
            bookings: item.bookings || 0
          }));
          setRevenueTrend(mappedTrend);
        }

        const newStats = {
          userCount: uCount,
          busCompanyCount: cCount,
          pendingCompanies: pending,
          revenue: revenueFormatted,
          confirmedBookings: confirmedCount,
          totalTrips: tCount,
        };

        setStats(newStats);

        // Lưu vào sessionStorage để lần sau hiển thị tức thì 0ms (Stale-While-Revalidate)
        sessionStorage.setItem('traveleasy_admin_dashboard_cache', JSON.stringify({
          stats: newStats,
          upcomingTrips: mappedTrips,
          revenueTrend: mappedTrend,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // KPI metrics trực tiếp từ CSDL
  const kpiStats = [
    {
      label: 'Người dùng hệ thống',
      value: String(stats.userCount),
      subtext: 'Đồng bộ từ CSDL users',
      icon: Users,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      label: 'Nhà xe đối tác',
      value: String(stats.busCompanyCount),
      subtext: `${stats.pendingCompanies} nhà xe chờ duyệt`,
      icon: Bus,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
    },
    {
      label: 'Tổng doanh thu thực',
      value: stats.revenue,
      subtext: 'Tổng đơn CONFIRMED',
      icon: TrendingUp,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
    },
    {
      label: 'Đơn đặt vé thành công',
      value: String(stats.confirmedBookings),
      subtext: `${stats.totalTrips} chuyến đang vận hành`,
      icon: Ticket,
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
    },
  ];

  // Dữ liệu biểu đồ cột
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Tổng quan sàn</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Bảng Điều Khiển Quản Trị Sàn
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Theo dõi và đồng bộ dữ liệu thời gian thực giữa CSDL, Admin và Người dùng
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: '20px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
              CSDL PostgreSQL: Đang đồng bộ
            </span>
          </div>
        </div>
      </div>

      {/* 1. TOP STATS ROW (Responsive Grid) */}
      {loading && !initialCache ? (
        <CardSkeleton count={4} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '24px' }}>
          {kpiStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: item.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} color={item.iconColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                    {item.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. MAIN CONTENT (Responsive Grid: Chart & Real Upcoming Trips) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Left Column: Interactive Revenue Trend Chart */}
        <div style={{ minWidth: 0 }}>
          <RevenueChart
            title="Biểu Đồ Doanh Thu Toàn Hệ Thống Sàn"
            subtitle="Phân tích tăng trưởng giao dịch và tổng doanh số đối soát"
            accentColor="#2563eb"
            data={revenueTrend.length > 0 ? revenueTrend : undefined}
            renderChart={renderRevenuePlot}
            formatRevenue={formatRevenue}
          />
        </div>

        {/* Right Column: Real Upcoming Trips from Database */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Chuyến Xe Đang Vận Hành (CSDL)</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>Dữ liệu thực tế người dùng đang tìm kiếm & đặt vé</div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '6px' }}>
              Realtime
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingTrips.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Đang tải danh sách chuyến xe từ CSDL...
              </div>
            ) : (
              upcomingTrips.map((trip, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      {trip.code}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span>🏢 {trip.company}</span>
                      <span>•</span>
                      <span>🕒 {trip.departureTime}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563eb' }}>
                      {trip.price.replace(/\s*₫$/, ' đ')}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: trip.badgeColor,
                        backgroundColor: trip.badgeBg,
                        border: `1px solid ${trip.badgeBorder}`,
                      }}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
