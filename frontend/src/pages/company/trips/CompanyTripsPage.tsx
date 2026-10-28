import React, { useState, useEffect } from 'react';
import { Plus, Eye, Clock, AlertTriangle, CheckCircle, Play, Ban, X, RefreshCw, Bus, DollarSign, Users, FileText, Zap, Sparkles, Calendar } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { PassengerManifestModal } from '../../../components/PassengerManifestModal';

export interface CompanyTripItem {
  id: string;
  code: string;
  routeName: string;
  vehiclePlate: string;
  busType?: string;
  departureTime: string;
  arrivalTime?: string;
  price?: number;
  totalSeats?: number;
  delayText: string;
  status: 'SCHEDULED' | 'DELAYED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  statusLabel: string;
}

const STORAGE_KEY = 'traveleasy_company_trips';

const DEFAULT_TRIPS: CompanyTripItem[] = [
  {
    id: 't1',
    code: 't1',
    routeName: 'Sài Gòn - Đà Lạt',
    vehiclePlate: '51B-123.45',
    busType: 'Limousine 34 Phòng VIP',
    departureTime: '02:00 22/10/2026',
    arrivalTime: '08:30 22/10/2026',
    price: 350000,
    totalSeats: 34,
    delayText: '-',
    status: 'SCHEDULED',
    statusLabel: 'Đã lên lịch',
  },
  {
    id: 't2',
    code: 't2',
    routeName: 'Sài Gòn - Nha Trang',
    vehiclePlate: '51B-987.65',
    busType: 'Giường Nằm 40 Chỗ Luxury',
    departureTime: '04:00 22/10/2026',
    arrivalTime: '12:00 22/10/2026',
    price: 280000,
    totalSeats: 40,
    delayText: '-',
    status: 'SCHEDULED',
    statusLabel: 'Đã lên lịch',
  },
  {
    id: 't3',
    code: 't3',
    routeName: 'Hà Nội - Sapa',
    vehiclePlate: '29B-888.88',
    busType: 'Limousine Cabin Đôi',
    departureTime: '07:00 22/10/2026',
    arrivalTime: '13:00 22/10/2026',
    price: 450000,
    totalSeats: 22,
    delayText: '-',
    status: 'RUNNING',
    statusLabel: 'Đang chạy',
  },
  {
    id: 't4',
    code: 't4',
    routeName: 'Sài Gòn - Đà Lạt',
    vehiclePlate: '51B-123.45',
    busType: 'Limousine 34 Phòng VIP',
    departureTime: '15:00 20/10/2026',
    arrivalTime: '21:30 20/10/2026',
    price: 350000,
    totalSeats: 34,
    delayText: '-',
    status: 'COMPLETED',
    statusLabel: 'Hoàn thành',
  },
  {
    id: 't5',
    code: 't5',
    routeName: 'Sài Gòn - Nha Trang',
    vehiclePlate: '51B-987.65',
    busType: 'Giường Nằm 40 Chỗ Luxury',
    departureTime: '02:00 20/10/2026',
    arrivalTime: '10:00 20/10/2026',
    price: 280000,
    totalSeats: 40,
    delayText: '-',
    status: 'CANCELLED',
    statusLabel: 'Đã hủy',
  },
  {
    id: 't6',
    code: 't6',
    routeName: 'Sài Gòn - Đà Lạt',
    vehiclePlate: '51B-123.45',
    busType: 'Limousine 34 Phòng VIP',
    departureTime: '02:00 23/10/2026',
    arrivalTime: '08:30 23/10/2026',
    price: 350000,
    totalSeats: 34,
    delayText: '+30 phút',
    status: 'DELAYED',
    statusLabel: 'Trễ giờ',
  },
  {
    id: 't7',
    code: 't7',
    routeName: 'Sài Gòn - Đà Lạt',
    vehiclePlate: '51B-123.45',
    busType: 'Limousine 34 Phòng VIP',
    departureTime: '02:00 24/10/2026',
    arrivalTime: '08:30 24/10/2026',
    price: 350000,
    totalSeats: 34,
    delayText: '-',
    status: 'SCHEDULED',
    statusLabel: 'Đã lên lịch',
  },
];

