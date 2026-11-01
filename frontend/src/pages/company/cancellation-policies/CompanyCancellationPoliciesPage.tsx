import React, { useState, useEffect } from 'react';
import { Plus, Shield, Edit2, Trash2, CheckCircle, X, Info, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { getStoredCompany } from '../../../utils/companyHelper';

export interface PolicyRule {
  condition: string;
  refundRate: string;
  type: 'FULL' | 'PARTIAL' | 'NONE';
}

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  isDefault: boolean;
  busCompanyName?: string;
  rules: PolicyRule[];
  createdAt: string;
}

export const CompanyCancellationPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<CancellationPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Nhận diện nhà xe đang đăng nhập từ tài khoản người dùng
  const companyInfo = getStoredCompany();
  const currentCompany = companyInfo.name;

  const isSystemCheck = (p: any) => {
    const bName = (p.busCompanyName || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();
    return (
      bName.includes('hệ thống') ||
      bName.includes('traveleasy') ||
      bName.includes('toàn sàn') ||
      pName.includes('tiêu chuẩn traveleasy') ||
      (Boolean(p.isDefault) && String(p.id) === '1')
    );
  };

  const fetchPoliciesFromDb = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/cancellation-policies', {
        params: {
          companyId: companyInfo.id,
          companyName: companyInfo.name,
        },
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: CancellationPolicy[] = res.data.data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          description: p.description || 'Quy định hoàn hủy vé theo khung thời gian khởi hành',
          isSystem: isSystemCheck(p),
          isDefault: Boolean(p.isDefault),
          busCompanyName: p.busCompanyName || (isSystemCheck(p) ? 'Hệ thống TravelEasy' : `Nhà xe ${currentCompany}`),
          createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '29/10/2026',
          rules: [
            { condition: 'Trước giờ khởi hành >= 24 tiếng', refundRate: '100%', type: 'FULL' },
            { condition: 'Từ 12 đến 24 tiếng trước khởi hành', refundRate: '50%', type: 'PARTIAL' },
            { condition: 'Dưới 12 tiếng trước khởi hành', refundRate: '0%', type: 'NONE' },
          ],
        }));
        setPolicies(mapped);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load cancellation policies from Supabase:', err);
      toast.error('Không thể tải chính sách hủy vé từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliciesFromDb();
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CancellationPolicy | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [rateAbove24, setRateAbove24] = useState('100%');
  const [rate12to24, setRate12to24] = useState('50%');
  const [rateBelow12, setRateBelow12] = useState('0%');
  const [isDefaultForm, setIsDefaultForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingPolicy(null);
    setFormName(`Chính sách hoàn hủy ${currentCompany}`);
    setFormDesc(`Áp dụng hoàn hủy linh hoạt cho các chuyến xe thuộc nhà xe ${currentCompany}`);
    setRateAbove24('100%');
    setRate12to24('50%');
    setRateBelow12('0%');
    setIsDefaultForm(false);
    setIsModalOpen(true);
  };

  const openEditModal = (policy: CancellationPolicy) => {
    if (policy.isSystem) {
      toast.warning('Chính sách mặc định của hệ thống không thể chỉnh sửa.', 'Thông Báo');
      return;
    }
    setEditingPolicy(policy);
    setFormName(policy.name);
    setFormDesc(policy.description);
    setRateAbove24(policy.rules[0]?.refundRate.replace(' hoàn tiền', '') || '100%');
    setRate12to24(policy.rules[1]?.refundRate.replace(' hoàn tiền', '') || '50%');
    setRateBelow12(policy.rules[2]?.refundRate.replace(' hoàn tiền (Không hoàn)', '').replace(' hoàn tiền', '') || '0%');
    setIsDefaultForm(policy.isDefault);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning('Vui lòng nhập tên chính sách hủy vé!', 'Thiếu Thông Tin');
      return;
    }

    setSaving(true);
    try {
      if (editingPolicy) {
        await api.put(`/company/cancellation-policies/${editingPolicy.id}`, {
          name: formName.trim(),
          description: formDesc.trim() || `Chính sách hoàn tiền của ${currentCompany}`,
          isDefault: isDefaultForm,
          companyName: currentCompany,
        });
        toast.success(`Đã cập nhật chính sách "${formName}" vào CSDL!`, 'Cập Nhật Thành Công');
      } else {
        await api.post('/company/cancellation-policies', {
          name: formName.trim(),
          description: formDesc.trim() || `Chính sách hoàn tiền của ${currentCompany}`,
          isDefault: isDefaultForm,
          companyName: currentCompany,
        });
        toast.success(`Đã lưu chính sách hủy vé "${formName}" cho nhà xe ${currentCompany}!`, 'Lưu Thành Công');
      }
      await fetchPoliciesFromDb();
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu chính sách hủy vé!';
      toast.error(msg, 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (policy: CancellationPolicy) => {
    if (policy.isSystem) {
      toast.warning('Chính sách quy chuẩn toàn sàn của hệ thống không thể xóa!', 'Hành Động Bị Chặn');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chính sách "${policy.name}" của nhà xe ${currentCompany}?`)) {
      return;
    }
    try {
      await api.delete(`/company/cancellation-policies/${policy.id}`, {
        params: { companyName: currentCompany },
      });
      toast.success(`Đã xóa chính sách "${policy.name}" khỏi CSDL!`, 'Đã Xóa');
      await fetchPoliciesFromDb();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể xóa chính sách!';
      toast.error(msg, 'Lỗi Phân Quyền');
    }
  };

  const handleSetDefault = async (policy: CancellationPolicy) => {
    try {
      await api.patch(`/company/cancellation-policies/${policy.id}/set-default`, null, {
        params: { companyName: currentCompany },
      });
      toast.success(`Đã đặt "${policy.name}" làm chính sách mặc định cho ${currentCompany}!`, 'Chính Sách Mặc Định');
      await fetchPoliciesFromDb();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể đặt mặc định!';
      toast.error(msg, 'Lỗi');
    }
  };

  const ownPolicies = policies.filter((p) => !p.isSystem);
  const systemPolicies = policies.filter((p) => p.isSystem);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Vận hành{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chính sách hủy riêng
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Chính Sách Hoàn Hủy Vé — {currentCompany}
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {ownPolicies.length} chính sách của nhà xe + {systemPolicies.length} quy chuẩn mặc định toàn sàn
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchPoliciesFromDb}
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
          <button
            onClick={openCreateModal}
            style={{
              backgroundColor: '#4f46e5',
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
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
            }}
          >
            <Plus size={16} />
            <span>Tạo chính sách riêng</span>
          </button>
        </div>
      </div>

      {/* Tenant Isolation Security Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px 18px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          marginBottom: '22px',
          fontSize: '13px',
          color: '#166534',
          lineHeight: 1.5,
        }}
      >
        <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Bảo mật phân quyền đối tác (Tenant Isolation):</strong> Nhà xe{' '}
          <strong>{currentCompany}</strong> chỉ được xem, chỉnh sửa và quản lý các chính sách hoàn hủy riêng do chính đơn vị
          mình sở hữu. Toàn bộ chính sách của các nhà xe đối tác khác trên sàn (Phương Trang, Thành Bưởi, Hoa Mai,...)
          được bảo mật tuyệt đối và ẩn hoàn toàn. Chính sách mặc định toàn sàn là quy chuẩn dùng chung đối sánh dự phòng,
          nhà xe không thể sửa đổi hoặc xóa bỏ.
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
          Đang tải danh sách chính sách hoàn hủy của {currentCompany}...
        </div>
      ) : policies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          Chưa có chính sách hoàn hủy nào. Hãy nhấn <strong>"Tạo chính sách riêng"</strong> để bắt đầu.
        </div>
      ) : (
        /* Grid of Policies */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
          {policies.map((policy) => (
            <div
              key={policy.id}
              style={{
                backgroundColor: '#ffffff',
                border: policy.isDefault ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {policy.name}
                      </h2>
                      {policy.isDefault && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: '#eef2ff',
                            color: '#4f46e5',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #c7d2fe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle size={11} /> Mặc định áp dụng
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      {policy.description}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: policy.isSystem ? '#eff6ff' : '#ecfdf5',
                      color: policy.isSystem ? '#2563eb' : '#059669',
                      border: `1px solid ${policy.isSystem ? '#bfdbfe' : '#a7f3d0'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={12} />
                    <span>{policy.isSystem ? 'Hệ thống Sàn' : `Nhà xe ${currentCompany}`}</span>
                  </span>
                </div>

                {/* Rules List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  {policy.rules.map((rule, idx) => {
                    const isZero = rule.type === 'NONE';
                    const isFull = rule.type === 'FULL';
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                          {rule.condition}
                        </span>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isZero ? '#fef2f2' : isFull ? '#ecfdf5' : '#fffbeb',
                            color: isZero ? '#dc2626' : isFull ? '#059669' : '#d97706',
                            border: `1px solid ${isZero ? '#fecaca' : isFull ? '#a7f3d0' : '#fde68a'}`,
                          }}
                        >
                          {rule.refundRate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Ngày tạo: {policy.createdAt}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {policy.isSystem ? (
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#f1f5f9',
                        padding: '4px 10px',
                        borderRadius: '6px',
                      }}
                      title="Quy chuẩn toàn sàn của TravelEasy Platform. Không được sửa đổi hay xóa bỏ."
                    >
                      <Lock size={12} color="#64748b" /> Quy chuẩn sàn (Chỉ xem)
                    </span>
                  ) : (
                    <>
                      {!policy.isDefault && (
                        <button
                          onClick={() => handleSetDefault(policy)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                          title={`Đặt làm mặc định cho nhà xe ${currentCompany}`}
                        >
                          Đặt mặc định
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(policy)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '5px 7px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                        }}
                        title="Chỉnh sửa chính sách của nhà xe"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(policy)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '5px 7px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '6px',
                        }}
                        title="Xóa chính sách của nhà xe"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Create / Edit Policy */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {editingPolicy ? 'Chỉnh Sửa Chính Sách Hoàn Hủy' : 'Tạo Chính Sách Hoàn Hủy Riêng'}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Áp dụng cho: <strong>Nhà xe {currentCompany}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên chính sách <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={`VD: Chính sách mùa cao điểm ${currentCompany}`}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Mô tả ngắn gọn
                  </label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Mô tả tóm tắt quy định hoàn trả..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Khung tỷ lệ hoàn tiền theo giờ khởi hành
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Khởi hành {'>='} 24h
                      </label>
                      <select
                        value={rateAbove24}
                        onChange={(e) => setRateAbove24(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="100%">Hoàn 100%</option>
                        <option value="95%">Hoàn 95%</option>
                        <option value="90%">Hoàn 90%</option>
                        <option value="85%">Hoàn 85%</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        Khởi hành từ 12h - 24h
                      </label>
                      <select
                        value={rate12to24}
                        onChange={(e) => setRate12to24(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="70%">Hoàn 70%</option>
                        <option value="50%">Hoàn 50%</option>
                        <option value="30%">Hoàn 30%</option>
                        <option value="0%">Không hoàn (0%)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Khởi hành {'<'} 12h
                    </label>
                    <select
                      value={rateBelow12}
                      onChange={(e) => setRateBelow12(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="0%">Không hoàn tiền (0%)</option>
                      <option value="20%">Hoàn 20%</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isDefaultPolicyCheck"
                    checked={isDefaultForm}
                    onChange={(e) => setIsDefaultForm(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  <label htmlFor="isDefaultPolicyCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    Đặt làm chính sách mặc định cho toàn bộ chuyến xe của nhà xe {currentCompany}
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Đang lưu...' : editingPolicy ? 'Lưu Thay Đổi' : 'Tạo Chính Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCancellationPoliciesPage;
