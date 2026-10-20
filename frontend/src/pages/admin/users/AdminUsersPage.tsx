import React, { useState } from 'react';
import { Eye, Lock, Unlock, Search, Filter } from 'lucide-react';

interface UserItem {
  id: string;
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

  const [users, setUsers] = useState<UserItem[]>([
    {
      id: 'u1',
      phone: '0901234567',
      email: 'admin@traveleasy.vn',
      role: 'ADMIN',
      roleLabel: 'Quan tri vien',
      status: 'ACTIVE',
      createdAt: '16:00 05/01/2025',
    },
    {
      id: 'u2',
      phone: '0912345678',
      email: 'partner@traveleasy.vn',
      role: 'OPERATOR',
      roleLabel: 'Nha xe',
      status: 'ACTIVE',
      createdAt: '16:00 10/02/2025',
    },
    {
      id: 'u3',
      phone: '0923456789',
      email: 'boss@kumho.vn',
      role: 'OPERATOR',
      roleLabel: 'Nha xe',
      status: 'ACTIVE',
      createdAt: '16:00 01/03/2025',
    },
    {
      id: 'u4',
      phone: '0934567890',
      email: 'nguyen.a@example.com',
      role: 'CUSTOMER',
      roleLabel: 'Khach hang',
      status: 'ACTIVE',
      createdAt: '17:30 15/06/2026',
    },
    {
      id: 'u5',
      phone: '0945678901',
      email: 'tran.b@example.com',
      role: 'CUSTOMER',
      roleLabel: 'Khach hang',
      status: 'ACTIVE',
      createdAt: '16:00 01/07/2026',
    },
    {
      id: 'u6',
      phone: '0956789012',
      email: 'locked@example.com',
      role: 'CUSTOMER',
      roleLabel: 'Khach hang',
      status: 'LOCKED',
      createdAt: '16:00 01/05/2026',
    },
    {
      id: 'u7',
      phone: '0967890123',
      email: 'staff@traveleasy.vn',
      role: 'OPERATOR',
      roleLabel: 'Nha xe',
      status: 'ACTIVE',
      createdAt: '16:00 01/04/2025',
    },
  ]);

  const toggleUserLock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : u
      )
    );
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          TravelEasy Admin <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> <span style={{ color: '#0f172a' }}>Nguoi dung</span>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Quan ly nguoi dung
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          {users.length} nguoi dung
        </div>
      </div>

      {/* Filter Row: 2 Dropdowns side-by-side stretching across 50/50 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <option value="ALL">Tat ca vai tro</option>
          <option value="ADMIN">Quan tri vien</option>
          <option value="OPERATOR">Nha xe</option>
          <option value="CUSTOMER">Khach hang</option>
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
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <option value="ALL">Tat ca trang thai</option>
          <option value="ACTIVE">Hoat dong</option>
          <option value="LOCKED">Bi khoa</option>
        </select>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>SO DT</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>EMAIL</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>VAI TRO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>TRANG THAI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGAY TAO</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>HANH DONG</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const roleStyles = {
                ADMIN: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
                OPERATOR: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
                CUSTOMER: { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
              }[u.role];

              const statusStyles = u.status === 'ACTIVE'
                ? { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Hoat dong' }
                : { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Bi khoa' };

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
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{u.phone}</td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>{u.email}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
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
                        backgroundColor: statusStyles.bg,
                        color: statusStyles.text,
                        border: `1px solid ${statusStyles.border}`,
                      }}
                    >
                      {statusStyles.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{u.createdAt}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        title="Xem chi tiet"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#64748b',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserLock(u.id)}
                        title={u.status === 'ACTIVE' ? 'Khoa tai khoan' : 'Mo khoa'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: u.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                          display: 'flex',
                          borderRadius: '4px'
                        }}
                      >
                        {u.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;

