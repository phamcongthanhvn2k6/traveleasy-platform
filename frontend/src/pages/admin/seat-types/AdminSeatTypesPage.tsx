import React, { useState, useEffect } from 'react';
import { Armchair, Search, Plus, Edit2, X, CheckCircle2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface SeatTypeItem {
  code: string;
  name: string;
  description: string;
  priceMultiplier: string;
  status: 'ACTIVE' | 'DEPRECATED';
}

export const AdminSeatTypesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [seatTypes, setSeatTypes] = useState<SeatTypeItem[]>([]);

  // Modal create
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal edit
  const [editingItem, setEditingItem] = useState<SeatTypeItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'DEPRECATED'>('ACTIVE');
  const [updating, setUpdating] = useState(false);

  const fetchSeatTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/seat-types');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setSeatTypes(
          res.data.data.map((s: any) => ({
            code: s.code,
            name: s.label || s.name || s.code,
            description: s.description || 'Loại ghế chuẩn hóa hệ thống',
            priceMultiplier: s.priceMultiplier ? `x${s.priceMultiplier}` : 'x1.3',
            status: s.status === 'DEPRECATED' ? 'DEPRECATED' : 'ACTIVE',
          }))
        );
      }
    } catch (err) {
      console.error('Could not fetch seat types from API:', err);
      setSeatTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatTypes();
  }, []);

  const handleToggleStatus = async (item: SeatTypeItem) => {
    const nextStatus = item.status === 'ACTIVE' ? 'DEPRECATED' : 'ACTIVE';
    try {
      await api.patch(`/admin/seat-types/${item.code}/status`, null, { params: { status: nextStatus } });
      setSeatTypes((prev) =>
        prev.map((s) => (s.code === item.code ? { ...s, status: nextStatus } : s))
      );
      if (nextStatus === 'ACTIVE') {
        toast.success(`Đã kích hoạt loại ghế "${item.name}"!`, 'Đồng Bộ CSDL');
      } else {
        toast.warning(`Đã ngừng áp dụng loại ghế "${item.name}"!`, 'Đồng Bộ CSDL');
      }
    } catch (err) {
      setSeatTypes((prev) =>
        prev.map((s) => (s.code === item.code ? { ...s, status: nextStatus } : s))
      );
      toast.info(`Đã cập nhật trạng thái loại ghế "${item.name}"!`, 'Thông Báo');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) {
      toast.warning('Vui lòng nhập đầy đủ mã và tên loại ghế!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/seat-types', {
        code: newCode.trim().toUpperCase(),
        label: newName.trim(),
        description: newDesc.trim() || 'Loại ghế chuẩn hoá',
        status: 'ACTIVE',
      });
      toast.success(`Tạo loại ghế mới "${newName}" thành công!`, 'Thành Công');
      setShowModal(false);
      setNewCode('');
      setNewName('');
      setNewDesc('');
      fetchSeatTypes();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo loại ghế mới';
      toast.error(msg, 'Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item: SeatTypeItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDesc(item.description === 'Loại ghế chuẩn hóa hệ thống' ? '' : item.description);
    setEditStatus(item.status);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editName.trim()) {
      toast.warning('Vui lòng nhập tên loại ghế!', 'Thiếu Thông Tin');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/admin/seat-types/${editingItem.code}`, {
        code: editingItem.code,
        label: editName.trim(),
        description: editDesc.trim() || 'Loại ghế chuẩn hoá',
        status: editStatus,
      });
      toast.success(`Cập nhật loại ghế "${editName.trim()}" thành công!`, 'Thành Công');
      setEditingItem(null);
      fetchSeatTypes();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể cập nhật loại ghế';
      toast.error(msg, 'Thất Bại');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = seatTypes.filter((s) => {
    if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Danh mục <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Loại ghế
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Danh Mục Loại Ghế Chuẩn Hóa
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {seatTypes.length} loại ghế trong cơ sở dữ liệu hệ thống
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: '#2563eb',
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
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
          }}
        >
          <Plus size={16} />
          <span>Thêm Loại Ghế</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            width: '280px',
            gap: '8px',
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm kiếm mã, tên loại ghế..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              flex: 1,
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '180px',
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang kích hoạt</option>
          <option value="DEPRECATED">Ngừng áp dụng</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÃ LOẠI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TÊN LOẠI GHẾ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÔ TẢ TIỆN ÍCH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HỆ SỐ GIÁ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', width: '190px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải danh mục loại ghế...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr
                  key={item.code}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Armchair size={17} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#1e3a8a' }}>{item.code}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>{item.name}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.description}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#d97706' }}>{item.priceMultiplier}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: item.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                        color: item.status === 'ACTIVE' ? '#059669' : '#dc2626',
                        border: `1px solid ${item.status === 'ACTIVE' ? '#a7f3d0' : '#fecaca'}`,
                      }}
                    >
                      {item.status === 'ACTIVE' ? 'ĐANG KÍCH HOẠT' : 'NGỪNG ÁP DỤNG'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Chỉnh sửa thông tin loại ghế"
                        style={{
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Sửa</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(item)}
                        title={item.status === 'ACTIVE' ? 'Tạm ngưng loại ghế' : 'Kích hoạt loại ghế'}
                        style={{
                          backgroundColor: item.status === 'ACTIVE' ? '#fef2f2' : '#ecfdf5',
                          color: item.status === 'ACTIVE' ? '#dc2626' : '#059669',
                          border: `1px solid ${item.status === 'ACTIVE' ? '#fecaca' : '#a7f3d0'}`,
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = item.status === 'ACTIVE' ? '#fee2e2' : '#d1fae5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = item.status === 'ACTIVE' ? '#fef2f2' : '#ecfdf5';
                        }}
                      >
                        {item.status === 'ACTIVE' ? 'Tạm Ngưng' : 'Kích Hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Không tìm thấy loại ghế phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal: Thêm loại ghế mới */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(480px, 94vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Thêm Loại Ghế Mới
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mã Loại Ghế (VD: VIP_ROYAL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: CABIN_SINGLE"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tên Loại Ghế *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng Cabin Đơn Cao Cấp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mô Tả Tiện Ích
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tiện ích, kích thước đệm..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Vào CSDL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa loại ghế */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(480px, 94vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Chỉnh Sửa Loại Ghế
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Mã chuẩn: <strong style={{ color: '#1e3a8a' }}>{editingItem.code}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                title="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mã Loại Ghế (Định danh hệ thống)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingItem.code}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    cursor: 'not-allowed',
                    fontWeight: 600,
                  }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                  * Mã loại ghế là định danh bất biến được liên kết với cấu hình xe và vé
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tên Loại Ghế *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng Cabin Đơn Cao Cấp"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mô Tả Tiện Ích
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tiện ích, kích thước đệm, tính năng..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Trạng Thái Áp Dụng
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'DEPRECATED')}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ACTIVE">Đang Kích Hoạt (Áp dụng cho sơ đồ xe)</option>
                  <option value="DEPRECATED">Ngừng Áp Dụng (Tạm ngưng gán mới)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeatTypesPage;
