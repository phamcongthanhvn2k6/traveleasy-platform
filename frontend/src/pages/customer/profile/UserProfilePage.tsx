import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { AuthUser } from '../../../types';
import { toast } from '../../../context/ToastContext';
import {
  User,
  Users,
  Lock,
  Ticket,
  LogOut,
  Mail,
  Phone,
  Shield,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface FrequentTraveler {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'TRAVELERS' | 'PASSWORD'>('PROFILE');

  // User State
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Frequent Travelers State
  const [travelers, setTravelers] = useState<FrequentTraveler[]>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_frequent_travelers');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: '1',
          name: user?.fullName || 'Nguyễn Văn A',
          phone: user?.phone || '0988 123 456',
          email: user?.email || 'customer@gmail.com',
          relationship: 'Bản thân',
        },
        {
          id: '2',
          name: 'Trần Thị Lan',
          phone: '0977 654 321',
          email: 'lan.tran@gmail.com',
          relationship: 'Gia đình',
        },
      ];
    } catch {
      return [];
    }
  });

  // Add Traveler Form State
  const [newTravelerName, setNewTravelerName] = useState('');
  const [newTravelerPhone, setNewTravelerPhone] = useState('');
  const [newTravelerEmail, setNewTravelerEmail] = useState('');
  const [newTravelerRel, setNewTravelerRel] = useState('Gia đình');
  const [showAddTraveler, setShowAddTraveler] = useState(false);

  // Fetch Real Profile from Supabase on mount
  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        if (res.data?.data) {
          const u = res.data.data;
          setFullName(u.fullName || '');
          setPhone(u.phone || '');
          setEmail(u.email || '');
          setUser(u);
          localStorage.setItem('traveleasy_user', JSON.stringify(u));
        }
      })
      .catch(e => console.warn('Could not fetch user profile:', e));
  }, []);

  // Save travelers to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('traveleasy_frequent_travelers', JSON.stringify(travelers));
    } catch (e) {
      console.warn(e);
    }
  }, [travelers]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        fullName: fullName.trim(),
        phone: phone.trim(),
      });

      const updatedUser: AuthUser = res.data?.data || {
        ...user!,
        fullName: fullName.trim(),
        phone: phone.trim(),
      };
      setUser(updatedUser);
      localStorage.setItem('traveleasy_user', JSON.stringify(updatedUser));
      toast.success('Cập nhật thông tin cá nhân thành công!', 'Thành Công');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật hồ sơ cá nhân', 'Lỗi Cập Nhật');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự!', 'Mật Khẩu Yếu');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp!', 'Không Khớp');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      toast.success('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.', 'Thành Công');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc không hợp lệ';
      toast.error(msg, 'Đổi Mật Khẩu Thất Bại');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTravelerName.trim() || !newTravelerPhone.trim()) {
      toast.warning('Vui lòng điền họ tên và số điện thoại hành khách!', 'Thiếu Thông Tin');
      return;
    }

    const newItem: FrequentTraveler = {
      id: Date.now().toString(),
      name: newTravelerName.trim(),
      phone: newTravelerPhone.trim(),
      email: newTravelerEmail.trim() || undefined,
      relationship: newTravelerRel,
    };

    setTravelers((prev) => [...prev, newItem]);
    setNewTravelerName('');
    setNewTravelerPhone('');
    setNewTravelerEmail('');
    setShowAddTraveler(false);
    toast.success(`Đã thêm hành khách ${newItem.name} vào danh bạ thân quen!`, 'Đã Lưu');
  };

  const handleDeleteTraveler = (id: string, name: string) => {
    setTravelers((prev) => prev.filter((t) => t.id !== id));
    toast.info(`Đã xóa ${name} khỏi danh sách hành khách thân quen.`, 'Đã Xóa');
  };

  const handleLogout = () => {
    localStorage.removeItem('traveleasy_token');
    localStorage.removeItem('traveleasy_user');
    toast.info('Bạn đã đăng xuất khỏi hệ thống thành công.', 'Đăng Xuất');
    navigate('/');
  };

  const getInitials = (name: string) => {
    if (!name) return 'TE';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '30px 20px 80px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
            Trang chủ <span style={{ color: '#94a3b8' }}>/</span> Tài khoản cá nhân
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Hồ Sơ Của Tôi
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Quản lý thông tin tài khoản, danh bạ hành khách thân quen và bảo mật cá nhân
          </p>
        </div>

        {/* Guest Warning */}
        {!localStorage.getItem('traveleasy_token') && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#1e3a8a' }}>
                Bạn chưa đăng nhập tài khoản TravelEasy
              </div>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                Đăng nhập để đồng bộ thông tin cá nhân, lưu trữ danh bạ người thân và tích điểm thành viên.
              </div>
            </div>
            <button
              onClick={() => navigate('/auth?redirect=/profile')}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Đăng Nhập Ngay →
            </button>
          </div>
        )}

        {/* 2-Column Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Profile Card & Sidebar Navigation */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            {/* User Avatar & Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
                }}
              >
                {getInitials(user?.fullName || fullName)}
              </div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {user?.fullName || fullName || 'Khách Hàng TravelEasy'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {user?.email || email}
              </div>

              <span
                style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                Khách Hàng Thành Viên
              </span>
            </div>

            {/* Navigation List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('PROFILE')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'PROFILE' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'PROFILE' ? '#2563eb' : '#475569',
                  fontWeight: activeTab === 'PROFILE' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <User size={16} /> Thông tin cá nhân
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRAVELERS')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'TRAVELERS' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'TRAVELERS' ? '#2563eb' : '#475569',
                  fontWeight: activeTab === 'TRAVELERS' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Users size={16} /> Hành khách thân quen ({travelers.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PASSWORD')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'PASSWORD' ? '#eff6ff' : 'transparent',
                  color: activeTab === 'PASSWORD' ? '#2563eb' : '#475569',
                  fontWeight: activeTab === 'PASSWORD' ? 700 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Lock size={16} /> Đổi mật khẩu
              </button>

              <button
                type="button"
                onClick={() => navigate('/my-tickets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Ticket size={16} /> Vé của tôi
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '16px',
                }}
              >
                <LogOut size={16} /> Đăng xuất tài khoản
              </button>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '26px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            {/* TAB 1: PROFILE */}
            {activeTab === 'PROFILE' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Thông Tin Cá Nhân
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px' }}>
                  Cập nhật thông tin của bạn để thuận tiện nhận thông báo vé xe và đối soát hành trình.
                </p>

                <form onSubmit={handleUpdateProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Họ và tên
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 600,
                            boxSizing: 'border-box',
                          }}
                        />
                        <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Số điện thoại
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 600,
                            boxSizing: 'border-box',
                          }}
                        />
                        <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Địa chỉ Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        disabled
                        value={email}
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                          fontSize: '14px',
                          fontWeight: 500,
                          boxSizing: 'border-box',
                          cursor: 'not-allowed',
                        }}
                      />
                      <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                      Email liên kết với tài khoản không thể chỉnh sửa để đảm bảo an toàn danh tính.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
                    }}
                  >
                    <Save size={16} />
                    {savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: FREQUENT TRAVELERS */}
            {activeTab === 'TRAVELERS' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Hành Khách Thân Quen
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Lưu thông tin người thân hoặc bạn bè để tự động điền khi đặt vé xe
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddTraveler(!showAddTraveler)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: showAddTraveler ? '#f1f5f9' : '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} /> Thêm người mới
                  </button>
                </div>

                {/* Add Traveler Form */}
                {showAddTraveler && (
                  <form
                    onSubmit={handleAddTraveler}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '18px',
                      marginBottom: '20px',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                      Thêm Hành Khách Mới
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Họ và tên..."
                        value={newTravelerName}
                        onChange={(e) => setNewTravelerName(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Số điện thoại..."
                        value={newTravelerPhone}
                        onChange={(e) => setNewTravelerPhone(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      <select
                        value={newTravelerRel}
                        onChange={(e) => setNewTravelerRel(e.target.value)}
                        style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        <option value="Bản thân">Bản thân</option>
                        <option value="Gia đình">Gia đình</option>
                        <option value="Bạn bè">Bạn bè</option>
                        <option value="Đồng nghiệp">Đồng nghiệp</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddTraveler(false)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#2563eb',
                          border: 'none',
                          color: '#ffffff',
                          padding: '7px 16px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Lưu vào danh bạ
                      </button>
                    </div>
                  </form>
                )}

                {/* Travelers List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {travelers.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '13px',
                          }}
                        >
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{t.name}</strong>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                              }}
                            >
                              {t.relationship}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            SĐT: <strong>{t.phone}</strong> {t.email ? `• ${t.email}` : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTraveler(t.id, t.name)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          padding: '6px',
                        }}
                        title="Xóa hành khách"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PASSWORD */}
            {activeTab === 'PASSWORD' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Đổi Mật Khẩu
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '22px' }}>
                  Để bảo mật tài khoản, vui lòng đặt mật khẩu tối thiểu 6 ký tự kết hợp chữ và số.
                </p>

                <form onSubmit={handleChangePassword} style={{ maxWidth: '440px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập mật khẩu hiện tại..."
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Tối thiểu 6 ký tự..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
                    }}
                  >
                    {savingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

