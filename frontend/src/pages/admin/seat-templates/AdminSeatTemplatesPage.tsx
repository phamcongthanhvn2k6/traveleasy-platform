import React, { useState, useEffect } from 'react';
import { Armchair, Search, Plus, Eye, Edit2, Grid, Trash2, X } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface SeatTemplateItem {
  id: number;
  name: string;
  floors: number;
  rows: number;
  columns: number;
  totalSeats: number;
  status: 'PUBLISHED' | 'DRAFT';
  statusLabel: string;
}

export const AdminSeatTemplatesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<SeatTemplateItem[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFloors, setNewFloors] = useState(2);
  const [newRows, setNewRows] = useState(6);
  const [newCols, setNewCols] = useState(3);
  const [newSeats, setNewSeats] = useState(34);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/seat-templates');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setTemplates(
          res.data.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            floors: t.maxFloor || 2,
            rows: t.maxRows || 6,
            columns: t.maxColumns || 3,
            totalSeats: t.totalSeats || 34,
            status: t.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
            statusLabel: t.status === 'DRAFT' ? 'Bản nháp' : 'Đã xuất bản',
          }))
        );
      }
    } catch (err) {
      console.error('Could not fetch seat templates from API:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mẫu sơ đồ "${name}"?`)) return;
    try {
      await api.delete(`/admin/seat-templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success(`Đã xóa mẫu sơ đồ "${name}" thành công!`, 'Đồng Bộ CSDL');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa mẫu sơ đồ này';
      toast.error(msg, 'Thất Bại');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.warning('Vui lòng nhập tên mẫu sơ đồ ghế!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/seat-templates', {
        name: newName.trim(),
        maxFloor: newFloors,
        maxRows: newRows,
        maxColumns: newCols,
        totalSeats: newSeats,
        status: 'PUBLISHED',
      });
      toast.success(`Tạo mẫu sơ đồ ghế "${newName}" thành công!`, 'Thành Công');
      setShowModal(false);
      setNewName('');
      fetchTemplates();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo mẫu sơ đồ ghế';
      toast.error(msg, 'Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Danh mục <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Mẫu ghế
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Mẫu Sơ Đồ Ghế Xe Khách
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {templates.length} mẫu cấu hình trong hệ thống
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
          <span>Tạo Mẫu Mới</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
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
            placeholder="Tìm kiếm tên mẫu..."
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
          <option value="PUBLISHED">Đã xuất bản</option>
          <option value="DRAFT">Bản nháp</option>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TÊN MẪU SƠ ĐỒ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SỐ TẦNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HÀNG × CỘT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TỔNG CHỖ NGỒI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', width: '80px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải mẫu sơ đồ ghế...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr
                  key={item.id}
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
                        <Grid size={17} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>{item.floors} Tầng</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {item.rows} hàng × {item.columns} cột
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#2563eb' }}>
                    {item.totalSeats} ghế
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: item.status === 'PUBLISHED' ? '#ecfdf5' : '#f1f5f9',
                        color: item.status === 'PUBLISHED' ? '#059669' : '#64748b',
                        border: `1px solid ${item.status === 'PUBLISHED' ? '#a7f3d0' : '#cbd5e1'}`,
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Xóa mẫu"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#dc2626',
                        display: 'flex',
                        borderRadius: '4px',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Không tìm thấy mẫu sơ đồ phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Tạo mẫu mới */}
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
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Tạo Mẫu Sơ Đồ Ghế Mới
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
                  Tên Mẫu Sơ Đồ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Giường Nằm VIP 2 Tầng 38 Chỗ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Số Tầng
                  </label>
                  <select
                    value={newFloors}
                    onChange={(e) => setNewFloors(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value={1}>1 Tầng</option>
                    <option value={2}>2 Tầng</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Tổng Số Ghế *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    required
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Số Hàng
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={15}
                    value={newRows}
                    onChange={(e) => setNewRows(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Số Cột
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={newCols}
                    onChange={(e) => setNewCols(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
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
                  {submitting ? 'Đang tạo...' : 'Lưu Vào CSDL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeatTemplatesPage;
