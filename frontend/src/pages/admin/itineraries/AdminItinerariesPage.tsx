import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Sparkles,
  ChevronRight,
  Layers,
  Info,
  X,
  PlusCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  ItineraryTemplate,
  ItineraryDay,
  ItineraryStop,
  getAllItineraryTemplates,
  saveItineraryTemplate,
  deleteItineraryTemplate,
  toggleItineraryTemplateStatus,
  resetToDefaultItineraryTemplates,
  subscribeToItineraryChanges
} from '../../../services/itineraryService';

export const AdminItinerariesPage: React.FC = () => {
  const { isDark } = useTheme();
  const [templates, setTemplates] = useState<ItineraryTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('ALL');
  const [selectedVibe, setSelectedVibe] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ItineraryTemplate | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'INFO' | 'DAYS' | 'BUDGET' | 'CHECKLIST'>('INFO');

  // Form State for Editing/Creating
  const emptyTemplate: ItineraryTemplate = {
    id: '',
    city: '',
    duration: '3N2Đ',
    vibe: 'CHILL',
    title: '',
    tagline: '',
    weather: '',
    season: '',
    transportInfo: 'Thuê xe máy 120k - 150k/ngày',
    distanceFromMajor: '300 km từ Sài Gòn • ~6h xe Limousine',
    recommendedDepartureTime: '22:30 tối hôm trước',
    recommendedDepartureReason: 'Bắt chuyến xe đêm để ngủ trên xe, sáng sớm tới nơi bắt đầu hành trình tiết kiệm 1 đêm khách sạn.',
    checklist: ['CCCD / Bằng lái xe', 'Áo khoác nhẹ', 'Sạc dự phòng', 'Thuốc men cá nhân'],
    budget: {
      standard: { bus: 700000, stay: 600000, bike: 300000, food: 850000, total: 2450000 },
      budget: { bus: 550000, stay: 350000, bike: 200000, food: 600000, total: 1700000 },
      vip: { bus: 1000000, stay: 1800000, bike: 500000, food: 1800000, total: 5100000 }
    },
    days: [
      {
        dayNumber: 1,
        title: 'Khám phá ngày 1',
        stops: [
          {
            id: 'stop-1-1',
            time: '07:30',
            period: 'MORNING',
            title: 'Ăn sáng đặc sản địa phương',
            category: 'FOOD',
            duration: '45 phút',
            price: '40.000đ',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
            localTip: 'Ghé quán ăn uy tín đông khách địa phương.',
            coords: { x: 50, y: 50 }
          }
        ]
      }
    ],
    isActive: true
  };

  const [formData, setFormData] = useState<ItineraryTemplate>(emptyTemplate);

  // Load Templates
  const loadTemplates = () => {
    const list = getAllItineraryTemplates();
    setTemplates(list);
  };

  useEffect(() => {
    loadTemplates();
    const unsubscribe = subscribeToItineraryChanges(() => {
      loadTemplates();
    });
    return unsubscribe;
  }, []);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const matchSearch =
        search.trim() === '' ||
        item.city.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tagline.toLowerCase().includes(search.toLowerCase());

      const matchDuration = selectedDuration === 'ALL' || item.duration === selectedDuration;
      const matchVibe = selectedVibe === 'ALL' || item.vibe === selectedVibe;

      return matchSearch && matchDuration && matchVibe;
    });
  }, [templates, search, selectedDuration, selectedVibe]);

  // KPI Metrics
  const totalTemplates = templates.length;
  const uniqueCities = Array.from(new Set(templates.map((t) => t.city))).length;
  const totalStops = templates.reduce(
    (acc, t) => acc + t.days.reduce((dAcc, d) => dAcc + d.stops.length, 0),
    0
  );
  const activeCount = templates.filter((t) => t.isActive).length;

  // Handlers
  const handleOpenCreate = () => {
    const newId = `custom-${Date.now()}`;
    setFormData({
      ...emptyTemplate,
      id: newId,
      title: 'Lịch trình khám phá mới'
    });
    setEditingTemplate(null);
    setActiveModalTab('INFO');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: ItineraryTemplate) => {
    setEditingTemplate(template);
    setFormData(JSON.parse(JSON.stringify(template)));
    setActiveModalTab('INFO');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn kịch bản "${title}" không?`)) {
      deleteItineraryTemplate(id);
      toast.success('Đã xóa kịch bản thành công!', 'Thành Công');
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleItineraryTemplateStatus(id);
    toast.info('Đã cập nhật trạng thái hoạt động!', 'Cập Nhật');
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn khôi phục danh sách kịch bản chuẩn gốc của TravelEasy? (Dữ liệu do bạn chỉnh sửa sẽ được đặt lại theo chuẩn thực tế)'
      )
    ) {
      resetToDefaultItineraryTemplates();
      toast.success('Đã khôi phục thành công danh mục kịch bản chuẩn!', 'Khôi Phục');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city.trim()) {
      toast.error('Vui lòng nhập tên Thành phố / Điểm đến!', 'Lỗi');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập Tiêu đề kịch bản!', 'Lỗi');
      return;
    }
    if (formData.days.length === 0) {
      toast.error('Kịch bản phải có ít nhất 1 Ngày!', 'Lỗi');
      return;
    }

    saveItineraryTemplate(formData);
    toast.success(
      editingTemplate ? 'Đã cập nhật kịch bản thành công!' : 'Đã tạo kịch bản mới thành công!',
      'Lưu Kịch Bản'
    );
    setIsModalOpen(false);
  };

  // Day & Stop Sub-handlers in Modal
  const handleAddDay = () => {
    const newDayNum = formData.days.length + 1;
    const newDay: ItineraryDay = {
      dayNumber: newDayNum,
      title: `Ngày ${newDayNum}: Trải nghiệm & Khám phá mới`,
      stops: [
        {
          id: `stop-${newDayNum}-1`,
          time: '08:00',
          period: 'MORNING',
          title: 'Điểm tham quan buổi sáng',
          category: 'CHECKIN',
          duration: '60 phút',
          price: '50.000đ',
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
          localTip: 'Đến sớm trước 9h để tránh đông khách.',
          coords: { x: 50, y: 50 }
        }
      ]
    };
    setFormData((prev) => ({
      ...prev,
      days: [...prev.days, newDay]
    }));
  };

  const handleRemoveDay = (dayIndex: number) => {
    if (formData.days.length <= 1) {
      toast.warning('Kịch bản phải có tối thiểu 1 ngày!', 'Cảnh báo');
      return;
    }
    const updated = formData.days
      .filter((_, idx) => idx !== dayIndex)
      .map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    setFormData((prev) => ({ ...prev, days: updated }));
  };

  const handleAddStopToDay = (dayIndex: number) => {
    const day = formData.days[dayIndex];
    const newStop: ItineraryStop = {
      id: `stop-${day.dayNumber}-${day.stops.length + 1}-${Date.now().toString().slice(-4)}`,
      time: '14:30',
      period: 'AFTERNOON',
      title: 'Điểm dừng chân mới',
      category: 'EXPERIENCE',
      duration: '60 phút',
      price: '50.000đ',
      imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
      localTip: 'Kinh nghiệm bản địa hữu ích dành cho du khách.',
      coords: { x: 50, y: 50 }
    };
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].stops.push(newStop);
    setFormData((prev) => ({ ...prev, days: updatedDays }));
  };

  const handleRemoveStop = (dayIndex: number, stopIndex: number) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].stops = updatedDays[dayIndex].stops.filter((_, idx) => idx !== stopIndex);
    setFormData((prev) => ({ ...prev, days: updatedDays }));
  };

  const handleUpdateStop = (
    dayIndex: number,
    stopIndex: number,
    field: keyof ItineraryStop,
    value: any
  ) => {
    const updatedDays = [...formData.days];
    updatedDays[dayIndex].stops[stopIndex] = {
      ...updatedDays[dayIndex].stops[stopIndex],
      [field]: value
    };
    setFormData((prev) => ({ ...prev, days: updatedDays }));
  };

  const getVibeBadge = (vibe: string) => {
    switch (vibe) {
      case 'CHILL':
        return { label: '🌿 Chill & Nghỉ Dưỡng', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'DISCOVERY':
        return { label: '🚀 Khám Phá & Trải Nghiệm', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'CULTURE':
        return { label: '🏛️ Văn Hóa & Di Sản', bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      case 'FOOD':
        return { label: '🍜 Ẩm Thực & Food Tour', bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
      default:
        return { label: vibe, bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Header & Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}
            >
              <Compass size={24} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}
              >
                Quản Lý Cẩm Nang & Lịch Trình Du Lịch
              </h1>
              <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', margin: 0, marginTop: '2px' }}>
                Quản lý các kịch bản du lịch mẫu, số ngày, điểm dừng và gợi ý xe khách đồng bộ tức thì sang{' '}
                <strong style={{ color: '#2563eb' }}>/schedule</strong> cho khách hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetDefaults}
            title="Khôi phục danh mục kịch bản mẫu chuẩn thực tế"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#cbd5e1' : '#475569',
              border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={15} />
            Khôi phục chuẩn
          </button>

          <a
            href="/schedule"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <Eye size={15} />
            Xem trang Khách hàng
            <ExternalLink size={13} />
          </a>

          <button
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
            }}
          >
            <Plus size={16} />
            Thêm Kịch Bản Mới
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng Số Kịch Bản
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginTop: '6px' }}>
            {totalTemplates}
          </div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
            {activeCount} kịch bản đang mở công khai
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Điểm Đến Bao Phủ
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fdf4ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginTop: '6px' }}>
            {uniqueCities}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Toàn quốc: Bắc - Trung - Nam - Đảo
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Điểm Dừng Chi Tiết
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', marginTop: '6px' }}>
            {totalStops}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Kèm mẹo bản địa, chi phí & tọa độ
          </div>
        </div>

        <div
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Cơ Chế Đồng Bộ
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '10px' }}>
            Real-time Live
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
            Đổi ở Admin cập nhật ngay lập tức
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
          marginBottom: '24px'
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Tìm theo thành phố, điểm đến, tiêu đề kịch bản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '13.5px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Duration Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Thời lượng:</span>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tất cả thời lượng</option>
            <option value="Trong ngày">Trong ngày</option>
            <option value="2N1Đ">2 Ngày 1 Đêm (2N1Đ)</option>
            <option value="3N2Đ">3 Ngày 2 Đêm (3N2Đ)</option>
            <option value="4N3Đ">4 Ngày 3 Đêm (4N3Đ)</option>
          </select>
        </div>

        {/* Vibe Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Gu du lịch:</span>
          <select
            value={selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Tất cả các Gu</option>
            <option value="CHILL">Chill & Nghỉ Dưỡng</option>
            <option value="DISCOVERY">Khám Phá & Trải Nghiệm</option>
            <option value="CULTURE">Văn Hóa & Di Sản</option>
            <option value="FOOD">Ẩm Thực & Food Tour</option>
          </select>
        </div>
      </div>

      {/* 4. Template Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredTemplates.map((template) => {
          const vibeStyle = getVibeBadge(template.vibe);
          const stopCount = template.days.reduce((acc, d) => acc + d.stops.length, 0);
          const coverImage =
            template.days[0]?.stops[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80';

          return (
            <div
              key={template.id}
              style={{
                borderRadius: '16px',
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Cover Image & Badges */}
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                <img
                  src={coverImage}
                  alt={template.city}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}
                  >
                    📍 {template.city}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    ⏱ {template.duration}
                  </span>
                </div>

                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <button
                    onClick={() => handleToggleStatus(template.id)}
                    title={template.isActive ? 'Bấm để Tạm ẩn kịch bản' : 'Bấm để Kích hoạt kịch bản'}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '20px',
                      backgroundColor: template.isActive ? '#ecfdf5' : '#fef2f2',
                      color: template.isActive ? '#059669' : '#dc2626',
                      border: '1px solid ' + (template.isActive ? '#a7f3d0' : '#fecaca'),
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {template.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {template.isActive ? 'Đang mở' : 'Đang ẩn'}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: vibeStyle.bg,
                      color: vibeStyle.text,
                      border: `1px solid ${vibeStyle.border}`,
                      fontSize: '11px',
                      fontWeight: 700,
                      marginBottom: '8px'
                    }}
                  >
                    {vibeStyle.label}
                  </span>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: isDark ? '#f8fafc' : '#0f172a',
                      margin: 0,
                      lineHeight: 1.4
                    }}
                  >
                    {template.title}
                  </h3>
                </div>

                <p
                  style={{
                    fontSize: '12.5px',
                    color: isDark ? '#94a3b8' : '#64748b',
                    margin: '0 0 14px 0',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {template.tagline}
                </p>

                {/* Specs Box */}
                <div
                  style={{
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    fontSize: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Số Ngày & Điểm Dừng</span>
                    <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {template.days.length} Ngày • {stopCount} điểm
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Chi Phí Tiêu Chuẩn</span>
                    <strong style={{ color: '#059669' }}>
                      ~{template.budget.standard.total.toLocaleString()}đ
                    </strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Xe khách gợi ý</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>
                      Xuất bến {template.recommendedDepartureTime}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div
                  style={{
                    marginTop: 'auto',
                    borderTop: '1px solid ' + (isDark ? '#334155' : '#f1f5f9'),
                    paddingTop: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <a
                    href={`/schedule?destination=${encodeURIComponent(template.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#2563eb',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    Xem trực tiếp <ExternalLink size={12} />
                  </a>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEdit(template)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={13} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(template.id, template.title)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            border: '1px dashed ' + (isDark ? '#334155' : '#cbd5e1')
          }}
        >
          <Compass size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
            Không tìm thấy kịch bản lịch trình phù hợp!
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            Hãy thử tìm kiếm bằng từ khóa khác hoặc bấm nút "Khôi phục chuẩn" để nạp lại 20+ kịch bản mẫu.
          </p>
        </div>
      )}

      {/* 5. MODAL CREATE / EDIT ITINERARY TEMPLATE */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0')
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
                  {editingTemplate ? `Chỉnh Sửa Kịch Bản: ${editingTemplate.title}` : 'Thêm Kịch Bản Lịch Trình Mới'}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {formData.city || 'Chưa đặt tên'} • {formData.duration}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                borderBottom: '1px solid ' + (isDark ? '#334155' : '#e2e8f0')
              }}
            >
              <button
                type="button"
                onClick={() => setActiveModalTab('INFO')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeModalTab === 'INFO' ? '#2563eb' : 'transparent',
                  color: activeModalTab === 'INFO' ? '#ffffff' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                1. Thông Tin & Khuyến Nghị Xe
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('DAYS')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeModalTab === 'DAYS' ? '#2563eb' : 'transparent',
                  color: activeModalTab === 'DAYS' ? '#ffffff' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                2. Ngày & Điểm Dừng ({formData.days.length} Ngày)
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('BUDGET')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeModalTab === 'BUDGET' ? '#2563eb' : 'transparent',
                  color: activeModalTab === 'BUDGET' ? '#ffffff' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                3. Dự Toán Chi Phí
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('CHECKLIST')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeModalTab === 'CHECKLIST' ? '#2563eb' : 'transparent',
                  color: activeModalTab === 'CHECKLIST' ? '#ffffff' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                4. Checklist Hành Lý
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSaveForm} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* TAB 1: THÔNG TIN CƠ BẢN */}
              {activeModalTab === 'INFO' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Điểm Đến (Thành phố) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Đà Lạt, Sa Pa, Nha Trang, Đà Nẵng..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Thời Lượng Chuyến Đi *
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Trong ngày">Trong ngày (Quick Trip)</option>
                      <option value="2N1Đ">2 Ngày 1 Đêm (Cuối tuần)</option>
                      <option value="3N2Đ">3 Ngày 2 Đêm (Tiêu chuẩn)</option>
                      <option value="4N3Đ">4 Ngày 3 Đêm (Trọn vẹn)</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Tiêu Đề Kịch Bản *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Đà Lạt 3N2Đ: Săn Mây Cầu Đất, Rừng Thông & Cafe Chill Thung Lũng"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Khẩu Hiệu / Giới Thiệu Ngắn (Tagline)
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Thành phố sương mù, đồi thông bạt ngàn và những quán cafe lãng mạn"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Gu Du Lịch (Vibe)
                    </label>
                    <select
                      value={formData.vibe}
                      onChange={(e) => setFormData({ ...formData, vibe: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="CHILL">🌿 Chill & Nghỉ Dưỡng Thư Giãn</option>
                      <option value="DISCOVERY">🚀 Khám Phá & Trải Nghiệm Mạo Hiểm</option>
                      <option value="CULTURE">🏛️ Văn Hóa & Di Sản Lịch Sử</option>
                      <option value="FOOD">🍜 Ẩm Thực & Food Tour Bản Địa</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Thời Tiết Hiện Tại
                    </label>
                    <input
                      type="text"
                      placeholder="vd: 17°C - Se lạnh có sương mù sáng sớm"
                      value={formData.weather}
                      onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Mùa Đặc Trưng Trong Năm
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Mùa hoa dã quỳ nở rộ & biển mây Cầu Đất"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      Di Chuyển Nội Thành
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Thuê xe máy 120k - 150k/ngày hoặc Taxi công nghệ"
                      value={formData.transportInfo}
                      onChange={(e) => setFormData({ ...formData, transportInfo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#fff' : '#000',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Smart Bus Recommendation Block */}
                  <div
                    style={{
                      gridColumn: 'span 2',
                      backgroundColor: isDark ? '#0f172a' : '#eff6ff',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid ' + (isDark ? '#334155' : '#bfdbfe')
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800, color: '#2563eb' }}>
                      🚌 Khuyến Nghị Chuyến Xe Khách Tối Ưu (Smart Departure Engine)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>
                          Giờ xuất bến đề xuất
                        </label>
                        <input
                          type="text"
                          placeholder="vd: 22:30 tối hôm trước"
                          value={formData.recommendedDepartureTime}
                          onChange={(e) => setFormData({ ...formData, recommendedDepartureTime: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #93c5fd',
                            backgroundColor: '#fff',
                            color: '#000',
                            fontSize: '12.5px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>
                          Khoảng cách & Thời gian đi
                        </label>
                        <input
                          type="text"
                          placeholder="vd: 305 km từ Sài Gòn • ~6.5h xe Limousine cao tốc"
                          value={formData.distanceFromMajor}
                          onChange={(e) => setFormData({ ...formData, distanceFromMajor: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #93c5fd',
                            backgroundColor: '#fff',
                            color: '#000',
                            fontSize: '12.5px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: '4px' }}>
                          Lý do tư vấn hành khách chọn chuyến xe này
                        </label>
                        <textarea
                          rows={3}
                          placeholder="vd: Vì ngày 1 bắt đầu bằng điểm săn mây 05:00 sáng, nên đi chuyến xe đêm..."
                          value={formData.recommendedDepartureReason}
                          onChange={(e) => setFormData({ ...formData, recommendedDepartureReason: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #93c5fd',
                            backgroundColor: '#fff',
                            color: '#000',
                            fontSize: '12.5px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NGÀY & ĐIỂM DỪNG */}
              {activeModalTab === 'DAYS' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                      Cấu trúc Lộ trình các Ngày ({formData.days.length} Ngày)
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} /> Thêm Ngày Mới
                    </button>
                  </div>

                  {formData.days.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      style={{
                        marginBottom: '20px',
                        borderRadius: '14px',
                        border: '1px solid ' + (isDark ? '#334155' : '#cbd5e1'),
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        padding: '16px'
                      }}
                    >
                      {/* Day Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#2563eb',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 800
                            }}
                          >
                            Ngày {day.dayNumber}
                          </span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => {
                              const updated = [...formData.days];
                              updated[dayIdx].title = e.target.value;
                              setFormData({ ...formData, days: updated });
                            }}
                            placeholder="Tiêu đề chính của ngày..."
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                              fontSize: '13px',
                              fontWeight: 700,
                              backgroundColor: isDark ? '#1e293b' : '#fff',
                              color: isDark ? '#fff' : '#000'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleAddStopToDay(dayIdx)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + Điểm dừng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(dayIdx)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Xóa ngày
                          </button>
                        </div>
                      </div>

                      {/* Stops list inside day */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {day.stops.map((stop, stopIdx) => (
                          <div
                            key={stop.id || stopIdx}
                            style={{
                              backgroundColor: isDark ? '#1e293b' : '#ffffff',
                              borderRadius: '10px',
                              padding: '12px',
                              border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                              display: 'grid',
                              gridTemplateColumns: '80px 100px 1fr 100px 100px 36px',
                              gap: '8px',
                              alignItems: 'center'
                            }}
                          >
                            <input
                              type="time"
                              value={stop.time}
                              onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'time', e.target.value)}
                              style={{
                                padding: '5px 6px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '11.5px',
                                fontWeight: 700
                              }}
                            />
                            <select
                              value={stop.category}
                              onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'category', e.target.value)}
                              style={{
                                padding: '5px 6px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '11.5px',
                                fontWeight: 600
                              }}
                            >
                              <option value="FOOD">🍜 Ăn uống</option>
                              <option value="CHECKIN">📸 Check-in</option>
                              <option value="CULTURE">🏛️ Văn hóa</option>
                              <option value="EXPERIENCE">🚀 Trải nghiệm</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Tên địa điểm / Hoạt động"
                              value={stop.title}
                              onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'title', e.target.value)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                            />

                            <input
                              type="text"
                              placeholder="Chi phí"
                              value={stop.price}
                              onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'price', e.target.value)}
                              style={{
                                padding: '5px 6px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '11.5px'
                              }}
                            />

                            <input
                              type="text"
                              placeholder="Thời gian"
                              value={stop.duration}
                              onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'duration', e.target.value)}
                              style={{
                                padding: '5px 6px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '11.5px'
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => handleRemoveStop(dayIdx, stopIdx)}
                              style={{
                                padding: '5px',
                                borderRadius: '6px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <X size={14} />
                            </button>

                            {/* Extra row: Local tip */}
                            <div style={{ gridColumn: 'span 6', display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <input
                                type="text"
                                placeholder="💡 Mẹo bản địa của thổ địa (vd: Đến trước 08h để thưởng thức lúc nóng hổi...)"
                                value={stop.localTip}
                                onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'localTip', e.target.value)}
                                style={{
                                  flex: 2,
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '11.5px',
                                  backgroundColor: '#fefce8'
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Link ảnh Unsplash..."
                                value={stop.imageUrl}
                                onChange={(e) => handleUpdateStop(dayIdx, stopIdx, 'imageUrl', e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '11px'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: DỰ TOÁN CHI PHÍ */}
              {activeModalTab === 'BUDGET' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {/* Standard */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#2563eb' }}>
                      Gói Tiêu Chuẩn (Standard)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <label>
                        Vé xe:
                        <input
                          type="number"
                          value={formData.budget.standard.bus}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                standard: {
                                  ...prev.budget.standard,
                                  bus: val,
                                  total: val + prev.budget.standard.stay + prev.budget.standard.bike + prev.budget.standard.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Khách sạn:
                        <input
                          type="number"
                          value={formData.budget.standard.stay}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                standard: {
                                  ...prev.budget.standard,
                                  stay: val,
                                  total: prev.budget.standard.bus + val + prev.budget.standard.bike + prev.budget.standard.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Thuê xe máy:
                        <input
                          type="number"
                          value={formData.budget.standard.bike}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                standard: {
                                  ...prev.budget.standard,
                                  bike: val,
                                  total: prev.budget.standard.bus + prev.budget.standard.stay + val + prev.budget.standard.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Ăn uống:
                        <input
                          type="number"
                          value={formData.budget.standard.food}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                standard: {
                                  ...prev.budget.standard,
                                  food: val,
                                  total: prev.budget.standard.bus + prev.budget.standard.stay + prev.budget.standard.bike + val
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <div style={{ marginTop: '8px', fontWeight: 800, color: '#059669', fontSize: '13px' }}>
                        Tổng: {formData.budget.standard.total.toLocaleString()}đ
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#059669' }}>
                      Gói Tiết Kiệm (Backpacker)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <label>
                        Vé xe:
                        <input
                          type="number"
                          value={formData.budget.budget.bus}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                budget: {
                                  ...prev.budget.budget,
                                  bus: val,
                                  total: val + prev.budget.budget.stay + prev.budget.budget.bike + prev.budget.budget.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Khách sạn:
                        <input
                          type="number"
                          value={formData.budget.budget.stay}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                budget: {
                                  ...prev.budget.budget,
                                  stay: val,
                                  total: prev.budget.budget.bus + val + prev.budget.budget.bike + prev.budget.budget.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Thuê xe máy:
                        <input
                          type="number"
                          value={formData.budget.budget.bike}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                budget: {
                                  ...prev.budget.budget,
                                  bike: val,
                                  total: prev.budget.budget.bus + prev.budget.budget.stay + val + prev.budget.budget.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Ăn uống:
                        <input
                          type="number"
                          value={formData.budget.budget.food}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                budget: {
                                  ...prev.budget.budget,
                                  food: val,
                                  total: prev.budget.budget.bus + prev.budget.budget.stay + prev.budget.budget.bike + val
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <div style={{ marginTop: '8px', fontWeight: 800, color: '#059669', fontSize: '13px' }}>
                        Tổng: {formData.budget.budget.total.toLocaleString()}đ
                      </div>
                    </div>
                  </div>

                  {/* VIP */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#d97706' }}>
                      Gói Sang Trọng (Luxury VIP)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <label>
                        Vé xe:
                        <input
                          type="number"
                          value={formData.budget.vip.bus}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                vip: {
                                  ...prev.budget.vip,
                                  bus: val,
                                  total: val + prev.budget.vip.stay + prev.budget.vip.bike + prev.budget.vip.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Khách sạn:
                        <input
                          type="number"
                          value={formData.budget.vip.stay}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                vip: {
                                  ...prev.budget.vip,
                                  stay: val,
                                  total: prev.budget.vip.bus + val + prev.budget.vip.bike + prev.budget.vip.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Thuê xe máy / oto:
                        <input
                          type="number"
                          value={formData.budget.vip.bike}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                vip: {
                                  ...prev.budget.vip,
                                  bike: val,
                                  total: prev.budget.vip.bus + prev.budget.vip.stay + val + prev.budget.vip.food
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <label>
                        Ăn uống:
                        <input
                          type="number"
                          value={formData.budget.vip.food}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              budget: {
                                ...prev.budget,
                                vip: {
                                  ...prev.budget.vip,
                                  food: val,
                                  total: prev.budget.vip.bus + prev.budget.vip.stay + prev.budget.vip.bike + val
                                }
                              }
                            }));
                          }}
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </label>
                      <div style={{ marginTop: '8px', fontWeight: 800, color: '#059669', fontSize: '13px' }}>
                        Tổng: {formData.budget.vip.total.toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CHECKLIST */}
              {activeModalTab === 'CHECKLIST' && (
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 800 }}>
                    Danh sách vật dụng cần chuẩn bị (Mỗi dòng là một món đồ)
                  </h4>
                  <textarea
                    rows={6}
                    value={formData.checklist.join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      setFormData({ ...formData, checklist: lines });
                    }}
                    placeholder="Áo khoác ấm&#10;CCCD / Bằng lái xe&#10;Sạc dự phòng&#10;Thuốc men cá nhân"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid ' + (isDark ? '#475569' : '#cbd5e1'),
                      fontSize: '13px',
                      lineHeight: 1.6,
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Khách hàng có thể tích chọn kiểm tra từng món đồ trực tiếp trên giao diện chuẩn bị hành lý.
                  </span>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                  paddingTop: '16px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                    color: isDark ? '#cbd5e1' : '#475569',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
                  }}
                >
                  <Save size={15} /> Lưu Kịch Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminItinerariesPage;

