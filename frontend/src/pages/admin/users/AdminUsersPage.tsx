import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Search, Plus, RefreshCw, X, User, Edit2, Trash2 } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface UserItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
  roleLabel: string;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Create
  const [showModal, setShowModal] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('123456789@');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'CUSTOMER' | 'OPERATOR' | 'ADMIN'>('CUSTOMER');
  const [submitting, setSubmitting] = useState(false);

  // Modal Edit
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'CUSTOMER' | 'OPERATOR' | 'ADMIN'>('CUSTOMER');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setUsers(
          res.data.data.map((u: any) => ({
            id: String(u.id),
            fullName: u.fullName || u.email?.split('@')[0] || 'Người dùng',
            phone: u.phone || 'Chưa cập nhật',
            email: u.email,
            role: u.role,
            roleLabel: u.role === 'ADMIN' ? 'Quản trị viên' : u.role === 'OPERATOR' ? 'Nhà xe' : 'Khách hàng',
            status: u.status,
            createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '16:00 01/01/2026',
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load users from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formPassword.trim() || !formFullName.trim()) {
      toast.warning('Vui lòng điền họ tên, email và mật khẩu!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        password: formPassword.trim(),
        phone: formPhone.trim() || '0901234567',
        role: formRole,
      };

      const res = await api.post('/admin/users', payload);
      if (res.data?.data) {
        toast.success(`Đã thêm tài khoản "${payload.email}" (${formRole}) thành công!`, 'Tạo Tài Khoản Thành Công');
        setShowModal(false);
        setFormFullName('');
        setFormEmail('');
        setFormPhone('');
        fetchUsers();
      }
    } catch (err: any) {
      console.error('Create user error:', err);
      toast.error(err.response?.data?.message || 'Tạo tài khoản thất bại!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditPhone(u.phone === 'Chưa cập nhật' ? '' : u.phone);
    setEditRole(u.role);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFullName.trim()) {
      toast.warning('Vui lòng nhập họ và tên!', 'Thiếu Thông Tin');
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        role: editRole,
      });

      toast.success(`Cập nhật thông tin tài khoản "${editingUser.email}" thành công!`, 'Cập Nhật Thành Công');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Update user error:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật người dùng', 'Thất Bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (u.email === 'admin@traveleasy.vn') {
      toast.error('Không thể xóa tài khoản Quản trị viên tối cao!', 'Bị Từ Chối');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.email}" (${u.fullName}) khỏi hệ thống?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${u.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      toast.success(`Đã xóa người dùng "${u.email}" khỏi cơ sở dữ liệu!`, 'Đã Xóa');
    } catch (err: any) {
      console.error('Delete user error:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa người dùng này', 'Thất Bại');
    }
  };

  const toggleUserLock = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const willLock = target.status === 'ACTIVE';

    try {
      await api.patch(`/admin/users/${id}/status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: willLock ? 'LOCKED' : 'ACTIVE' } : u))
      );

      if (willLock) {
        toast.warning(`Đã khóa tài khoản "${target.email}" thành công!`, 'Khóa Tài Khoản');
      } else {
        toast.success(`Đã mở khóa tài khoản "${target.email}" thành công!`, 'Mở Khóa Tài Khoản');
      }
    } catch (err: any) {
      console.error('Lock/Unlock user error:', err);
      toast.error('Cập nhật trạng thái người dùng thất bại!', 'Lỗi');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || u.phone.includes(q) || u.fullName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Người dùng</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Quản Lý Người Dùng & Phân Quyền
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Tổng số: <strong>{users.length}</strong> tài khoản trong cơ sở dữ liệu
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchUsers}
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
            <Plus size={16} /> Thêm Người Dùng Mới
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên, email hoặc SĐT..."
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '9px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '9px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên (ADMIN)</option>
          <option value="OPERATOR">Đối tác Nhà xe (OPERATOR)</option>
          <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '9px 14px',
            fontSize: '13px',
            color: '#334155',
            outline: 'none',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động (ACTIVE)</option>
          <option value="LOCKED">Bị khóa (LOCKED)</option>
        </select>
      </div>

      {/* Users Table */}
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>HỌ TÊN & EMAIL</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SỐ ĐIỆN THOẠI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>VAI TRÒ (ROLE)</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGÀY TẠO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải danh sách người dùng từ CSDL...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isLocked = u.status === 'LOCKED';
                const roleStyles = {
                  ADMIN: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
                  OPERATOR: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
                  CUSTOMER: { bg: '#f1f5f9', text: '#334155', border: '#e2e8f0' },
                }[u.role] || { bg: '#f1f5f9', text: '#334155', border: '#e2e8f0' };

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{u.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>User #{u.id}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>{u.phone}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: roleStyles.bg,
                          color: roleStyles.text,
                          border: `1px solid ${roleStyles.border}`,
                        }}
                      >
                        {u.roleLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: isLocked ? '#fee2e2' : '#ecfdf5',
                          color: isLocked ? '#dc2626' : '#059669',
                          border: `1px solid ${isLocked ? '#fecaca' : '#a7f3d0'}`,
                        }}
                      >
                        {isLocked ? 'Bị khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{u.createdAt}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => toggleUserLock(u.id)}
                          title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          style={{
                            backgroundColor: isLocked ? '#ecfdf5' : '#fee2e2',
                            color: isLocked ? '#059669' : '#dc2626',
                            border: `1px solid ${isLocked ? '#a7f3d0' : '#fecaca'}`,
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                          {isLocked ? 'Mở khóa' : 'Khóa'}
                        </button>

                        <button
                          onClick={() => openEditModal(u)}
                          title="Sửa thông tin"
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#2563eb',
                            border: '1px solid #cbd5e1',
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
                          <Edit2 size={12} /> Sửa
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Xóa tài khoản"
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={12} />
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

      {/* Modal: Thêm Người Dùng Mới */}
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
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Thêm Người Dùng Mới</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Phân quyền trực tiếp trong hệ thống TravelEasy</div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Họ Và Tên <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Email Đăng Nhập <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="VD: user@traveleasy.vn"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Số Điện Thoại
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="VD: 0901234567"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mật Khẩu Khởi Tạo <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Vai Trò (Role) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
                      <option value="OPERATOR">Đối Tác Nhà Xe (OPERATOR)</option>
                      <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  disabled={submitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh Sửa Người Dùng */}
      {editingUser && (
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
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Chỉnh Sửa Người Dùng #{editingUser.id}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{editingUser.email}</div>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateUser} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Họ Và Tên <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="VD: 0901234567"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Vai Trò (Role) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
                    <option value="OPERATOR">Đối Tác Nhà Xe (OPERATOR)</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
                  disabled={updating}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: updating ? 'not-allowed' : 'pointer',
                    opacity: updating ? 0.7 : 1,
                  }}
                >
                  {updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
