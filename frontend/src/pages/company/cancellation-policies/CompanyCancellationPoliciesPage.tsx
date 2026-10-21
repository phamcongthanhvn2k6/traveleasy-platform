import React, { useState, useEffect } from 'react';
import { Plus, Shield, Edit2, Trash2, CheckCircle, X, Info } from 'lucide-react';
import { toast } from '../../../context/ToastContext';

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
  rules: PolicyRule[];
  createdAt: string;
}

const STORAGE_KEY = 'traveleasy_company_cancellation_policies';

const DEFAULT_POLICIES: CancellationPolicy[] = [
  {
    id: 'policy-sys-01',
    name: 'Mặc định hệ thống',
    description: 'Chính sách hoàn tiền chuẩn của sàn TravelEasy áp dụng cho tất cả chuyến xe cơ bản',
    isSystem: true,
    isDefault: true,
    createdAt: '01/01/2026',
    rules: [
      {
        condition: 'Trước khởi hành trên 24 giờ',
        refundRate: '100% hoàn tiền',
        type: 'FULL',
      },
      {
        condition: 'Trước khởi hành 12 - 24 giờ',
        refundRate: '50% hoàn tiền',
        type: 'PARTIAL',
      },
      {
        condition: 'Trước khởi hành dưới 12 giờ',
        refundRate: '0% hoàn tiền (Không hoàn)',
        type: 'NONE',
      },
    ],
  },
  {
    id: 'policy-comp-01',
    name: 'Chính sách Limousine VIP & Cao điểm',
    description: 'Áp dụng cho dòng xe Limousine cao cấp và các dịp Lễ, Tết nhằm đảm bảo quyền lợi vận hành',
    isSystem: false,
    isDefault: false,
    createdAt: '15/09/2026',
    rules: [
      {
        condition: 'Trước khởi hành trên 48 giờ',
        refundRate: '100% hoàn tiền',
        type: 'FULL',
      },
      {
        condition: 'Trước khởi hành 24 - 48 giờ',
        refundRate: '70% hoàn tiền',
        type: 'PARTIAL',
      },
      {
        condition: 'Trước khởi hành dưới 24 giờ',
        refundRate: '0% hoàn tiền (Không hoàn)',
        type: 'NONE',
      },
    ],
  },
];

