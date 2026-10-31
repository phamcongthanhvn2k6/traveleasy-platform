import React, { useState, useEffect } from 'react';
import { Bus, Eye, Ban, Check, RefreshCw, X, Edit2, Trash2, FileText, Phone, Mail, MapPin, Building2, User, ShieldAlert, Award } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface BusCompanyItem {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  statusLabel: string;
  createdAt: string;
}

export const AdminBusCompaniesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'>('ALL');
  const [companies, setCompanies] = useState<BusCompanyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Edit
  const [editingCompany, setEditingCompany] = useState<BusCompanyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editHotline, setEditHotline] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal View Dossier
  const [viewingCompany, setViewingCompany] = useState<BusCompanyItem | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bus-companies');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCompanies(
          res.data.data.map((c: any) => {
            const rawStatus = c.status || 'ACTIVE';
            const mappedStatus = (rawStatus === 'PENDING_APPROVAL' || rawStatus === 'PENDING')
              ? 'PENDING'
              : rawStatus === 'REJECTED'
              ? 'REJECTED'
              : rawStatus === 'SUSPENDED'
              ? 'SUSPENDED'
              : 'ACTIVE';

            const mappedLabel = mappedStatus === 'PENDING'
              ? 'Chờ thẩm định'
              : mappedStatus === 'REJECTED'
              ? 'Bị từ chối'
              : mappedStatus === 'SUSPENDED'
              ? 'Tạm ngưng'
              : 'Đang hoạt động';

            return {
              id: String(c.id),
              name: c.name,
              code: c.code || `SK-2026-0${c.id}`,
              email: c.email || 'partner@traveleasy.vn',
              phone: c.hotline || c.phone || '1900 6067',
              address: c.address || 'Việt Nam',
              status: mappedStatus,
              statusLabel: c.statusLabel || mappedLabel,
              createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '16:00 01/01/2026',
            };
          })
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
    if (!window.confirm(`Bạn có chắc muốn XOÁ đối tác nhà xe "${c.name}"? Thao tác này chỉ thực hiện được khi nhà xe chưa có chuyến xe hay đơn vé nào!`)) {
      return;
    }

    try {
      await api.delete(`/admin/bus-companies/${c.id}`);
      setCompanies(prev => prev.filter(item => item.id !== c.id));
      toast.info(`Đã xoá nhà xe "${c.name}" thành công!`, 'Xoá Nhà Xe');
    } catch (err: any) {
      console.error('Delete company error:', err);
      toast.error(err.response?.data?.message || 'Xoá nhà xe thất bại! Nhà xe đang có dữ liệu liên quan.', 'Lỗi');
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
          return { ...c, status: 'ACTIVE', statusLabel: 'Đang hoạt động' };
        })
      );

      if (target.status === 'PENDING') {
        toast.success(
          `Đã phê duyệt đối tác "${target.name}" lên sàn TravelEasy thành công! Hệ thống đã cấp tài khoản Điều Hành (OPERATOR) cho email ${target.email}.`,
          'Phê Duyệt Thành Công'
        );
      } else if (willSuspend) {
        toast.warning(`Đã tạm ngưng hiển thị đối tác "${target.name}" trên sàn!`, 'Tạm Ngưng Đối Tác');
      } else {
        toast.success(`Đã kích hoạt đối tác "${target.name}" mở bán trở lại!`, 'Kích Hoạt Đối Tác');
      }
    } catch (err: any) {
      console.error('Update company status error:', err);
      toast.error('Cập nhật trạng thái nhà xe thất bại!', 'Lỗi');
    }
  };

  const handleRejectCompany = async (c: BusCompanyItem) => {
    const reason = window.prompt(
      `Vui lòng nhập lý do từ chối hồ sơ đăng ký của đối tác "${c.name}":`,
      'Hồ sơ chưa cung cấp đầy đủ giấy phép kinh doanh vận tải hợp lệ'
    );
    if (!reason || !reason.trim()) return;

    try {
      await api.post(`/admin/bus-companies/${c.id}/reject`, null, { params: { reason: reason.trim() } });
      setCompanies(prev =>
        prev.map(item => item.id === c.id ? { ...item, status: 'REJECTED', statusLabel: 'Bị từ chối' } : item)
      );
      toast.warning(`Đã từ chối hồ sơ đối tác "${c.name}" với lý do: ${reason}`, 'Từ Chối Hồ Sơ');
    } catch (err: any) {
      console.error('Reject company error:', err);
      toast.error('Không thể từ chối hồ sơ!', 'Lỗi');
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
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị sàn <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Hồ sơ đối tác nhà xe</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Thẩm Định &amp; Xét Duyệt Đối Tác Nhà Xe
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            <span style={{ color: pendingCount > 0 ? '#b45309' : '#64748b', fontWeight: pendingCount > 0 ? 700 : 500 }}>
              {pendingCount} hồ sơ chờ thẩm định
            </span>
            , <strong>{companies.length}</strong> đối tác liên kết trên hệ thống
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
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} /> Làm mới danh sách
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Tất cả đối tác' },
          { key: 'PENDING', label: `Chờ thẩm định (${pendingCount})`, highlight: pendingCount > 0 },
          { key: 'ACTIVE', label: 'Đang hoạt động' },
          { key: 'REJECTED', label: 'Bị từ chối' },
          { key: 'SUSPENDED', label: 'Tạm ngưng' },
        ].map((tab: any) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: isActive ? '#2563eb' : tab.highlight ? '#fef3c7' : '#ffffff',
                color: isActive ? '#ffffff' : tab.highlight ? '#b45309' : '#64748b',
                border: isActive ? '1px solid #2563eb' : tab.highlight ? '1px solid #fde68a' : '1px solid #e2e8f0',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: tab.highlight || isActive ? 700 : 600,
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐƠN VỊ VẬN TẢI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>LIÊN HỆ &amp; EMAIL ĐIỀU HÀNH</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGÀY NỘP / TẠO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>THAO TÁC XỬ LÝ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách hồ sơ đối tác từ CSDL...
                </td>
              </tr>
            ) : filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy hồ sơ nhà xe nào trong mục này.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((c) => {
                const statusStyles = {
                  ACTIVE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                  PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                  REJECTED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
                  SUSPENDED: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
                }[c.status] || { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };

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
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: c.status === 'PENDING' ? '#fef3c7' : '#eff6ff',
                            color: c.status === 'PENDING' ? '#d97706' : '#2563eb',
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
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mã đối tác: {c.code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#334155' }}>{c.email}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Hotline: {c.phone}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
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
                        {/* Nút Thẩm Định / Xem Hồ Sơ */}
                        <button
                          onClick={() => setViewingCompany(c)}
                          title="Xem chi tiết hồ sơ thẩm định đối tác"
                          style={{
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} /> {c.status === 'PENDING' ? 'Thẩm Định' : 'Hồ Sơ'}
                        </button>

                        {/* Thao tác theo trạng thái */}
                        {c.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => toggleCompanyStatus(c.id)}
                              title="Phê duyệt đối tác và cấp tài khoản điều hành"
                              style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: '1px solid #059669',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 5px rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              <Check size={13} /> Duyệt
                            </button>

                            <button
                              onClick={() => handleRejectCompany(c)}
                              title="Từ chối hồ sơ đăng ký đối tác"
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <X size={13} /> Từ chối
                            </button>
                          </>
                        ) : c.status === 'REJECTED' ? (
                          <button
                            onClick={() => toggleCompanyStatus(c.id)}
                            title="Xét duyệt lại hồ sơ và mở hoạt động"
                            style={{
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Check size={13} /> Duyệt lại
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(c)}
                              title="Sửa thông tin liên hệ nhà xe"
                              style={{
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                padding: '6px 10px',
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

                            {c.status === 'ACTIVE' ? (
                              <button
                                onClick={() => toggleCompanyStatus(c.id)}
                                title="Tạm ngưng mở bán vé nhà xe"
                                style={{
                                  backgroundColor: '#fffbeb',
                                  color: '#d97706',
                                  border: '1px solid #fde68a',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
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
                                title="Mở lại hoạt động nhà xe"
                                style={{
                                  backgroundColor: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Check size={13} /> Mở lại
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteCompany(c)}
                              title="Xoá nhà xe (nếu chưa phát sinh dữ liệu)"
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '6px 10px',
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Sửa Thông Tin Cơ Bản */}
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
                      Mã Đối Tác
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
                    Địa Chỉ Trụ Sở / Đăng Ký
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

      {/* Modal: Thẩm Định Hồ Sơ Đối Tác Chiến Lược */}
      {viewingCompany && (() => {
        const addr = viewingCompany.address || '';
        let rep = '';
        let taxCode = '';
        let fleet = '';
        let routes = '';
        let bizAddress = '';

        if (addr.includes(' | ')) {
          addr.split(' | ').forEach((p) => {
            if (p.startsWith('Đại diện: ')) rep = p.replace('Đại diện: ', '');
            else if (p.startsWith('MST: ')) taxCode = p.replace('MST: ', '');
            else if (p.startsWith('Quy mô: ')) fleet = p.replace('Quy mô: ', '');
            else if (p.startsWith('Tuyến: ')) routes = p.replace('Tuyến: ', '');
            else if (p.startsWith('Trụ sở: ')) bizAddress = p.replace('Trụ sở: ', '');
          });
        }

        const isPending = viewingCompany.status === 'PENDING';

        return (
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
                maxWidth: '620px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                overflow: 'hidden',
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
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: isPending ? '#fef3c7' : '#eff6ff',
                      color: isPending ? '#d97706' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Thẩm Định Hồ Sơ Đăng Ký Đối Tác
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Mã đối tác: <strong style={{ color: '#0f172a' }}>{viewingCompany.code || 'Chưa cấp'}</strong> • ID #{viewingCompany.id}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewingCompany(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Header card with name and badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                      DOANH NGHIỆP VẬN TẢI
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {viewingCompany.name}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: isPending ? '#fef3c7' : viewingCompany.status === 'ACTIVE' ? '#dcfce7' : viewingCompany.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                      color: isPending ? '#b45309' : viewingCompany.status === 'ACTIVE' ? '#15803d' : viewingCompany.status === 'REJECTED' ? '#b91c1c' : '#475569',
                      border: `1px solid ${isPending ? '#fde68a' : viewingCompany.status === 'ACTIVE' ? '#bbf7d0' : viewingCompany.status === 'REJECTED' ? '#fecaca' : '#cbd5e1'}`,
                    }}
                  >
                    {isPending ? '⏳ Chờ Ban Quản Trị Thẩm Định' : viewingCompany.statusLabel}
                  </span>
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <User size={13} /> NGƯỜI ĐẠI DIỆN PHÁP LUẬT
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {rep || 'Chưa cung cấp'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Award size={13} /> MÃ SỐ THUẾ / SỐ ĐKKD
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {taxCode || 'Đang xác minh'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Phone size={13} /> HOTLINE LIÊN HỆ
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                      {viewingCompany.phone || 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Mail size={13} /> EMAIL ĐIỀU HÀNH (TÀI KHOẢN)
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', wordBreak: 'break-all' }}>
                      {viewingCompany.email || 'Không cung cấp'}
                    </div>
                  </div>
                </div>

                {/* Fleet & Routes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Building2 size={13} /> QUY MÔ ĐỘI XE
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {fleet || 'Chưa xác định'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <MapPin size={13} /> TUYẾN ĐƯỜNG ĐĂNG KÝ
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {routes || 'Khai thác liên tỉnh'}
                    </div>
                  </div>
                </div>

                {/* Registered Business Address */}
                <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fcfcfd', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <MapPin size={13} /> ĐỊA CHỈ TRỤ SỞ ĐĂNG KÝ KINH DOANH
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {bizAddress || viewingCompany.address || 'Đang cập nhật'}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setViewingCompany(null)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Đóng
                  </button>

                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          const target = viewingCompany;
                          setViewingCompany(null);
                          await handleRejectCompany(target);
                        }}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '8px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <X size={15} /> Từ Chối Hồ Sơ
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const targetId = viewingCompany.id;
                          setViewingCompany(null);
                          await toggleCompanyStatus(targetId);
                        }}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
                        }}
                      >
                        <Check size={16} /> Phê Duyệt &amp; Cấp Tài Khoản Đối Tác
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminBusCompaniesPage;