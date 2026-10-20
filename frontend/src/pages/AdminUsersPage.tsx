import React from 'react';
import { AdminNav } from '../components/AdminNav';
import { Users, PlusCircle, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const users = [
    {
      id: 1,
      fullName: 'Phạm Công Thành',
      email: 'Phamcongt56@gmail.com',
      phone: '0901234567',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastLogin: '2026-10-20 10:15',
      note: 'Nhóm trưởng / System Architect'
    },
    {
      id: 2,
      fullName: 'Nguyễn Văn Tài (Điều Hành)',
      email: 'dieuhanh@futa.vn',
      phone: '0912345678',
      role: 'OPERATOR',
      status: 'ACTIVE',
      lastLogin: '2026-10-20 08:30',
      note: 'Nhân viên điều phối xe Phương Trang'
    },
    {
      id: 3,
      fullName: 'Trần Văn Lái (Tài Xế)',
      email: 'taixe.tran@thanhbuoi.vn',
      phone: '0923456789',
      role: 'DRIVER',
      status: 'ACTIVE',
      lastLogin: '2026-10-19 21:00',
      note: 'Tài xế tuyến TP.HCM - Đà Lạt'
    },
    {
      id: 4,
      fullName: 'Lê Thị Hằng (Khách Hàng)',
      email: 'hang.le@gmail.com',
      phone: '0934567890',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      lastLogin: '2026-10-20 09:45',
      note: 'Hành khách VIP (3 chuyến thành công)'
    },
    {
      id: 5,
      fullName: 'Hoàng Minh Tuấn (Khách Hàng)',
      email: 'tuan.hoang@gmail.com',
      phone: '0945678901',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      lastLogin: '2026-10-18 14:20',
      note: 'Hành khách vãng lai'
    }
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#fee2e2', text: '#b91c1c', label: 'Quản Trị Viên' };
      case 'OPERATOR':
        return { bg: '#eff6ff', text: '#1d4ed8', label: 'Điều Hành Xe' };
      case 'DRIVER':
        return { bg: '#fef3c7', text: '#b45309', label: 'Tài Xế' };
      default:
        return { bg: '#f1f5f9', text: '#475569', label: 'Khách Hàng' };
    }
  };

  return (
    <div>
      <AdminNav />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9333ea', backgroundColor: '#faf5ff', padding: '4px 8px', borderRadius: '4px' }}>
              UC-3.1 & SPRING SECURITY RBAC
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
              Quản Trị Người Dùng & Phân Quyền (Identity & Access Management)
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Quản lý danh sách tài khoản, vai trò bảo mật RBAC 4 cấp độ và nhật ký truy cập hệ thống
            </p>
          </div>
          <button style={{ backgroundColor: '#9333ea', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <PlusCircle size={18} /> Thêm Người Dùng Mới
          </button>
        </div>

        {/* Danh Sách Người Dùng */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>Danh Sách Người Dùng Trong Hệ Thống</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{users.length} Tài khoản</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Họ Tên & Email</th>
                <th style={{ padding: '14px 20px' }}>Số Điện Thoại</th>
                <th style={{ padding: '14px 20px' }}>Vai Trò (Role)</th>
                <th style={{ padding: '14px 20px' }}>Đăng Nhập Cuối</th>
                <th style={{ padding: '14px 20px' }}>Ghi Chú</th>
                <th style={{ padding: '14px 20px' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const badge = getRoleBadge(u.role);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#334155' }}>{u.phone}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.text
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>{u.lastLogin}</td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>{u.note}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;