export const CompanyCancellationPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<CancellationPolicy[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_POLICIES;
  });

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

  // Persist to localStorage whenever policies change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(policies));
    } catch {
      // ignore
    }
  }, [policies]);

  const openCreateModal = () => {
    setEditingPolicy(null);
    setFormName('');
    setFormDesc('');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning('Vui lòng nhập tên chính sách hủy vé!', 'Thiếu Thông Tin');
      return;
    }

    const rules: PolicyRule[] = [
      {
        condition: 'Trước khởi hành trên 24 giờ',
        refundRate: `${rateAbove24} hoàn tiền`,
        type: rateAbove24 === '0%' ? 'NONE' : rateAbove24 === '100%' ? 'FULL' : 'PARTIAL',
      },
      {
        condition: 'Trước khởi hành 12 - 24 giờ',
        refundRate: `${rate12to24} hoàn tiền`,
        type: rate12to24 === '0%' ? 'NONE' : rate12to24 === '100%' ? 'FULL' : 'PARTIAL',
      },
      {
        condition: 'Trước khởi hành dưới 12 giờ',
        refundRate: `${rateBelow12} hoàn tiền${rateBelow12 === '0%' ? ' (Không hoàn)' : ''}`,
        type: rateBelow12 === '0%' ? 'NONE' : rateBelow12 === '100%' ? 'FULL' : 'PARTIAL',
      },
    ];

    if (editingPolicy) {
      // Update existing
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.id === editingPolicy.id) {
            return {
              ...p,
              name: formName.trim(),
              description: formDesc.trim() || 'Chính sách áp dụng của nhà xe',
              isDefault: isDefaultForm,
              rules,
            };
          }
          if (isDefaultForm) {
            return { ...p, isDefault: false };
          }
          return p;
        })
      );
      toast.success(`Đã cập nhật chính sách "${formName}" thành công!`, 'Cập Nhật Thành Công');
    } else {
      // Create new
      const newPolicy: CancellationPolicy = {
        id: `policy-comp-${Date.now()}`,
        name: formName.trim(),
        description: formDesc.trim() || 'Chính sách hoàn/hủy vé tùy chỉnh do nhà xe thiết lập',
        isSystem: false,
        isDefault: isDefaultForm,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        rules,
      };

      setPolicies((prev) => {
        let updated = prev;
        if (isDefaultForm) {
          updated = updated.map((p) => ({ ...p, isDefault: false }));
        }
        return [...updated, newPolicy];
      });
      toast.success(`Đã tạo chính sách hủy vé "${formName}" thành công!`, 'Tạo Thành Công');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (policy: CancellationPolicy) => {
    if (policy.isSystem) {
      toast.warning('Không thể xóa chính sách mặc định của hệ thống!', 'Hành Động Bị Chặn');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa chính sách "${policy.name}"?`)) {
      setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
      toast.success(`Đã xóa chính sách "${policy.name}"!`, 'Đã Xóa');
    }
  };

  const handleSetDefault = (policy: CancellationPolicy) => {
    setPolicies((prev) =>
      prev.map((p) => ({
        ...p,
        isDefault: p.id === policy.id,
      }))
    );
    toast.success(`Đã đặt "${policy.name}" làm chính sách mặc định cho nhà xe!`, 'Chính Sách Mặc Định');
  };

  const customCount = policies.filter((p) => !p.isSystem).length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Chính sách hủy
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Chính sách hủy vé
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {customCount} chính sách của nhà xe + 1 mặc định hệ thống
          </div>
        </div>

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
          <span>Tạo chính sách</span>
        </button>
      </div>

      {/* Grid of Policies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
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
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          gap: '4px'
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
                    fontWeight: 600,
                    backgroundColor: policy.isSystem ? '#eff6ff' : '#f8fafc',
                    color: policy.isSystem ? '#2563eb' : '#475569',
                    border: `1px solid ${policy.isSystem ? '#bfdbfe' : '#e2e8f0'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  <Shield size={12} />
                  <span>{policy.isSystem ? 'Hệ thống' : 'Nhà xe'}</span>
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
                        border: '1px solid #f1f5f9'
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
                          fontWeight: 600,
                          backgroundColor: isZero ? '#fef2f2' : isFull ? '#ecfdf5' : '#fffbeb',
                          color: isZero ? '#dc2626' : isFull ? '#059669' : '#d97706',
                          border: `1px solid ${isZero ? '#fecaca' : isFull ? '#a7f3d0' : '#fde68a'}`
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
                borderTop: '1px solid #f1f5f9'
              }}
            >
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Ngày tạo: {policy.createdAt}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!policy.isDefault && (
                  <button
                    onClick={() => handleSetDefault(policy)}
                    style={{
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                    title="Đặt làm mặc định"
                  >
                    Đặt mặc định
                  </button>
                )}

                {!policy.isSystem && (
                  <>
                    <button
                      onClick={() => openEditModal(policy)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px'
                      }}
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(policy)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px'
                      }}
                      title="Xóa"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Create / Edit Policy */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {editingPolicy ? 'Chỉnh Sửa Chính Sách Hủy' : 'Tạo Chính Sách Hủy Mới'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Cấu hình quy định hoàn tiền khi hành khách yêu cầu hủy vé
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Tên chính sách <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chính sách Limousine ngày Lễ"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mô tả / Ghi chú áp dụng
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Áp dụng cho các tuyến đêm và dòng xe phòng nằm..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Refund Tiers */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                  <Info size={14} color="#4f46e5" /> Quy định tỷ lệ hoàn vé theo mốc giờ
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#334155', fontWeight: 500 }}>Trước khởi hành trên 24 giờ:</span>
                    <select
                      value={rateAbove24}
                      onChange={(e) => setRateAbove24(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="100%">Hoàn 100%</option>
                      <option value="90%">Hoàn 90%</option>
                      <option value="80%">Hoàn 80%</option>
                      <option value="70%">Hoàn 70%</option>
                      <option value="50%">Hoàn 50%</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#334155', fontWeight: 500 }}>Trước khởi hành 12 - 24 giờ:</span>
                    <select
                      value={rate12to24}
                      onChange={(e) => setRate12to24(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="70%">Hoàn 70%</option>
                      <option value="50%">Hoàn 50%</option>
                      <option value="30%">Hoàn 30%</option>
                      <option value="20%">Hoàn 20%</option>
                      <option value="0%">Hoàn 0%</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#334155', fontWeight: 500 }}>Trước khởi hành dưới 12 giờ:</span>
                    <select
                      value={rateBelow12}
                      onChange={(e) => setRateBelow12(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="0%">0% (Không hoàn tiền)</option>
                      <option value="20%">Hoàn 20%</option>
                      <option value="30%">Hoàn 30%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Set default checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="setDefaultCheck"
                  checked={isDefaultForm}
                  onChange={(e) => setIsDefaultForm(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="setDefaultCheck" style={{ fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  Đặt làm chính sách mặc định cho tất cả chuyến xe của nhà xe
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  {editingPolicy ? 'Cập Nhật' : 'Tạo Chính Sách'}
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
