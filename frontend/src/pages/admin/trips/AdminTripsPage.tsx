import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Search, Ban, CheckCircle, Clock, MapPin, Bus, RefreshCw, X, 
  Users, ShieldCheck, AlertCircle, ArrowRight, Download, Filter, 
  BarChart3, AlertTriangle, Sparkles, Building2
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import { PassengerManifestModal } from '../../../components/PassengerManifestModal';
import { Pagination } from '../../../components/Pagination';

interface TripItem {
  id: number;
  busCompanyId: number;
  busCompanyName: string;
  routeId: number;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: 'SCHEDULED' | 'DEPARTED' | 'CANCELLED';
}

export const AdminTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'DEPARTED' | 'CANCELLED'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Modal Manifest / Dispatch
  const [manifestTrip, setManifestTrip] = useState<TripItem | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/trips');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTrips(res.data.data);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load trips from API:', err);
      toast.error('Không thể tải danh sách chuyến xe từ CSDL', 'Lỗi Kết Nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Danh sách nhà xe đối tác duy nhất để hiển thị dropdown lọc
  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    trips.forEach(t => {
      if (t.busCompanyName) set.add(t.busCompanyName);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [trips]);

  const handleToggleTripStatus = async (trip: TripItem) => {
    const willCancel = trip.status === 'SCHEDULED';
    const actionLabel = willCancel ? 'ĐÌNH CHỈ KHẨN CẤP (TẠM HỦY)' : 'MỞ BÁN LẠI';

    const reason = window.prompt(
      `Xác nhận ${actionLabel} chuyến xe #${trip.id} (${trip.originCity} → ${trip.destinationCity} của ${trip.busCompanyName})?\n\nVui lòng nhập lý do điều phối (sự cố kỹ thuật, thời tiết xấu, hoặc theo đề nghị nhà xe):`,
      willCancel ? 'Điều phối khẩn cấp theo thông báo sự cố từ nhà xe' : 'Khôi phục mở bán sau khi giải quyết sự cố'
    );

    if (!reason || !reason.trim()) return;

    const nextStatus = willCancel ? 'CANCELLED' : 'SCHEDULED';

    try {
      await api.patch(`/admin/trips/${trip.id}/status`, null, {
        params: { status: nextStatus },
      });

      setTrips(prev => prev.map(t => (t.id === trip.id ? { ...t, status: nextStatus } : t)));

      if (nextStatus === 'CANCELLED') {
        toast.warning(
          `Đã tạm đình chỉ mở bán chuyến #${trip.id} trên sàn TravelEasy (Lý do: ${reason}).`,
          'Đình Chỉ Chuyến Xe'
        );
      } else {
        toast.success(
          `Đã khôi phục mở bán chuyến #${trip.id} trên sàn TravelEasy.`,
          'Khôi Phục Mở Bán'
        );
      }
    } catch (err: any) {
      console.error('Failed to update trip status:', err);
      toast.error('Cập nhật trạng thái chuyến xe thất bại!', 'Lỗi');
    }
  };

  // Xuất file CSV báo cáo điều phối chuyến xe
  const handleExportCSV = () => {
    if (filteredTrips.length === 0) {
      toast.warning('Không có dữ liệu chuyến xe để xuất!', 'Thông Báo');
      return;
    }
    const headers = ['Mã chuyến', 'Nhà xe', 'Điểm đi', 'Điểm đến', 'Giờ xuất bến', 'Giờ đến', 'Dòng xe', 'Giá niêm yết (VNĐ)', 'Tổng ghế', 'Ghế trống', 'Đã đặt', 'Tỷ lệ lấp đầy (%)', 'Trạng thái'];
    const rows = filteredTrips.map(t => [
      t.id,
      `"${t.busCompanyName.replace(/"/g, '""')}"`,
      `"${t.originCity.replace(/"/g, '""')}"`,
      `"${t.destinationCity.replace(/"/g, '""')}"`,
      `"${t.departureTime}"`,
      `"${t.arrivalTime}"`,
      `"${t.busType}"`,
      t.price,
      t.totalSeats,
      t.availableSeats,
      t.totalSeats - t.availableSeats,
      Math.round(((t.totalSeats - t.availableSeats) / t.totalSeats) * 100),
      t.status === 'SCHEDULED' ? 'Mở bán' : t.status === 'CANCELLED' ? 'Tạm hủy' : 'Đã khởi hành'
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `traveleasy_dieu_phoi_chuyen_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đã xuất báo cáo ${filteredTrips.length} chuyến xe ra file Excel CSV!`, 'Xuất Báo Cáo');
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (selectedCompany !== 'ALL' && t.busCompanyName !== selectedCompany) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchCity = t.originCity.toLowerCase().includes(q) || t.destinationCity.toLowerCase().includes(q);
        const matchCompany = t.busCompanyName.toLowerCase().includes(q);
        const matchId = t.id.toString().includes(q);
        if (!matchCity && !matchCompany && !matchId) return false;
      }
      return true;
    });
  }, [trips, statusFilter, selectedCompany, search]);

  // Phân trang
  const totalPages = Math.ceil(filteredTrips.length / pageSize) || 1;
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrips.slice(start, start + pageSize);
  }, [filteredTrips, currentPage, pageSize]);

  // Đặt lại trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedCompany, pageSize]);

  // KPI Metrics
  const scheduledCount = trips.filter(t => t.status === 'SCHEDULED').length;
  const cancelledCount = trips.filter(t => t.status === 'CANCELLED').length;
  const totalCapacity = trips.reduce((acc, t) => acc + (t.totalSeats || 0), 0);
  const totalBooked = trips.reduce((acc, t) => acc + ((t.totalSeats || 0) - (t.availableSeats || 0)), 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  const getBusTypeBadge = (type: string) => {
    switch (type) {
      case 'LIMOUSINE':
        return { label: 'Limousine VIP', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'SLEEPER':
        return { label: 'Giường nằm 40 chỗ', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'SEAT':
      default:
        return { label: 'Ghế ngồi tiêu chuẩn', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị mạng lưới <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Giám sát chuyến xe</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Giám Sát &amp; Điều Phối Chuyến Xe Toàn Sàn
            <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              Command Center
            </span>
          </h1>
          <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Hệ thống giám sát thời gian thực {trips.length} chuyến xe liên tỉnh kết nối với cơ sở dữ liệu Supabase
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={14} color="#059669" /> Xuất Excel CSV ({filteredTrips.length})
          </button>

          <button
            onClick={fetchTrips}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37,99,235,0.2)',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* KPI Command Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng Chuyến Toàn Sàn</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bus size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{trips.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Trên toàn bộ mạng lưới tuyến liên tỉnh</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đang Mở Bán Vé</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>{scheduledCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Sẵn sàng đón khách và nhận đơn trực tuyến</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lấp Đầy Trung Bình</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>{avgOccupancy}%</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Đã bán {totalBooked} / {totalCapacity} tổng ghế mở bán</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đình Chỉ / Tạm Hủy</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: cancelledCount > 0 ? '#dc2626' : '#64748b' }}>{cancelledCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Cần Admin theo dõi hoàn tiền hoặc chuyển chuyến</div>
        </div>
      </div>

      {/* Info Notice Card: Governance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          marginBottom: '18px',
          fontSize: '13px',
          color: '#1e40af',
        }}
      >
        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Quy chuẩn phân định trách nhiệm vận hành:</strong> Chuyến xe, giờ chạy, số lượng ghế và giá vé do <strong>Nhà xe đối tác trực tiếp thiết lập và chịu trách nhiệm pháp lý</strong> tại Cổng Điều Hành Nhà Xe. Admin sàn TravelEasy thực hiện vai trò <strong>giám sát tỷ lệ lấp đầy, điều phối khi có sự cố bất khả kháng và bảo vệ tiền vé hành khách (Escrow)</strong>.
        </div>
      </div>

      {/* Enterprise Filters & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Tìm theo mã chuyến #, nhà xe, điểm đi hoặc điểm đến (Phương Trang, Hà Nội, Đà Lạt...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
            }}
          />
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter by Bus Company */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: selectedCompany === 'ALL' ? '#475569' : '#1e40af',
              backgroundColor: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'auto',
            }}
          >
            <option value="ALL">Tất cả nhà xe đối tác ({companyOptions.length})</option>
            {companyOptions.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
          <Building2 size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'SCHEDULED', label: `Đang mở bán (${scheduledCount})` },
            { key: 'DEPARTED', label: 'Đã khởi hành' },
            { key: 'CANCELLED', label: `Tạm hủy (${cancelledCount})` },
          ].map((tab: any) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  backgroundColor: isActive ? '#2563eb' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trips Table Container with horizontal scrolling */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>MÃ CHUYẾN</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>NHÀ XE VẬN HÀNH</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>LỘ TRÌNH (ĐIỂM ĐI → ĐẾN)</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>GIỜ XUẤT BẾN</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>DÒNG XE</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>GIÁ NIÊM YẾT</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>GHẾ &amp; LẤP ĐẦY</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>ĐIỀU PHỐI SÀN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    Đang tải danh sách chuyến xe từ CSDL Supabase...
                  </td>
                </tr>
              ) : paginatedTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy chuyến xe nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedTrips.map(t => {
                  const isScheduled = t.status === 'SCHEDULED';
                  const depDate = new Date(t.departureTime);
                  const timeFormatted = depDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = depDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  
                  const bookedCount = t.totalSeats - t.availableSeats;
                  const occupancyRate = t.totalSeats > 0 ? Math.round((bookedCount / t.totalSeats) * 100) : 0;
                  const badgeInfo = getBusTypeBadge(t.busType);

                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }} className="hover:bg-slate-50">
                      {/* Mã chuyến */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
                        #{t.id}
                      </td>

                      {/* Nhà xe vận hành */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Bus size={16} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{t.busCompanyName}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Đối tác vận tải</span>
                          </div>
                        </div>
                      </td>

                      {/* Lộ trình (Điểm đi -> Điểm đến) - WhiteSpace NoWrap để KHÔNG BAO GIỜ bị rớt chữ dọc */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontWeight: 700, color: '#1e40af' }}>{t.originCity}</span>
                          <ArrowRight size={13} color="#94a3b8" />
                          <span style={{ fontWeight: 700, color: '#b45309' }}>{t.destinationCity}</span>
                        </div>
                      </td>

                      {/* Giờ xuất bến */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} color="#2563eb" />
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>{timeFormatted}</span>
                          <span style={{ color: '#64748b', fontSize: '11.5px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {dateFormatted}
                          </span>
                        </div>
                      </td>

                      {/* Dòng xe */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          backgroundColor: badgeInfo.bg, 
                          color: badgeInfo.color, 
                          border: `1px solid ${badgeInfo.border}`, 
                          padding: '4px 9px', 
                          borderRadius: '6px', 
                          fontSize: '11.5px', 
                          fontWeight: 700 
                        }}>
                          {badgeInfo.label}
                        </span>
                      </td>

                      {/* Giá niêm yết - WhiteSpace NoWrap để chữ đ không rớt hàng */}
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#2563eb', whiteSpace: 'nowrap', fontSize: '13.5px' }}>
                        {t.price.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Ghế trống & Thanh tỷ lệ lấp đầy */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ minWidth: '100px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 700, color: t.availableSeats > 0 ? '#10b981' : '#ef4444' }}>
                              {t.availableSeats} trống
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                              {occupancyRate}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${occupancyRate}%`, 
                                height: '100%', 
                                backgroundColor: occupancyRate >= 80 ? '#10b981' : occupancyRate >= 40 ? '#3b82f6' : '#f59e0b',
                                borderRadius: '3px',
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái mở bán */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            backgroundColor: isScheduled ? '#ecfdf5' : '#fef2f2',
                            color: isScheduled ? '#059669' : '#dc2626',
                            border: `1px solid ${isScheduled ? '#a7f3d0' : '#fecaca'}`,
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isScheduled ? '#10b981' : '#ef4444' }} />
                          {isScheduled ? 'MỞ BÁN' : 'TẠM HỦY'}
                        </span>
                      </td>

                      {/* Điều phối sàn */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Nút Xem Danh Sách Hành Khách */}
                          <button
                            onClick={() => setManifestTrip(t)}
                            title="Lệnh điều xe & Danh sách hành khách"
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Users size={13} color="#2563eb" /> Khách ({bookedCount})
                          </button>

                          {/* Nút Đình Chỉ Khẩn Cấp / Mở Lại (Admin Governance) */}
                          <button
                            onClick={() => handleToggleTripStatus(t)}
                            title={isScheduled ? 'Đình chỉ khẩn cấp mở bán chuyến này' : 'Mở bán lại chuyến xe'}
                            style={{
                              backgroundColor: isScheduled ? '#fffbeb' : '#ecfdf5',
                              color: isScheduled ? '#d97706' : '#059669',
                              border: `1px solid ${isScheduled ? '#fde68a' : '#a7f3d0'}`,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isScheduled ? (
                              <>
                                <Ban size={12} /> Đình chỉ
                              </>
                            ) : (
                              <>
                                <CheckCircle size={12} /> Mở lại
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {!loading && filteredTrips.length > 0 && (
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 18px', backgroundColor: '#fafafa' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTrips.length}
              pageSize={pageSize}
              onPageChange={page => setCurrentPage(page)}
              onPageSizeChange={size => setPageSize(size)}
              pageSizeOptions={[10, 15, 25, 50, 100]}
              itemLabel="chuyến xe"
            />
          </div>
        )}
      </div>

      {/* Modal: Lệnh Điều Xe & Danh Sách Hành Khách */}
      {manifestTrip && (
        <PassengerManifestModal
          trip={manifestTrip as any}
          isOpen={true}
          isAdmin={true}
          onClose={() => setManifestTrip(null)}
        />
      )}
    </div>
  );
};
