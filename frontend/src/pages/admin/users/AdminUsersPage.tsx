import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Search,
  Plus,
  RefreshCw,
  X,
  User,
  Edit2,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Check,
  Send,
  AlertTriangle,
  FileText,
  Ban,
  Clock
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

interface UserItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
  roleLabel: string;
  status: 'ACTIVE' | 'LOCKED' | 'DELETED';
  createdAt: string;
}

interface AdminProposalItem {
  id: number;
  proposedEmail: string;
  proposedFullName: string;
  proposedPhone?: string;
  departmentOrRoleNote?: string;
  reason: string;
  requestedByEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusLabel: string;
  reviewedByEmail?: string;
  reviewedAt?: string;
  rejectReason?: string;
  createdUserId?: number;
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'PROPOSALS'>('USERS');

  // Users State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Admin Proposals State
  const [proposals, setProposals] = useState<AdminProposalItem[]>([]);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalStatusFilter, setProposalStatusFilter] = useState('ALL');

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingProposal, setRejectingProposal] = useState<AdminProposalItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Create User / Proposal Modal State
  const [showModal, setShowModal] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'OPERATOR' | 'CUSTOMER'>('CUSTOMER');
  const [formDepartment, setFormDepartment] = useState('');
  const [formReason, setFormReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'OPERATOR' | 'CUSTOMER'>('CUSTOMER');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Xác định tài khoản Admin hiện tại đăng nhập
  const getCurrentUserEmail = (): string => {
    try {
      const raw = localStorage.getItem('traveleasy_user');
      if (raw) {
        const u = JSON.parse(raw);
        return u.email || '';
      }
    } catch (e) {}
    return '';
  };

  const currentEmail = getCurrentUserEmail();
  const isSystemAdmin = currentEmail.toLowerCase() === 'admin@traveleasy.vn';

  // =========================================================================
  // TẢI DỮ LIỆU
  // =========================================================================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setUsers(
          res.data.data.map((u: any) => ({
            id: String(u.id),
            fullName: u.fullName || 'Chưa đặt tên',
            phone: u.phone || 'Chưa cập nhật',
            email: u.email,
            role: u.role,
            roleLabel: u.roleLabel || u.role,
            status: u.status || 'ACTIVE',
            createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '01/01/2026',
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load users from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    setProposalLoading(true);
    try {
      const res = await api.get('/admin/admin-requests');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setProposals(
          res.data.data.map((p: any) => ({
            id: p.id,
            proposedEmail: p.proposedEmail,
            proposedFullName: p.proposedFullName,
            proposedPhone: p.proposedPhone,
            departmentOrRoleNote: p.departmentOrRoleNote,
            reason: p.reason,
            requestedByEmail: p.requestedByEmail,
            status: p.status,
            statusLabel: p.statusLabel || (p.status === 'APPROVED' ? 'Đã duyệt' : p.status === 'REJECTED' ? 'Bị từ chối' : 'Chờ duyệt'),
            reviewedByEmail: p.reviewedByEmail,
            reviewedAt: p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString('vi-VN') : undefined,
            rejectReason: p.rejectReason,
            createdUserId: p.createdUserId,
            createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '01/01/2026',
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load proposals:', err);
    } finally {
      setProposalLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProposals();
  }, []);

  // =========================================================================
  // XỬ LÝ PHIẾU ĐỀ XUẤT ADMIN
  // =========================================================================
  const handleApproveProposal = async (p: AdminProposalItem) => {
    if (!window.confirm(`XÁC NHẬN PHÊ DUYỆT CẤP QUYỀN ADMIN:

Bạn có chắc chắn muốn phê duyệt và kích hoạt tài khoản Quản trị viên cho "${p.proposedFullName}" (${p.proposedEmail})?`)) {
      return;
    }

    try {
      await api.post(`/admin/admin-requests/${p.id}/approve`);
      toast.success(`Đã phê duyệt và kích hoạt tài khoản Admin cho "${p.proposedEmail}"!`, 'Phê Duyệt Thành Công');
      fetchProposals();
      fetchUsers();
    } catch (err: any) {
      console.error('Approve proposal error:', err);
      toast.error(err.response?.data?.message || 'Phê duyệt thất bại!', 'Lỗi');
    }
  };

  const openRejectModal = (p: AdminProposalItem) => {
    setRejectingProposal(p);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProposal) return;
    if (!rejectReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối phiếu đề xuất!', 'Thiếu Thông Tin');
      return;
    }

    setRejectSubmitting(true);
    try {
      await api.post(`/admin/admin-requests/${rejectingProposal.id}/reject`, { reason: rejectReason.trim() });
      toast.info(`Đã từ chối phiếu đề xuất của "${rejectingProposal.proposedEmail}"`, 'Đã Từ Chối');
      setShowRejectModal(false);
      setRejectingProposal(null);
      fetchProposals();
    } catch (err: any) {
      console.error('Reject proposal error:', err);
      toast.error(err.response?.data?.message || 'Từ chối phiếu thất bại!', 'Lỗi');
    } finally {
      setRejectSubmitting(false);
    }
  };

  // =========================================================================
  // TẠO NGƯỜI DÙNG HOẶC GỬI PHIẾU ĐỀ XUẤT
  // =========================================================================
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formEmail.trim()) {
      toast.warning('Vui lòng điền họ tên và email hợp lệ!', 'Thiếu Thông Tin');
      return;
    }

    // Nếu chọn tạo ADMIN nhưng người thao tác KHÔNG PHẢI là Admin Hệ Thống
    if (formRole === 'ADMIN' && !isSystemAdmin) {
      if (!formReason.trim()) {
        toast.warning('Vui lòng nhập lý do đề xuất cấp quyền Admin!', 'Thiếu Lý Do Đề Xuất');
        return;
      }

      setSubmitting(true);
      try {
        await api.post('/admin/admin-requests', {
          proposedEmail: formEmail.trim(),
          proposedFullName: formFullName.trim(),
          proposedPhone: formPhone.trim(),
          departmentOrRoleNote: formDepartment.trim(),
          reason: formReason.trim(),
        });
        toast.success(
          `Đã gửi phiếu đề xuất cấp quyền Admin cho "${formEmail.trim()}" tới Quản trị viên hệ thống phê duyệt!`,
          'Đã Gửi Đề Xuất'
        );
        setShowModal(false);
        resetForm();
        fetchProposals();
        setActiveTab('PROPOSALS');
      } catch (err: any) {
        console.error('Submit proposal error:', err);
        toast.error(err.response?.data?.message || 'Gửi đề xuất thất bại!', 'Lỗi');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Trường hợp tạo trực tiếp (Khách hàng, Đối tác, hoặc Admin Hệ Thống tạo Admin)
    if (!formPassword.trim()) {
      toast.warning('Vui lòng nhập mật khẩu khởi tạo!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: formPassword.trim(),
        role: formRole,
      };

      const res = await api.post('/admin/users', payload);
      const created = res.data?.data;
      if (created) {
        setUsers((prev) => [
          {
            id: String(created.id),
            fullName: created.fullName,
            phone: created.phone || formPhone.trim(),
            email: created.email,
            role: created.role,
            roleLabel: created.roleLabel,
            status: created.status || 'ACTIVE',
            createdAt: 'Hôm nay',
          },
          ...prev,
        ]);
      }
      toast.success(`Đã tạo tài khoản "${payload.email}" thành công!`, 'Thành Công');
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Create user error:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo tài khoản này', 'Thất Bại');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('CUSTOMER');
    setFormDepartment('');
    setFormReason('');
  };

  // =========================================================================
  // SỬA / XÓA MỀM / KHÔI PHỤC NGƯỜI DÙNG
  // =========================================================================
  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditPhone(u.phone === 'Chưa cập nhật' ? '' : u.phone);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPassword('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);

    try {
      const payload: any = {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        role: editRole,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      await api.put(`/admin/users/${editingUser.id}`, payload);
      toast.success(`Đã cập nhật thông tin tài khoản "${payload.email}"!`, 'Thành Công');
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Update user error:', err);
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!', 'Lỗi');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (u.role === 'ADMIN' && u.email === 'admin@traveleasy.vn') {
      toast.error('Không thể xóa tài khoản Quản trị viên Tối cao!', 'Bảo Vệ Hệ Thống');
      return;
    }

    if (!window.confirm(`XÁC NHẬN XÓA MỀM (LƯU TRỮ AN TOÀN):

Bạn có chắc chắn muốn chuyển tài khoản "${u.email}" (${u.fullName}) sang trạng thái ĐÃ XÓA MỀM?

• Tài khoản sẽ bị vô hiệu hóa đăng nhập.
• Toàn bộ lịch sử đặt vé, giao dịch và audit logs được BẢO TOÀN 100% trong CSDL.
• Bạn có thể bấm [Khôi phục] bất cứ lúc nào để mở lại tài khoản.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${u.id}`);
      setUsers((prev) => prev.map((item) => item.id === u.id ? { ...item, status: 'DELETED' } : item));
      toast.success(`Đã chuyển tài khoản "${u.email}" sang trạng thái XÓA MỀM (Lưu trữ an toàn)!`, 'Xóa Mềm Thành Công');
    } catch (err: any) {
      console.error('Delete user error:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa người dùng này', 'Thất Bại');
    }
  };

  const handleRestoreUser = async (u: UserItem) => {
    try {
      await api.patch(`/admin/users/${u.id}/restore`);
      setUsers((prev) => prev.map((item) => item.id === u.id ? { ...item, status: 'ACTIVE' } : item));
      toast.success(`Đã khôi phục tài khoản "${u.email}" hoạt động trở lại!`, 'Khôi Phục Thành Công');
    } catch (err: any) {
      console.error('Restore user error:', err);
      toast.error(err.response?.data?.message || 'Khôi phục tài khoản thất bại!', 'Lỗi');
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

  const pendingProposalCount = proposals.filter((p) => p.status === 'PENDING').length;

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || u.phone.includes(q) || u.fullName.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredProposals = proposals.filter((p) => {
    if (proposalStatusFilter !== 'ALL' && p.status !== proposalStatusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Quản trị bảo mật{' '}
            <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span>{' '}
            <span style={{ color: '#0f172a' }}>Người dùng & Phân quyền RBAC</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={28} style={{ color: '#2563eb' }} />
            Quản Lý Người Dùng & Phân Quyền Hệ Thống
          </h1>
          <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            {isSystemAdmin ? (
              <span style={{ color: '#16a34a', fontWeight: 700 }}>
                👑 Bạn đang đăng nhập với tư cách: <strong>Admin Hệ Thống (Root Admin)</strong> - Toàn quyền quản trị & duyệt cấp quyền
              </span>
            ) : (
              <span style={{ color: '#2563eb', fontWeight: 600 }}>
                🛡️ Bạn đang đăng nhập với tư cách: <strong>Quản trị viên Vận hành ({currentEmail})</strong> - Quyền thêm đối tác & đề xuất duyệt Admin
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              fetchUsers();
              fetchProposals();
            }}
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
            <RefreshCw size={14} className={loading || proposalLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
            }}
          >
            <Plus size={16} />
            Thêm Người Dùng Mới
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: activeTab === 'USERS' ? 800 : 600,
            color: activeTab === 'USERS' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'USERS' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: activeTab === 'USERS' ? '#eff6ff' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <User size={16} />
          Danh Sách Tài Khoản ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('PROPOSALS')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: activeTab === 'PROPOSALS' ? 800 : 600,
            color: activeTab === 'PROPOSALS' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'PROPOSALS' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: activeTab === 'PROPOSALS' ? '#eff6ff' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <Clock size={16} />
          Phiếu Đề Xuất Cấp Quyền Admin
          {pendingProposalCount > 0 && (
            <span
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {pendingProposalCount} chờ duyệt
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <>
          {/* Filter Row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                flex: 1,
                minWidth: '260px',
                gap: '8px',
              }}
            >
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Tìm theo họ tên, email hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0f172a',
                  width: '100%',
                }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '170px',
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
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '170px',
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="LOCKED">Bị khóa (LOCKED)</option>
              <option value="DELETED">Đã xóa mềm (DELETED)</option>
            </select>
          </div>

          {/* Table Users */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                      HỌ TÊN & EMAIL
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                      SỐ ĐIỆN THOẠI
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                      VAI TRÒ (ROLE)
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                      TRẠNG THÁI
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>
                      NGÀY TẠO
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        Đang tải danh sách người dùng...
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
                      const isDeleted = u.status === 'DELETED';
                      const isLocked = u.status === 'LOCKED';
                      const isRootAdmin = u.role === 'ADMIN' && u.email === 'admin@traveleasy.vn';
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{u.fullName}</span>
                              {isRootAdmin && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                    fontWeight: 800,
                                  }}
                                >
                                  👑 ROOT ADMIN
                                </span>
                              )}
                            </div>
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
                                backgroundColor: isDeleted ? '#f1f5f9' : isLocked ? '#fee2e2' : '#ecfdf5',
                                color: isDeleted ? '#64748b' : isLocked ? '#dc2626' : '#059669',
                                border: `1px solid ${isDeleted ? '#cbd5e1' : isLocked ? '#fecaca' : '#a7f3d0'}`,
                              }}
                            >
                              {isDeleted ? 'Đã xóa mềm' : isLocked ? 'Bị khóa' : 'Hoạt động'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b' }}>{u.createdAt}</td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {isDeleted ? (
                                <button
                                  onClick={() => handleRestoreUser(u)}
                                  title="Khôi phục tài khoản hoạt động"
                                  style={{
                                    backgroundColor: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #a7f3d0',
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
                                  <RotateCcw size={12} /> Khôi phục
                                </button>
                              ) : (
                                <>
                                  {!isRootAdmin && (
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
                                  )}

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

                                  {!isRootAdmin && (
                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      title="Xóa mềm tài khoản (Bảo toàn lịch sử)"
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
                                  )}
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
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PHIẾU ĐỀ XUẤT CẤP QUYỀN ADMIN (APPROVAL CENTER) */}
      {/* ========================================================================= */}
      {activeTab === 'PROPOSALS' && (
        <>
          {/* Proposal Filter Row */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'ALL', label: 'Tất cả phiếu' },
                { key: 'PENDING', label: `⏳ Chờ duyệt (${pendingProposalCount})`, highlight: pendingProposalCount > 0 },
                { key: 'APPROVED', label: '✅ Đã phê duyệt' },
                { key: 'REJECTED', label: '❌ Bị từ chối' },
              ].map((tab: any) => {
                const isActive = proposalStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setProposalStatusFilter(tab.key)}
                    style={{
                      backgroundColor: isActive ? '#2563eb' : tab.highlight ? '#fef3c7' : '#ffffff',
                      color: isActive ? '#ffffff' : tab.highlight ? '#b45309' : '#64748b',
                      border: isActive ? '1px solid #2563eb' : tab.highlight ? '1px solid #fde68a' : '1px solid #e2e8f0',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: tab.highlight || isActive ? 700 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Quy trình phê duyệt thẩm quyền: <strong>Chỉ Admin Hệ Thống (admin@traveleasy.vn)</strong> mới có nút Phê duyệt / Từ chối.
            </div>
          </div>

          {/* Proposals Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>
                      ỨNG VIÊN ĐƯỢC ĐỀ XUẤT
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>
                      PHÒNG BAN / VỊ TRÍ
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>
                      LÝ DO CẦN CẤP QUYỀN
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>
                      ADMIN ĐỀ XUẤT & NGÀY GỬI
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>
                      TRẠNG THÁI
                    </th>
                    <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 700, fontSize: '11px', textAlign: 'right' }}>
                      THẨM QUYỀN PHÊ DUYỆT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proposalLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        Đang tải danh sách phiếu đề xuất cấp quyền Admin...
                      </td>
                    </tr>
                  ) : filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        Không có phiếu đề xuất nào trong danh mục này.
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((p) => {
                      const isPending = p.status === 'PENDING';
                      const isApproved = p.status === 'APPROVED';
                      const isRejected = p.status === 'REJECTED';

                      const statusBadgeStyles = {
                        PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
                        APPROVED: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
                        REJECTED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                      }[p.status] || { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.1s ease',
                          }}
                        >
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.proposedFullName}</div>
                            <div style={{ fontSize: '12px', color: '#2563eb' }}>{p.proposedEmail}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>SĐT: {p.proposedPhone || '---'}</div>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                            {p.departmentOrRoleNote || 'Quản trị vận hành'}
                          </td>
                          <td style={{ padding: '14px 18px', maxWidth: '280px' }}>
                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                              {p.reason}
                            </div>
                            {isRejected && p.rejectReason && (
                              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontStyle: 'italic' }}>
                                Lý do từ chối: {p.rejectReason}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{p.requestedByEmail}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gửi ngày: {p.createdAt}</div>
                            {p.reviewedByEmail && (
                              <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                                Duyệt bởi: {p.reviewedByEmail} ({p.reviewedAt})
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: statusBadgeStyles.bg,
                                color: statusBadgeStyles.text,
                                border: `1px solid ${statusBadgeStyles.border}`,
                              }}
                            >
                              {p.statusLabel}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {isPending ? (
                                isSystemAdmin ? (
                                  <>
                                    <button
                                      onClick={() => handleApproveProposal(p)}
                                      title="Phê duyệt cấp quyền Admin"
                                      style={{
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        border: '1px solid #a7f3d0',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      <Check size={13} /> Phê Duyệt
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(p)}
                                      title="Từ chối đề xuất"
                                      style={{
                                        backgroundColor: '#fef2f2',
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
                                      <Ban size={13} /> Từ Chối
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#d97706', fontStyle: 'italic' }}>
                                    ⏳ Đang chờ Admin Hệ Thống duyệt
                                  </span>
                                )
                              ) : isApproved ? (
                                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                                  ✓ Đã kích hoạt Admin
                                </span>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                                  ✕ Đã từ chối
                                </span>
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
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM NGƯỜI DÙNG / LẬP PHIẾU ĐỀ XUẤT ADMIN */}
      {/* ========================================================================= */}
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
              maxWidth: 'min(540px, 94vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: formRole === 'ADMIN' && !isSystemAdmin ? '#fffbeb' : '#eff6ff', color: formRole === 'ADMIN' && !isSystemAdmin ? '#d97706' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {formRole === 'ADMIN' && !isSystemAdmin ? <Send size={18} /> : <User size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {formRole === 'ADMIN' && !isSystemAdmin ? 'Lập Phiếu Đề Xuất Cấp Quyền Admin' : 'Thêm Người Dùng Mới'}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {formRole === 'ADMIN' && !isSystemAdmin
                      ? 'Gửi phiếu thẩm định lên Admin Hệ Thống phê duyệt'
                      : 'Phân quyền trực tiếp trong hệ thống TravelEasy'}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Chọn Vai Trò */}
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
                      fontWeight: 600,
                    }}
                  >
                    <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
                    <option value="OPERATOR">Đối Tác Nhà Xe (OPERATOR)</option>
                    <option value="ADMIN">
                      {isSystemAdmin ? '👑 Quản Trị Viên (ADMIN) - Tạo trực tiếp' : '🛡️ Quản Trị Viên (ADMIN) - Cần Admin Hệ Thống duyệt'}
                    </option>
                  </select>
                </div>

                {/* Cảnh báo an ninh nếu Sub-Admin chọn role ADMIN */}
                {formRole === 'ADMIN' && !isSystemAdmin && (
                  <div
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '12.5px',
                      color: '#b45309',
                      lineHeight: '1.45',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
                    <div>
                      <strong>Quy chuẩn An ninh RBAC:</strong> Bạn đang đăng nhập với tư cách Quản trị viên vận hành. Theo hiến pháp hệ thống, chỉ <strong>Admin Hệ Thống (admin@traveleasy.vn)</strong> mới có thể tạo trực tiếp tài khoản Admin. Phiếu đề xuất này sẽ được chuyển vào mục chờ duyệt để Admin Hệ Thống thẩm định.
                    </div>
                  </div>
                )}

                {/* Họ Tên */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Họ Và Tên Ứng Viên <span style={{ color: '#ef4444' }}>*</span>
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

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Email <span style={{ color: '#ef4444' }}>*</span>
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

                {/* Nếu không phải đề xuất Admin -> Nhập mật khẩu khởi tạo */}
                {!(formRole === 'ADMIN' && !isSystemAdmin) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mật Khẩu Khởi Tạo <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu an toàn..."
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
                )}

                {/* Nếu là Đề xuất Admin -> Nhập Phòng ban & Lý do */}
                {formRole === 'ADMIN' && !isSystemAdmin && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Phòng Ban / Vị Trí Phụ Trách
                      </label>
                      <input
                        type="text"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        placeholder="VD: Vận hành kiểm soát vé, Kế toán đối soát, Hỗ trợ khách hàng..."
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
                        Lý Do Đề Xuất Cấp Quyền Admin <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        required
                        rows={3}
                        placeholder="Nêu rõ lý do nghiệp vụ cần bổ sung thêm nhân sự vào ban quản trị hệ thống..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: formRole === 'ADMIN' && !isSystemAdmin ? '#d97706' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {submitting ? (
                    'Đang xử lý...'
                  ) : formRole === 'ADMIN' && !isSystemAdmin ? (
                    <>
                      <Send size={14} /> Gửi Phiếu Đề Xuất Lên Admin Hệ Thống
                    </>
                  ) : (
                    'Tạo Người Dùng'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TỪ CHỐI PHIẾU ĐỀ XUẤT ADMIN */}
      {/* ========================================================================= */}
      {showRejectModal && rejectingProposal && (
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
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ban size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Từ Chối Phiếu Đề Xuất Cấp Quyền Admin
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Ứng viên: <strong>{rejectingProposal.proposedFullName}</strong> ({rejectingProposal.proposedEmail})
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Lý Do Từ Chối <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Nhập lý do không chấp thuận cấp quyền Admin để lưu vết kiểm toán..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: rejectSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {rejectSubmitting ? 'Đang xử lý...' : 'Xác Nhận Từ Chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SỬA THÔNG TIN NGƯỜI DÙNG */}
      {/* ========================================================================= */}
      {showEditModal && editingUser && (
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
              maxWidth: 'min(500px, 94vw)',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Cập Nhật Người Dùng</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Tài khoản #{editingUser.id}</div>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Họ Và Tên</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Số Điện Thoại</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Vai Trò</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      disabled={editingUser.email === 'admin@traveleasy.vn'}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="CUSTOMER">Khách Hàng</option>
                      <option value="OPERATOR">Đối Tác Nhà Xe</option>
                      {(isSystemAdmin || editingUser.role === 'ADMIN') && (
                        <option value="ADMIN">Quản Trị Viên</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Đổi Mật Khẩu Mới</label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Để trống nếu giữ nguyên..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: updating ? 'not-allowed' : 'pointer',
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
