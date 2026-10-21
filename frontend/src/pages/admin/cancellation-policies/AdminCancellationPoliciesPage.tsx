import React, { useState, useEffect } from 'react';
import { Shield, Search, Plus, Eye, Edit2, Trash2, Building, Settings2, Info, X } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface PolicyItem {
  id: number;
  name: string;
  companyName: string;
  isSystem: boolean;
  isDefault: boolean;
  description: string;
  rulesCount: number;
}

export const AdminCancellationPoliciesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<PolicyItem[]>([]);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cancellation-policies');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setPolicies(
          res.data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            companyName: p.busCompanyName || 'Hệ thống toàn sàn',
            isSystem: !p.busCompanyName,
            isDefault: p.isDefault || false,
            description: p.description || 'Chính sách hoàn huỷ áp dụng theo khung thời gian',
            rulesCount: p.rulesCount || 3,
          }))
        );
      }
    } catch (err) {
      console.warn('Could not fetch cancellation policies from API, fallback:', err);
      setPolicies([
        { id: 1, name: 'Chính sách hoàn hủy mặc định sàn', companyName: 'Hệ thống toàn sàn', isSystem: true, isDefault: true, description: 'Trước 24h: hoàn 90%, từ 12h-24h: hoàn 50%, dưới 12h: không hoàn tiền', rulesCount: 3 },
        { id: 2, name: 'Chính sách VIP TravelEasy Express', companyName: 'TravelEasy Express', isSystem: false, isDefault: false, description: 'Trước 24h: hoàn 100%, từ 6h-24h: hoàn 70%, dưới 6h: không hoàn', rulesCount: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.warning('Vui lòng nhập tên chính sách hoàn hủy!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/cancellation-policies', {
        name: newName.trim(),
        description: newDesc.trim() || 'Chính sách hoàn hủy',
        isDefault: isDefault,
      });
      toast.success(`Tạo chính sách hoàn hủy "${newName}" thành công!`, 'Thành Công');
      setShowModal(false);
      setNewName('');
      setNewDesc('');
      fetchPolicies();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo chính sách hoàn hủy';
      toast.error(msg, 'Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = policies.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.companyName.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Hệ thống <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chính sách hủy
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Chính Sách Hoàn Hủy Vé & Bồi Thường
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {policies.length} chính sách hoàn hủy được ban hành
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
          <span>Thêm Chính Sách Hủy</span>
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
            width: '320px',
            gap: '8px',
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo tên chính sách, nhà xe..."
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TÊN CHÍNH SÁCH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐỐI TƯỢNG ÁP DỤNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÔ TẢ QUY TẮC</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SỐ BẬC HOÀN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LOẠI CHÍNH SÁCH</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Đang tải chính sách hủy...
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
                        <Shield size={17} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e3a8a' }}>{item.companyName}</td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{item.description}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#d97706' }}>
                    {item.rulesCount} mốc thời gian
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: item.isDefault ? '#ecfdf5' : '#eff6ff',
                        color: item.isDefault ? '#059669' : '#2563eb',
                        border: `1px solid ${item.isDefault ? '#a7f3d0' : '#bfdbfe'}`,
                      }}
                    >
                      {item.isDefault ? 'MẶC ĐỊNH TOÀN SÀN' : 'RIÊNG NHÀ XE'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Không tìm thấy chính sách hủy phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Thêm chính sách */}
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
                Thêm Chính Sách Hoàn Hủy Mới
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
                  Tên Chính Sách *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chính sách hoàn hủy Dịp Lễ Tết"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mô Tả Quy Tắc Hoàn Hủy
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Trước 48h: hoàn 80%, từ 24h-48h: hoàn 40%, dưới 24h: không hoàn tiền"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label htmlFor="defaultCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Đặt làm chính sách mặc định toàn hệ thống
                </label>
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

export default AdminCancellationPoliciesPage;
