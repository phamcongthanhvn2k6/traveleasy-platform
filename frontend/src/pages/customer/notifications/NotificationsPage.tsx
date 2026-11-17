import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  Bus,
  DollarSign,
  Star,
  Ticket,
  ChevronRight,
  Trash2,
  ExternalLink,
  QrCode,
  Zap,
  Clock,
  Filter,
  Search,
  Check,
  RefreshCw,
  Gift
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { AppNotification, playNotificationChime, sendAppNotification } from '../../../services/notificationService';

export const NotificationsPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'BOOKING' | 'PROMO' | 'SYSTEM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const role = currentUser?.role || 'CUSTOMER';

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/notifications', { params: { role } });
      const data = res?.data?.data || res?.data;
      if (Array.isArray(data)) {
        const mapped: AppNotification[] = data.map((d: any) => ({
          id: String(d.id),
          type: d.type || 'BOOKING',
          role: d.role || role,
          title: d.title,
          message: d.message,
          timestamp: d.timestamp || 'Vừa xong',
          link: d.link || '/',
          isRead: Boolean(d.isRead),
          priority: d.priority || 'NORMAL',
        }));
        setNotifications(mapped);
      }
    } catch {
      // Fallback to local storage if API is offline
      try {
        const saved = localStorage.getItem('traveleasy_customer_notifs');
        if (saved) setNotifications(JSON.parse(saved));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [role]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc', 'Thông Báo');
    try {
      await api.patch('/notifications/read-all', null, { params: { role } });
    } catch {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info('Đã xóa thông báo', 'Thông Báo');
    try {
      await api.delete(`/notifications/${id}`);
    } catch {}
  };

  const handleClickItem = (item: AppNotification) => {
    handleMarkAsRead(item.id);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleTriggerTestLive = async () => {
    try {
      const res: any = await api.post('/notifications/test-live', null, { params: { role } });
      const created = res?.data?.data || res?.data;
      if (created) {
        const newNotif: AppNotification = {
          id: String(created.id || Date.now()),
          type: created.type || 'BOOKING',
          role: created.role || role,
          title: created.title,
          message: created.message,
          timestamp: created.timestamp || 'Vừa xong',
          link: created.link || '/',
          isRead: false,
          priority: created.priority || 'HIGH',
        };
        setNotifications((prev) => [newNotif, ...prev]);
        sendAppNotification(newNotif);
        playNotificationChime();
        toast.success('Đã bắn thông báo thời gian thực thành công!', 'Test Live');
      }
    } catch {
      toast.info('Đang gửi thông báo thử nghiệm...', 'Thông Báo');
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'BOOKING') return n.type === 'BOOKING' || n.type === 'TRIP' || n.type === 'CHECKIN';
    if (filter === 'PROMO') return n.type === 'FINANCE' || n.type === 'REVIEW';
    if (filter === 'SYSTEM') return n.type === 'SYSTEM' || n.type === 'SECURITY' || n.type === 'COMPANY';
    return true;
  }).filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'SECURITY':
        return <ShieldAlert size={20} color="#ef4444" />;
      case 'COMPANY':
        return <Bus size={20} color="#10b981" />;
      case 'FINANCE':
        return <Gift size={20} color="#f59e0b" />;
      case 'REVIEW':
        return <Star size={20} color="#8b5cf6" />;
      case 'BOOKING':
        return <Ticket size={20} color="#2563eb" />;
      case 'CHECKIN':
        return <QrCode size={20} color="#06b6d4" />;
      default:
        return <Bell size={20} color="#6366f1" />;
    }
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '32px 20px 60px 20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            <Bell size={26} color="#2563eb" />
            Trung Tâm Thông Báo Của Bạn
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                }}
              >
                {unreadCount} mới
              </span>
            )}
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
            Theo dõi hành trình, nhắc nhở giờ xe chạy, vé điện tử và mã giảm giá độc quyền dành cho bạn.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchNotifications}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#f8fafc' : '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: unreadCount > 0 ? (isDark ? '#1e3a8a' : '#dbeafe') : (isDark ? '#1e293b' : '#f1f5f9'),
              color: unreadCount > 0 ? (isDark ? '#93c5fd' : '#1d4ed8') : (isDark ? '#64748b' : '#94a3b8'),
              fontSize: '13px',
              fontWeight: 700,
              cursor: unreadCount > 0 ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCheck size={16} />
            Đã đọc tất cả
          </button>

          <button
            type="button"
            onClick={handleTriggerTestLive}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
            }}
          >
            <Zap size={15} />
            Bắn Test Live
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          padding: '12px 16px',
          borderRadius: '12px',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `Tất cả (${notifications.length})` },
            { key: 'UNREAD', label: `Chưa đọc (${unreadCount})` },
            { key: 'BOOKING', label: 'Vé & Chuyến xe' },
            { key: 'PROMO', label: 'Ưu đãi & Voucher' },
            { key: 'SYSTEM', label: 'Hệ thống' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: filter === tab.key ? 'none' : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                backgroundColor: filter === tab.key ? '#2563eb' : 'transparent',
                color: filter === tab.key ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                fontSize: '13px',
                fontWeight: filter === tab.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: isDark ? '#94a3b8' : '#64748b' }} />
          <input
            type="text"
            placeholder="Tìm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: isDark ? '#94a3b8' : '#64748b' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <div>Đang tải dữ liệu thông báo từ máy chủ...</div>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <Bell size={48} style={{ color: isDark ? '#475569' : '#cbd5e1', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: isDark ? '#f8fafc' : '#0f172a' }}>
            Không có thông báo nào
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
            Bạn đã cập nhật tất cả thông tin mới nhất. Hãy quay lại sau!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClickItem(item)}
              style={{
                backgroundColor: item.isRead
                  ? (isDark ? '#111827' : '#ffffff')
                  : (isDark ? 'rgba(30, 58, 138, 0.2)' : '#f0f9ff'),
                border: item.isRead
                  ? `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`
                  : `1.5px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Category Icon */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(item.type)}
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: 800,
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  >
                    {item.title}
                  </h4>

                  {item.priority === 'HIGH' && (
                    <span
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Quan trọng
                    </span>
                  )}

                  {!item.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </div>

                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    color: isDark ? '#cbd5e1' : '#475569',
                  }}
                >
                  {item.message}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: isDark ? '#94a3b8' : '#64748b',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} /> {item.timestamp}
                  </span>

                  <span
                    style={{
                      color: isDark ? '#38bdf8' : '#2563eb',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Xem chi tiết <ChevronRight size={14} />
                  </span>
                </div>
              </div>

              {/* Actions on card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={(e) => handleMarkAsRead(item.id, e)}
                    title="Đánh dấu đã đọc"
                    style={{
                      border: 'none',
                      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                      color: isDark ? '#94a3b8' : '#475569',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Xóa thông báo"
                  style={{
                    border: 'none',
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    color: '#ef4444',
                    padding: '6px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

