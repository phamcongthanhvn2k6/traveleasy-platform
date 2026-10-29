import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  UploadCloud,
  Loader2,
  X,
  Check,
  Calendar,
  Link as LinkIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import uploadService from '../../../services/uploadService';

interface BannerItem {
  id: string;
  title: string;
  imagePath: string;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  duration: string;
  link?: string;
}

export const AdminBannersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    imagePath: '',
    position: 'Trang chu - Top',
    duration: '07:00 01/10/2026 - 23:59 31/12/2026',
    link: '/promotions',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/banners');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setBanners(res.data.data.map((b: any) => ({
          id: String(b.id),
          title: b.title,
          imagePath: b.imagePath || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500',
          position: b.position || 'Trang chu - Top',
          status: b.status,
          statusLabel: b.status === 'ACTIVE' ? 'Đang hiện' : 'Đang ẩn',
          duration: b.duration || '07:00 01/01/2026 - 23:59 31/12/2026',
          link: b.link,
        })));
      }
    } catch (err) {
      console.warn('Could not load banners from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file, 'banners');
      setFormData(prev => ({ ...prev, imagePath: result.url }));
      toast.success('Đã tải ảnh banner lên Cloudinary thành công!', 'Cloudinary Storage');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải ảnh banner lên Cloudinary', 'Thất Bại');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    const nextStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/banners/${banner.id}/status`);
      setBanners(prev => prev.map(b => b.id === banner.id ? {
        ...b,
        status: nextStatus,
        statusLabel: nextStatus === 'ACTIVE' ? 'Đang hiện' : 'Đang ẩn'
      } : b));

      if (nextStatus === 'ACTIVE') {
        toast.success(`Đã hiển thị banner "${banner.title}" lên Trang chủ cho người dùng!`, 'Đồng Bộ CSDL');
      } else {
        toast.warning(`Đã ẩn banner "${banner.title}" khỏi Trang chủ người dùng!`, 'Đồng Bộ CSDL');
      }
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái banner', 'Thất Bại');
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn banner "${title}" khỏi hệ thống?`)) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.success(`Đã xóa banner "${title}" thành công!`, 'Đồng Bộ CSDL');
    } catch (err) {
      toast.error('Lỗi khi xóa banner', 'Thất Bại');
    }
  };

  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning('Vui lòng nhập tiêu đề chiến dịch banner!', 'Thiếu Thông Tin');
      return;
    }
    if (!formData.imagePath.trim()) {
      toast.warning('Vui lòng tải ảnh banner lên Cloudinary hoặc nhập link ảnh!', 'Thiếu Ảnh Banner');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post('/admin/banners', formData);
      if (res.data?.data) {
        toast.success(`Tạo banner "${formData.title}" thành công trên Supabase!`, 'Thành Công');
        setIsModalOpen(false);
        setFormData({
          title: '',
          imagePath: '',
          position: 'Trang chu - Top',
          duration: '07:00 01/10/2026 - 23:59 31/12/2026',
          link: '/promotions',
          status: 'ACTIVE',
        });
        fetchBanners();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo banner';
      toast.error(msg, 'Lỗi Lưu Banner');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = banners.filter((b) => {
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (positionFilter !== 'ALL' && b.position !== positionFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Banner
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Banner Quảng Cáo & Khuyến Mại
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tích hợp lưu trữ Cloudinary • Đồng bộ trực tiếp với mục Khuyến Mãi trên Trang Chủ của người dùng
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(249, 115, 22, 0.25)',
            }}
          >
            <Plus size={16} /> Thêm Banner Mới
          </button>

          <button
            onClick={fetchBanners}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm theo tiêu đề banner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="ALL">Tất cả vị trí</option>
          <option value="Trang chu - Top">Trang chu - Top</option>
          <option value="Trang chu - Khuyen mai">Trang chu - Khuyến mại</option>
          <option value="Trang chu - Tuyen hot">Trang chu - Tuyến hot</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hiện trên Web</option>
          <option value="INACTIVE">Đang ẩn</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 18px' }}>ẢNH & TIÊU ĐỀ BANNER</th>
              <th style={{ padding: '12px 18px' }}>VỊ TRÍ HIỂN THỊ</th>
              <th style={{ padding: '12px 18px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px' }}>THỜI HẠN</th>
              <th style={{ padding: '12px 18px' }}>LIÊN KẾT ĐÍCH</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải danh sách banner từ CSDL...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy banner nào. Hãy nhấn "Thêm Banner Mới" để tạo ngay!
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        onClick={() => setLightboxUrl(b.imagePath)}
                        style={{
                          width: '90px',
                          height: '52px',
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          overflow: 'hidden',
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: '1px solid #e2e8f0',
                          position: 'relative'
                        }}
                        title="Click để xem ảnh kích thước lớn"
                      >
                        <img
                          src={b.imagePath}
                          alt={b.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500';
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{b.title}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>ID: #{b.id}</span>
                          <span>•</span>
                          <span style={{ color: '#0284c7' }}>Cloudinary Storage</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                      {b.position}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: b.status === 'ACTIVE' ? '#f0fdf4' : '#f8fafc',
                        color: b.status === 'ACTIVE' ? '#16a34a' : '#64748b',
                        border: `1px solid ${b.status === 'ACTIVE' ? '#bbf7d0' : '#cbd5e1'}`,
                      }}
                    >
                      {b.status === 'ACTIVE' ? 'Đang hiện trên Web' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                    {b.duration}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {b.link ? (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#2563eb',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{b.link}</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>---</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleStatus(b)}
                        title={b.status === 'ACTIVE' ? 'Ẩn khỏi web' : 'Hiển thị lên web'}
                        style={{
                          backgroundColor: b.status === 'ACTIVE' ? '#fff1f2' : '#f0fdf4',
                          border: `1px solid ${b.status === 'ACTIVE' ? '#fecdd3' : '#bbf7d0'}`,
                          color: b.status === 'ACTIVE' ? '#e11d48' : '#16a34a',
                          cursor: 'pointer',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {b.status === 'ACTIVE' ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{b.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        title="Xóa banner"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#94a3b8',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Banner Mới Với Cloudinary Upload */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#f97316" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Thêm Mới Banner Chiến Dịch & Khuyến Mại
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#64748b',
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitBanner} style={{ padding: '24px', overflowY: 'auto' }}>
              {/* Tiêu đề */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Tiêu đề chiến dịch banner *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Mùa Thu Vàng Săn Mây Sa Pa - Giảm 20% Limousine"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Tải ảnh lên Cloudinary */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Hình ảnh Banner (Cloudinary) *
                </label>

                {/* Upload box */}
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginBottom: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                  />

                  {isUploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', fontWeight: 700, fontSize: '13px' }}>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Đang tải ảnh lên Cloudinary (traveleasy/banners)...</span>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#ffedd5',
                          color: '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <UploadCloud size={22} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        Nhấp để tải ảnh banner từ máy tính
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Hỗ trợ PNG, JPG, WEBP • Kích thước khuyến nghị 1200x500px
                      </span>
                    </>
                  )}
                </label>

                {/* URL Direct Input / Fallback */}
                <input
                  type="text"
                  placeholder="Hoặc dán URL ảnh có sẵn (https://res.cloudinary.com/...)"
                  value={formData.imagePath}
                  onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Preview Image */}
                {formData.imagePath && (
                  <div style={{ marginTop: '10px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '140px' }}>
                    <img
                      src={formData.imagePath}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Cloudinary Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Vị trí hiển thị & Trạng thái */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Vị trí hiển thị
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Trang chu - Top">Trang chu - Top</option>
                    <option value="Trang chu - Khuyen mai">Trang chu - Khuyến mại</option>
                    <option value="Trang chu - Tuyen hot">Trang chu - Tuyến hot</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Trạng thái ban đầu
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="ACTIVE">Hiển thị ngay trên Web</option>
                    <option value="INACTIVE">Tạm ẩn (Bản nháp)</option>
                  </select>
                </div>
              </div>

              {/* Thời hạn & Đường dẫn */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Thời gian áp dụng
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 07:00 01/10/2026 - 23:59 31/12/2026"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Đường dẫn liên kết (Link)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: /promotions hoặc /search?origin=Hà+Nội"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  style={{
                    backgroundColor: isSaving || isUploading ? '#94a3b8' : '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 22px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isSaving || isUploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Lưu Banner Lên Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setLightboxUrl(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={lightboxUrl}
              alt="Fullscreen Banner"
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: 'none',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
