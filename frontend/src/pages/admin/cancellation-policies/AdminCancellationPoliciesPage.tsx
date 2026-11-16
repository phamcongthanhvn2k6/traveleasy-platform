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
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);

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
      console.error('Could not fetch cancellation policies from API:', err);
      setPolicies([]);
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
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TÊN CHÍNH SÁCH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐỐI TƯỢNG ÁP DỤNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>MÔ TẢ QUY TẮC</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SỐ BẬC HOÀN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LOẠI CHÍNH SÁCH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
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
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPolicy(item)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={13} />
                      <span>Xem quy tắc</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Không tìm thấy chính sách hủy phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
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
      {/* Modal: Chi tiết quy tắc hoàn tiền */}
      {selectedPolicy && (
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
          onClick={() => setSelectedPolicy(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(580px, 94vw)',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedPolicy.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Áp dụng cho: <strong>{selectedPolicy.companyName}</strong> • {selectedPolicy.isDefault ? 'Mặc định sàn' : 'Riêng đối tác'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPolicy(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, marginBottom: '8px' }}>
                <strong>Mô tả chính sách:</strong> {selectedPolicy.description}
              </div>
              <div style={{ fontSize: '11px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} /> Hệ thống tự động tính toán số tiền hoàn dựa trên mốc thời gian khách gửi yêu cầu hủy vé.
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
              Bảng Phân Bậc Tỷ Lệ Hoàn Tiền Theo Mốc Thời Gian
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#065f46' }}>Trước khởi hành trên 24 giờ</div>
                  <div style={{ fontSize: '11.5px', color: '#047857' }}>Hủy vé sớm, không ảnh hưởng điều phối xe</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                  Hoàn 100%
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>Trước khởi hành từ 12 đến 24 giờ</div>
                  <div style={{ fontSize: '11.5px', color: '#b45309' }}>Khấu trừ phí giữ chỗ và điều vận chuyến</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706' }}>
                  Hoàn 70%
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>Trước khởi hành dưới 12 giờ hoặc đã xuất bến</div>
                  <div style={{ fontSize: '11.5px', color: '#b91c1c' }}>Không áp dụng hoàn hủy do sát giờ lăn bánh</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>
                  Hoàn 0%
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedPolicy(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Đã Hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCancellationPoliciesPage;
