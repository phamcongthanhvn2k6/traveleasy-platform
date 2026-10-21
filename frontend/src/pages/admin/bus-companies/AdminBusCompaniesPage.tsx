import React, { useState, useEffect } from 'react';
import { Bus, Eye, Ban, Check, Plus, RefreshCw, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface BusCompanyItem {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  statusLabel: string;
  createdAt: string;
}

export const AdminBusCompaniesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [companies, setCompanies] = useState<BusCompanyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Create
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formHotline, setFormHotline] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Edit
  const [editingCompany, setEditingCompany] = useState<BusCompanyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editHotline, setEditHotline] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bus-companies');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCompanies(
          res.data.data.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            code: c.code || `SK-2026-0${c.id}`,
            email: c.email || 'partner@traveleasy.vn',
            phone: c.phone || '1900 6067',
            address: c.address || 'Việt Nam',
            status: c.status === 'PENDING_APPROVAL' ? 'PENDING' : c.status,
            statusLabel: c.statusLabel || (c.status === 'ACTIVE' ? 'Hoạt động' : c.status === 'SUSPENDED' ? 'Tạm ngưng' : 'Chờ duyệt'),
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '16:00 01/01/2026',
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load companies from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formHotline.trim()) {
      toast.warning('Vui lòng nhập tên nhà xe và số hotline!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        code: formCode.trim() || `SK-${Date.now().toString().slice(-4)}`,
        hotline: formHotline.trim(),
        email: formEmail.trim() || `${formCode.toLowerCase() || 'partner'}@traveleasy.vn`,
        address: formAddress.trim() || 'TP. Hồ Chí Minh',
        status: 'ACTIVE',
      };

      const res = await api.post('/admin/bus-companies', payload);
      if (res.data?.data) {
        toast.success(`Đã thêm đối tác nhà xe "${payload.name}" thành công!`, 'Thêm Nhà Xe');
        setShowModal(false);
        setFormName('');
        setFormCode('');
        setFormHotline('');
        setFormEmail('');
        setFormAddress('');
        fetchCompanies();
      }
    } catch (err: any) {
      console.error('Create company error:', err);
      toast.error(err.response?.data?.message || 'Thêm đối tác nhà xe thất bại!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (c: BusCompanyItem) => {
    setEditingCompany(c);
    setEditName(c.name);
    setEditCode(c.code);
    setEditHotline(c.phone);
    setEditEmail(c.email);
    setEditAddress(c.address || '');
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    setSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        code: editCode.trim(),
        hotline: editHotline.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
      };

      await api.put(`/admin/bus-companies/${editingCompany.id}`, payload);
      toast.success(`Đã cập nhật nhà xe "${payload.name}" thành công!`, 'Cập Nhật Thành Công');
      setEditingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      console.error('Update company error:', err);
      toast.error(err.response?.data?.message || 'Cập nhật nhà xe thất bại!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (c: BusCompanyItem) => {
    if (!window.confirm(`Bạn có chắc muốn XOÁ đối tác nhà xe "${c.name}"? Thao tác này không thể hoàn tác!`)) {
      return;
    }

    try {
      await api.delete(`/admin/bus-companies/${c.id}`);
      setCompanies(prev => prev.filter(item => item.id !== c.id));
      toast.info(`Đã xoá nhà xe "${c.name}" thành công!`, 'Xoá Nhà Xe');
    } catch (err: any) {
      console.error('Delete company error:', err);
      toast.error(err.response?.data?.message || 'Xoá nhà xe thất bại!', 'Lỗi');
    }
  };

  const toggleCompanyStatus = async (id: string) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;
    const willSuspend = target.status === 'ACTIVE';
    const newStatus = willSuspend ? 'SUSPENDED' : 'ACTIVE';

    try {
      await api.patch(`/admin/bus-companies/${id}/status`, null, { params: { status: newStatus } });
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          if (willSuspend) {
            return { ...c, status: 'SUSPENDED', statusLabel: 'Tạm ngưng' };
          }
          return { ...c, status: 'ACTIVE', statusLabel: 'Hoạt động' };
        })
      );

      if (willSuspend) {
        toast.warning(`Đã tạm ngưng hoạt động nhà xe "${target.name}"!`, 'Tạm Ngưng Nhà Xe');
      } else {
        toast.success(`Đã kích hoạt nhà xe "${target.name}" hoạt động trở lại!`, 'Kích Hoạt Nhà Xe');
      }
    } catch (err: any) {
      console.error('Update company status error:', err);
      toast.error('Cập nhật trạng thái nhà xe thất bại!', 'Lỗi');
    }
  };

  const pendingCount = companies.filter((c) => c.status === 'PENDING').length;

  const filteredCompanies = companies.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Nhà xe</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Đối Tác Nhà Xe (Thêm - Sửa - Xóa)
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {pendingCount} chờ duyệt, <strong>{companies.length}</strong> đối tác đang liên kết
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchCompanies}
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
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <Plus size={16} /> Thêm Nhà Xe Mới
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: 'Chờ duyệt' },
          { key: 'ACTIVE', label: 'Hoạt động' },
          { key: 'SUSPENDED', label: 'Tạm ngưng' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
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
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TÊN NHÀ XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LIÊN HỆ & HOTLINE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGÀY TẠO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách nhà xe từ CSDL...
                </td>
              </tr>
            ) : filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy nhà xe nào.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((c) => {
                const statusStyles = {
                  ACTIVE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                  PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                  SUSPENDED: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
                }[c.status];

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: '#eef2ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Bus size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#334155' }}>{c.email}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>{c.phone}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: statusStyles.bg,
                          color: statusStyles.text,
                          border: `1px solid ${statusStyles.border}`,
                        }}
                      >
                        {c.statusLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{c.createdAt}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Nút Sửa */}
                        <button
                          onClick={() => openEditModal(c)}
                          title="Sửa thông tin nhà xe"
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit2 size={13} /> Sửa
                        </button>

                        {/* Nút Tạm ngưng / Kích hoạt */}
                        {c.status === 'ACTIVE' ? (
                          <button
                            onClick={() => toggleCompanyStatus(c.id)}
                            title="Tạm ngưng nhà xe"
                            style={{
                              backgroundColor: '#fffbeb',
                              color: '#d97706',
                              border: '1px solid #fde68a',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Ban size={13} /> Ngưng
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleCompanyStatus(c.id)}
                            title="Kích hoạt nhà xe"
                            style={{
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={13} /> Duyệt
                          </button>
                        )}

                        {/* Nút Xoá */}
                        <button
                          onClick={() => handleDeleteCompany(c)}
                          title="Xoá nhà xe"
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={13} /> Xóa
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

      {/* Modal: Thêm Nhà Xe Mới */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thêm Đối Tác Nhà Xe Mới</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Đồng bộ đối tác và kích hoạt mở bán trên sàn</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Nhà Xe / Đơn Vị Vận Tải <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Phương Trang FUTA Bus Lines"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mã Nhà Xe (Code)
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="VD: FUTA, KUMHO"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Hotline Đặt Vé <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formHotline}
                      onChange={(e) => setFormHotline(e.target.value)}
                      placeholder="VD: 1900 6067"
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="VD: contact@futabus.vn"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Chỉ Trụ Sở Chính
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="VD: 486-486A Lê Văn Lương, Q.7, TP.HCM"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Đang lưu...' : 'Thêm Nhà Xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sửa Nhà Xe */}
      {editingCompany && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Cập Nhật Nhà Xe #{editingCompany.id}</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{editingCompany.name}</div>
                </div>
              </div>
              <button onClick={() => setEditingCompany(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tên Nhà Xe <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mã Nhà Xe
                    </label>
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Hotline Đặt Vé <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={editHotline}
                      onChange={(e) => setEditHotline(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Địa Chỉ Trụ Sở
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusCompaniesPage;
