import React, { useState, useRef, useEffect } from 'react';
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
  X,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from '../context/ToastContext';

export interface NotificationItem {
  id: string;
  type: 'SECURITY' | 'COMPANY' | 'FINANCE' | 'REVIEW' | 'BOOKING';
  title: string;
  message: string;
  timestamp: string;
  link: string;
  isRead: boolean;
  priority?: 'HIGH' | 'NORMAL';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'SECURITY',
    title: 'Cảnh báo an ninh mạng',
    message: 'Hệ thống kiểm toán tự động ghi nhận 3 thao tác can thiệp CSDL mới.',
    timestamp: '5 phút trước',
    link: '/admin/audit-logs',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'notif-2',
    type: 'COMPANY',
    title: 'Hồ sơ nhà xe chờ duyệt',
    message: 'Nhà xe Việt Thắng vừa đăng ký mở tuyến, đang chờ phê duyệt giấy phép.',
    timestamp: '25 phút trước',
    link: '/admin/bus-companies',
    isRead: false,
    priority: 'NORMAL',
  },
  {
    id: 'notif-3',
    type: 'FINANCE',
    title: 'Yêu cầu đối soát & rút tiền',
    message: 'Phương Trang gửi yêu cầu rút 45.200.000 đ hoa hồng đợt 2.',
    timestamp: '1 giờ trước',
    link: '/admin/settlements',
    isRead: false,
    priority: 'HIGH',
  },
  {
    id: 'notif-4',
    type: 'REVIEW',
    title: 'Báo cáo đánh giá vi phạm',
    message: 'Khách hàng khiếu nại bài đánh giá 1 sao về thái độ đón khách trễ.',
    timestamp: '2 giờ trước',
    link: '/admin/review-reports',
    isRead: false,
    priority: 'NORMAL',
  },
  {
    id: 'notif-5',
    type: 'BOOKING',
    title: 'Vé đặt thanh toán thành công',
    message: 'Đơn BKG-20261029-030 vừa thanh toán thành công qua PayOS VietQR.',
    timestamp: '3 giờ trước',
    link: '/admin/bookings',
    isRead: true,
    priority: 'NORMAL',
  },
];

export const NotificationDropdown: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'SECURITY'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('traveleasy_admin_notifs');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Lưu notifications vào localStorage
  const saveNotifs = (list: NotificationItem[]) => {
    setNotifications(list);
    try {
      localStorage.setItem('traveleasy_admin_notifs', JSON.stringify(list));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifs(updated);
    toast.success('Đã đánh dấu đã đọc toàn bộ thông báo!', 'Trung Tâm Thông Báo');
  };

  const handleClearAll = () => {
    saveNotifs([]);
    toast.info('Đã xóa tất cả thông báo.', 'Trung Tâm Thông Báo');
  };

  const handleClickItem = (item: NotificationItem) => {
    // Đánh dấu đã đọc
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, isRead: true } : n));
    saveNotifs(updated);
    setIsOpen(false);
    navigate(item.link);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'SECURITY') return n.type === 'SECURITY' || n.priority === 'HIGH';
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SECURITY':
        return <ShieldAlert size={16} color="#dc2626" />;
      case 'COMPANY':
        return <Bus size={16} color="#059669" />;
      case 'FINANCE':
        return <DollarSign size={16} color="#d97706" />;
      case 'REVIEW':
        return <Star size={16} color="#9333ea" />;
      case 'BOOKING':
        return <Ticket size={16} color="#2563eb" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SECURITY':
        return isDark ? '#450a0a' : '#fee2e2';
      case 'COMPANY':
        return isDark ? '#064e3b' : '#dcfce7';
      case 'FINANCE':
        return isDark ? '#78350f' : '#fef3c7';
      case 'REVIEW':
        return isDark ? '#581c87' : '#f3e8ff';
      case 'BOOKING':
        return isDark ? '#1e3a8a' : '#dbeafe';
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Nút Chuông Thông Báo */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trung tâm thông báo quản trị"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: isOpen
            ? isDark
              ? '#1e293b'
              : '#e2e8f0'
            : isDark
            ? 'rgba(30, 41, 59, 0.7)'
            : '#f1f5f9',
          border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#e2e8f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isOpen
            ? isDark
              ? '#1e293b'
              : '#e2e8f0'
            : isDark
            ? 'rgba(30, 41, 59, 0.7)'
            : '#f1f5f9';
        }}
      >
        <Bell size={18} color={isDark ? '#f8fafc' : '#334155'} />

        {/* Chấm đỏ / Số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '9px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '10.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${isDark ? '#0b132b' : '#ffffff'}`,
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Thông Báo */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            maxWidth: '92vw',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '14px',
            boxShadow: isDark
              ? '0 20px 30px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.5)'
              : '0 20px 30px -5px rgba(15, 23, 42, 0.15), 0 10px 10px -5px rgba(15, 23, 42, 0.08)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.15s ease-out',
          }}
        >
          {/* Header Popover */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                Thông Báo Quản Trị
              </div>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: isDark ? '#991b1b' : '#fee2e2',
                    color: isDark ? '#fca5a5' : '#dc2626',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}
                >
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  title="Đánh dấu đã đọc tất cả"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: isDark ? '#38bdf8' : '#0284c7',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '4px',
                  }}
                >
                  <CheckCheck size={14} /> Đọc hết
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Xóa tất cả thông báo"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#64748b' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '6px 12px',
              gap: '6px',
              borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
              backgroundColor: isDark ? '#111827' : '#ffffff',
            }}
          >
            {(['ALL', 'UNREAD', 'SECURITY'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor:
                    filter === t
                      ? isDark
                        ? '#1e293b'
                        : '#eff6ff'
                      : 'transparent',
                  color:
                    filter === t
                      ? isDark
                        ? '#38bdf8'
                        : '#2563eb'
                      : isDark
                      ? '#94a3b8'
                      : '#64748b',
                  border: filter === t ? `1px solid ${isDark ? '#334155' : '#bfdbfe'}` : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {t === 'ALL' ? 'Tất cả' : t === 'UNREAD' ? 'Chưa đọc' : '🚨 Khẩn cấp'}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {filteredNotifs.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                <Bell size={28} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Không có thông báo nào</div>
                <div style={{ fontSize: '11.5px', marginTop: '2px' }}>Tất cả các nghiệp vụ đã được xử lý xong</div>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClickItem(item)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    borderBottom: `1px solid ${isDark ? '#1e293b' : '#f8fafc'}`,
                    backgroundColor: !item.isRead
                      ? isDark
                        ? 'rgba(30, 41, 59, 0.4)'
                        : '#f0fdf4'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = !item.isRead
                      ? isDark
                        ? 'rgba(30, 41, 59, 0.4)'
                        : '#f0fdf4'
                      : 'transparent';
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: getIconBg(item.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: item.isRead ? 600 : 800,
                          color: isDark ? '#f8fafc' : '#0f172a',
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        {item.timestamp}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: isDark ? '#94a3b8' : '#475569',
                        marginTop: '3px',
                        lineHeight: '1.4',
                      }}
                    >
                      {item.message}
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!item.isRead && (
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                        flexShrink: 0,
                        marginTop: '6px',
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Popover */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/audit-logs');
              }}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: isDark ? '#38bdf8' : '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Xem toàn bộ nhật ký kiểm toán <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