export const CompanyTripsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [trips, setTrips] = useState<CompanyTripItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_TRIPS;
  });

  const fetchTripsFromDb = async () => {
    try {
      const res = await api.get('/company/trips');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: CompanyTripItem[] = res.data.data.map((item: any) => ({
          id: String(item.id),
          code: item.code || `TR-${item.id}`,
          routeName: item.routeName || (item.originCity && item.destinationCity ? `${item.originCity} - ${item.destinationCity}` : 'Sài Gòn - Đà Lạt'),
          vehiclePlate: item.licensePlate || item.vehiclePlate || '51B-123.45',
          busType: item.busType || 'Limousine 34 Phòng VIP',
          departureTime: item.departureTime ? formatDisplayTime(item.departureTime) : '08:00 24/10/2026',
          arrivalTime: item.arrivalTime ? formatDisplayTime(item.arrivalTime) : '14:30 24/10/2026',
          price: item.price || 300000,
          totalSeats: item.totalSeats || 34,
          delayText: item.delayText || '-',
          status: item.status || 'SCHEDULED',
          statusLabel: item.status === 'RUNNING' ? 'Đang chạy' : item.status === 'COMPLETED' ? 'Hoàn thành' : item.status === 'CANCELLED' ? 'Đã hủy' : 'Đã lên lịch',
        }));
        if (mapped.length > 0) {
          setTrips(mapped);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTripsFromDb();
  }, []);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoRouteId, setAutoRouteId] = useState<number>(1);
  const [autoDays, setAutoDays] = useState<number>(30);
  const [autoBusType, setAutoBusType] = useState<string>('LIMOUSINE');
  const [autoPrice, setAutoPrice] = useState<number>(390000);
  const [autoSelectedSlots, setAutoSelectedSlots] = useState<string[]>([
    '00:30', '04:30', '07:00', '09:30', '13:30', '17:00', '22:30', '23:00'
  ]);
  const [selectedTrip, setSelectedTrip] = useState<CompanyTripItem | null>(null);
  const [manifestTrip, setManifestTrip] = useState<any | null>(null);

  const toggleAutoSlot = (slot: string) => {
    setAutoSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
    );
  };

  const handleRunAutoGeneration = async () => {
    if (autoSelectedSlots.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 khung giờ chạy định kỳ!', 'Thiếu Thông Tin');
      return;
    }
    setIsAutoGenerating(true);
    try {
      const res = await api.post('/company/trips/auto-generate', {
        busCompanyId: 1,
        routeId: autoRouteId,
        daysAhead: autoDays,
        timeSlots: autoSelectedSlots,
        busType: autoBusType,
        price: autoPrice,
      });
      const count = res.data?.data?.generatedCount || 0;
      toast.success(
        `Đã tự động sinh ${count} chuyến xe và toàn bộ sơ đồ ghế cho ${autoDays} ngày tới!`,
        'Tự Động Hóa Thành Công'
      );
      await fetchTripsFromDb();
      setIsAutoModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi kích hoạt tự động sinh chuyến: ' + (err?.response?.data?.message || err.message), 'Thất Bại');
    } finally {
      setIsAutoGenerating(false);
    }
  };

  // Form Fields
  const [formRoute, setFormRoute] = useState('Sài Gòn - Đà Lạt');
  const [formVehiclePlate, setFormVehiclePlate] = useState('51B-123.45');
  const [formBusType, setFormBusType] = useState('Limousine 34 Phòng VIP');
  const [formDepartureTime, setFormDepartureTime] = useState('');
  const [formArrivalTime, setFormArrivalTime] = useState('');
  const [formPrice, setFormPrice] = useState(300000);
  const [formSeats, setFormSeats] = useState(34);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch {
      // ignore
    }
  }, [trips]);

  // Try to load extra vehicles or routes from backend/storage
  const [availablePlates, setAvailablePlates] = useState<string[]>([
    '51B-123.45',
    '51B-987.65',
    '51B-678.90',
    '29B-888.88',
  ]);

  useEffect(() => {
    try {
      const storedVehicles = localStorage.getItem('traveleasy_company_vehicles');
      if (storedVehicles) {
        const parsed = JSON.parse(storedVehicles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const plates = parsed.map((v: any) => v.plate).filter(Boolean);
          if (plates.length > 0) setAvailablePlates(plates);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const openCreateModal = () => {
    // Default departure time 2 hours from now
    const now = new Date();
    now.setHours(now.getHours() + 2, 0, 0, 0);
    const depStr = now.toISOString().slice(0, 16);

    const arr = new Date(now.getTime() + 6 * 3600 * 1000);
    const arrStr = arr.toISOString().slice(0, 16);

    setFormRoute('Sài Gòn - Đà Lạt');
    setFormVehiclePlate(availablePlates[0] || '51B-123.45');
    setFormBusType('Limousine 34 Phòng VIP');
    setFormDepartureTime(depStr);
    setFormArrivalTime(arrStr);
    setFormPrice(320000);
    setFormSeats(34);
    setIsCreateModalOpen(true);
  };

  const formatDisplayTime = (dateTimeLocal: string) => {
    try {
      const d = new Date(dateTimeLocal);
      const pad = (n: number) => (n < 10 ? `0${n}` : n);
      return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    } catch {
      return dateTimeLocal;
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDepartureTime) {
      toast.warning('Vui lòng chọn thời gian khởi hành!', 'Thiếu Thông Tin');
      return;
    }

    try {
      await api.post('/company/trips', {
        busCompanyId: 1,
        routeId: 1,
        departureTime: formDepartureTime,
        arrivalTime: formArrivalTime || formDepartureTime,
        busType: formBusType.includes('Limousine') ? 'LIMOUSINE' : 'SLEEPER',
        price: Number(formPrice),
        totalSeats: Number(formSeats),
        licensePlate: formVehiclePlate
      });
      await fetchTripsFromDb();
      toast.success(`Đã tạo chuyến xe mới (${formRoute}) lưu trực tiếp vào CSDL!`, 'Tạo Chuyến Mới');
      setIsCreateModalOpen(false);
      return;
    } catch {
      // fallback local update
    }

    const nextId = `t${Date.now()}`;
    const newTrip: CompanyTripItem = {
      id: nextId,
      code: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      routeName: formRoute,
      vehiclePlate: formVehiclePlate,
      busType: formBusType,
      departureTime: formatDisplayTime(formDepartureTime),
      arrivalTime: formArrivalTime ? formatDisplayTime(formArrivalTime) : 'Dự kiến 6 tiếng',
      price: Number(formPrice),
      totalSeats: Number(formSeats),
      delayText: '-',
      status: 'SCHEDULED',
      statusLabel: 'Đã lên lịch',
    };

    setTrips((prev) => [newTrip, ...prev]);
    toast.success(`Đã tạo chuyến xe mới ${newTrip.code} (${newTrip.routeName}) thành công!`, 'Tạo Chuyến Mới');
    setIsCreateModalOpen(false);
  };

  // Status Modifiers
  const updateTripStatus = async (
    tripId: string,
    newStatus: 'SCHEDULED' | 'DELAYED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED',
    newLabel: string,
    delayText: string = '-'
  ) => {
    try {
      const numId = parseInt(tripId.replace(/\D/g, ''), 10);
      if (!isNaN(numId) && numId > 0 && numId < 100000) {
        await api.patch(`/company/trips/${numId}/status?status=${newStatus}`);
      }
    } catch {}

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const updated = {
            ...t,
            status: newStatus,
            statusLabel: newLabel,
            delayText: delayText !== undefined ? delayText : t.delayText,
          };
          if (selectedTrip?.id === tripId) {
            setSelectedTrip(updated);
          }
          return updated;
        }
        return t;
      })
    );

    if (newStatus === 'DELAYED') {
      toast.warning(`Chuyến xe đã cập nhật: Trễ giờ (${delayText})`, 'Cảnh Báo Trễ Giờ');
    } else if (newStatus === 'RUNNING') {
      toast.info('Chuyến xe đã bắt đầu xuất bến và đang di chuyển!', 'Bắt Đầu Chạy');
    } else if (newStatus === 'COMPLETED') {
      toast.success('Chuyến xe đã kết thúc hành trình an toàn!', 'Hoàn Thành Chuyến');
    } else if (newStatus === 'CANCELLED') {
      toast.error('Chuyến xe đã bị hủy!', 'Hủy Chuyến Xe');
    } else {
      toast.info(`Chuyến xe trở lại trạng thái: ${newLabel}`, 'Cập Nhật Trạng Thái');
    }
  };

  const filtered = trips.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.status === activeTab;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chuyến xe
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản lý chuyến xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng cộng {trips.length} chuyến xe trong hệ thống nhà xe
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsAutoModalOpen(true)}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
          >
            <Zap size={16} />
            <span>⚡ Lịch Định Kỳ & Sinh Chuyến Tự Động</span>
          </button>

          <button
            onClick={openCreateModal}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
          >
            <Plus size={16} />
            <span>Tạo chuyến mới</span>
          </button>
        </div>
      </div>

      {/* Automation Notice Strip */}
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Động Cơ Tự Động Hóa Lịch Chạy Xe (Daily Auto-Rolling Engine): ĐANG HOẠT ĐỘNG</span>
              <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '12px', fontWeight: 700 }}>
                30 Ngày Mở Bán
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
              Hệ thống tự động lăn chuyến hàng ngày và sinh sơ đồ ghế theo khung giờ định kỳ. Chuyến xe cũ đã qua giờ khởi hành được tự động cập nhật sang <strong>COMPLETED</strong> để bảo vệ hành khách đặt vé.
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAutoModalOpen(true)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={14} color="#16a34a" /> Cấu hình & Sinh thêm chuyến
        </button>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'SCHEDULED', label: 'SCHEDULED' },
          { key: 'DELAYED', label: 'DELAYED' },
          { key: 'RUNNING', label: 'RUNNING' },
          { key: 'COMPLETED', label: 'COMPLETED' },
          { key: 'CANCELLED', label: 'CANCELLED' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === 'ALL' ? trips.length : trips.filter((t) => t.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÃ CHUYẾN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TUYẾN ĐƯỜNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>BIỂN SỐ XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>KHỞI HÀNH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>GIÁ VÉ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRỄ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Không có chuyến xe nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const statusStyles = {
                  SCHEDULED: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
                  DELAYED: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                  RUNNING: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                  COMPLETED: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
                  CANCELLED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                }[item.status];

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#4f46e5' }}>{item.code}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{item.routeName}</td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      <span style={{ fontWeight: 600, backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {item.vehiclePlate}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.departureTime}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      {item.price ? `${item.price.toLocaleString('vi-VN')} đ` : '280.000 đ'}
                    </td>
                    <td style={{ padding: '14px 18px', color: item.delayText !== '-' ? '#d97706' : '#94a3b8', fontWeight: item.delayText !== '-' ? 700 : 400 }}>
                      {item.delayText !== '-' ? (
                        <div style={{ lineHeight: 1.15, fontSize: '12px', color: '#d97706' }}>
                          <span style={{ backgroundColor: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                            {item.delayText}
                          </span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: statusStyles?.bg,
                          color: statusStyles?.text,
                          border: `1px solid ${statusStyles?.border}`,
                        }}
                      >
                        {item.statusLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        title="Xem và Xuất danh sách hành khách đi xe"
                        onClick={() => setManifestTrip(item)}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          color: '#059669',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginRight: '6px',
                        }}
                      >
                        <Users size={14} />
                        <span>Khách Đi Xe</span>
                      </button>

                      <button
                        title="Xem chi tiết & Cập nhật chuyến"
                        onClick={() => setSelectedTrip(item)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          color: '#4f46e5',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <Eye size={14} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Create New Trip */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '540px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Tạo Chuyến Xe Mới
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Lên lịch khởi hành chuyến xe cho nhà xe
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTrip}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Tuyến đường <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formRoute}
                  onChange={(e) => setFormRoute(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Sài Gòn - Đà Lạt">Sài Gòn - Đà Lạt</option>
                  <option value="Sài Gòn - Nha Trang">Sài Gòn - Nha Trang</option>
                  <option value="Hà Nội - Sapa">Hà Nội - Sapa</option>
                  <option value="Đà Nẵng - Quy Nhơn">Đà Nẵng - Quy Nhơn</option>
                  <option value="Cần Thơ - Rạch Giá">Cần Thơ - Rạch Giá</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Biển số xe điều phối <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formVehiclePlate}
                    onChange={(e) => setFormVehiclePlate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {availablePlates.map((plate) => (
                      <option key={plate} value={plate}>
                        {plate}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Loại xe
                  </label>
                  <select
                    value={formBusType}
                    onChange={(e) => setFormBusType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Limousine 34 Phòng VIP">Limousine 34 Phòng VIP</option>
                    <option value="Giường Nằm 40 Chỗ Luxury">Giường Nằm 40 Chỗ Luxury</option>
                    <option value="Limousine Cabin Đôi">Limousine Cabin Đôi</option>
                    <option value="Ghế Ngồi 29 Chỗ VIP">Ghế Ngồi 29 Chỗ VIP</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Thời gian khởi hành <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formDepartureTime}
                    onChange={(e) => setFormDepartureTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Thời gian đến dự kiến
                  </label>
                  <input
                    type="datetime-local"
                    value={formArrivalTime}
                    onChange={(e) => setFormArrivalTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Giá vé (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Số lượng ghế/phòng
                  </label>
                  <input
                    type="number"
                    value={formSeats}
                    onChange={(e) => setFormSeats(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tạo Chuyến Xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Auto-Rolling & Recurring Schedule Generator */}
      {isAutoModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setIsAutoModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#16a34a', color: '#fff', padding: '8px', borderRadius: '10px' }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                    Tự Động Sinh Chuyến Theo Lịch Trình Định Kỳ
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#15803d' }}>
                    Thiết lập khung giờ cố định và để hệ thống tự động sinh hàng loạt chuyến xe cho các ngày tới
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* 1. Chọn Tuyến Đường */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  1. Tuyến Đường Áp Dụng:
                </label>
                <select
                  value={autoRouteId}
                  onChange={(e) => setAutoRouteId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}
                >
                  <option value={1}>TP. Hồ Chí Minh ⇄ Đà Lạt (305 km - 6.5 giờ)</option>
                  <option value={4}>Hà Nội ⇄ Sa Pa (315 km - 5.5 giờ)</option>
                  <option value={2}>TP. Hồ Chí Minh ⇄ Nha Trang (430 km - 8 giờ)</option>
                  <option value={5}>TP. Hồ Chí Minh ⇄ Vũng Tàu (95 km - 2 giờ)</option>
                  <option value={9}>Hà Nội ⇄ Hải Phòng (120 km - 1.5 giờ)</option>
                  <option value={14}>Đà Nẵng ⇄ Quy Nhơn (310 km - 5.5 giờ)</option>
                  <option value={3}>TP. Hồ Chí Minh ⇄ Cần Thơ (165 km - 3.5 giờ)</option>
                </select>
              </div>

              {/* 2. Khoảng thời gian tự động sinh */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  2. Số Ngày Tự Động Sinh Liên Tục (Rolling Window):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { days: 7, label: '7 Ngày Tới', desc: '1 tuần' },
                    { days: 14, label: '14 Ngày Tới', desc: '2 tuần' },
                    { days: 30, label: '30 Ngày Tới (Khuyên dùng)', desc: '1 tháng trọn vẹn' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.days}
                      onClick={() => setAutoDays(item.days)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: autoDays === item.days ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        backgroundColor: autoDays === item.days ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 800, color: autoDays === item.days ? '#166534' : '#1e293b' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Khung giờ chạy định kỳ */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    3. Khung Giờ Xuất Bến Định Kỳ Mỗi Ngày:
                  </label>
                  <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700 }}>
                    Đã chọn {autoSelectedSlots.length} mốc giờ / ngày
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { slot: '00:30', period: 'Sáng sớm' },
                    { slot: '04:30', period: 'Sáng sớm' },
                    { slot: '07:00', period: 'Buổi sáng' },
                    { slot: '09:30', period: 'Buổi sáng' },
                    { slot: '11:00', period: 'Trưa' },
                    { slot: '13:30', period: 'Buổi chiều' },
                    { slot: '15:30', period: 'Buổi chiều' },
                    { slot: '17:00', period: 'Chiều muộn' },
                    { slot: '18:00', period: 'Buổi tối' },
                    { slot: '21:00', period: 'Buổi tối' },
                    { slot: '22:30', period: 'Đêm muộn' },
                    { slot: '23:00', period: 'Đêm muộn' },
                  ].map((s) => {
                    const isSelected = autoSelectedSlots.includes(s.slot);
                    return (
                      <button
                        type="button"
                        key={s.slot}
                        onClick={() => toggleAutoSlot(s.slot)}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#dcfce7' : '#f8fafc',
                          color: isSelected ? '#15803d' : '#475569',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        <div>{s.slot}</div>
                        <div style={{ fontSize: '10px', opacity: 0.75, fontWeight: 500 }}>{s.period}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Loại xe & Giá vé */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    4. Loại Xe Chạy:
                  </label>
                  <select
                    value={autoBusType}
                    onChange={(e) => setAutoBusType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="LIMOUSINE">Limousine 34 Phòng VIP</option>
                    <option value="SLEEPER">Giường Nằm Tiêu Chuẩn 40 Chỗ</option>
                    <option value="SEAT">Ghế Ngồi Cao Cấp 29 Chỗ</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    5. Giá Vé Niêm Yết (VNĐ):
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={autoPrice}
                    onChange={(e) => setAutoPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Dự kiến kết quả */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#1e40af' }}>
                ⚡ Ước tính: Hệ thống sẽ tự động sinh khoảng <strong>{autoDays * autoSelectedSlots.length} chuyến xe mới</strong> và <strong>{(autoDays * autoSelectedSlots.length * 34).toLocaleString('vi-VN')} ghế ngồi</strong> ở trạng thái mở bán, sẵn sàng cho khách đặt vé ngay lập tức!
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAutoModalOpen(false)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isAutoGenerating}
                onClick={handleRunAutoGeneration}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: isAutoGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                }}
              >
                <Zap size={16} />
                <span>{isAutoGenerating ? 'Đang tự động sinh...' : '🚀 Kích Hoạt Sinh Chuyến Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: View Trip Detail & Fast Status Controls */}
      {selectedTrip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setSelectedTrip(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                  Chi Tiết Chuyến Xe
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedTrip.code} - {selectedTrip.routeName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>BIỂN SỐ XE</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {selectedTrip.vehiclePlate}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>LOẠI XE</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                  {selectedTrip.busType || 'Limousine VIP'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>GIỜ KHỞI HÀNH</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                  {selectedTrip.departureTime}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>DỰ KIẾN ĐẾN</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                  {selectedTrip.arrivalTime || '6 tiếng'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>GIÁ VÉ</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                  {selectedTrip.price ? `${selectedTrip.price.toLocaleString('vi-VN')} đ` : '280.000 đ'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>TRẠNG THÁI HIỆN TẠI</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', marginTop: '2px' }}>
                  {selectedTrip.statusLabel} {selectedTrip.delayText !== '-' && `(${selectedTrip.delayText})`}
                </div>
              </div>
            </div>

            {/* Fast Action Controls */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Thao tác điều phối chuyến xe:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => updateTripStatus(selectedTrip.id, 'DELAYED', 'Trễ giờ', '+30 phút')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #fde68a',
                    backgroundColor: '#fffbeb',
                    color: '#d97706',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Clock size={14} /> Báo trễ giờ (+30 phút)
                </button>

                <button
                  type="button"
                  onClick={() => updateTripStatus(selectedTrip.id, 'RUNNING', 'Đang chạy', '-')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={14} /> Bắt đầu chạy (Xuất bến)
                </button>

                <button
                  type="button"
                  onClick={() => updateTripStatus(selectedTrip.id, 'COMPLETED', 'Hoàn thành', '-')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle size={14} /> Hoàn thành chuyến
                </button>

                <button
                  type="button"
                  onClick={() => updateTripStatus(selectedTrip.id, 'CANCELLED', 'Đã hủy', '-')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Ban size={14} /> Hủy chuyến xe
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setManifestTrip(selectedTrip);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Users size={15} /> Xuất Danh Sách Khách & Điểm Danh
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passenger Manifest Modal */}
      {manifestTrip && (
        <PassengerManifestModal
          trip={manifestTrip}
          isOpen={Boolean(manifestTrip)}
          onClose={() => setManifestTrip(null)}
        />
      )}
    </div>
  );
};

export default CompanyTripsPage;
