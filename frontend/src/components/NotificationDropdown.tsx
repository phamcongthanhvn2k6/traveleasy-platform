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
  QrCode,
  Zap,
  Volume2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from '../context/ToastContext';
import {
  AppNotification,
  OPERATOR_DEFAULT_NOTIFICATIONS,
  ADMIN_DEFAULT_NOTIFICATIONS,
  sendAppNotification,
  playNotificationChime,
} from '../services/notificationService';

export const NotificationDropdown: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'HIGH'>('ALL');
  const [isBumping, setIsBumping] = useState(false);

  // Determine current user role
  const currentUser = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('traveleasy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const isOperator = currentUser?.role === 'OPERATOR';
  const isAdmin = currentUser?.role === 'ADMIN';

  const storageKey = isOperator
    ? 'traveleasy_operator_notifs'
    : isAdmin
    ? 'traveleasy_admin_notifs'
    : 'traveleasy_customer_notifs';

  const defaultNotifs = isOperator
    ? OPERATOR_DEFAULT_NOTIFICATIONS
    : ADMIN_DEFAULT_NOTIFICATIONS;

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultNotifs;
    } catch {
      return defaultNotifs;
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  const saveNotifs = (list: AppNotification[]) => {
    setNotifications(list);
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {}
  };

  // Listen to real-time notification events
  useEffect(() => {
    const handleNewNotification = (e: any) => {
      const newNotif = e.detail as AppNotification;
      if (!newNotif) return;

      // Check role relevance
      if (
        newNotif.role !== 'ALL' &&
        ((isOperator && newNotif.role !== 'OPERATOR') ||
          (isAdmin && newNotif.role !== 'ADMIN'))
      ) {
        return;
      }

      setNotifications((prev) => {
        const updated = [newNotif, ...prev.filter((n) => n.id !== newNotif.id)];
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Animate badge
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 1000);

      toast.info(newNotif.title, 'Thông Báo Mới');
    };

    window.addEventListener('traveleasy_realtime_notification', handleNewNotification);
    return () => {
      window.removeEventListener('traveleasy_realtime_notification', handleNewNotification);
    };
  }, [isOperator, isAdmin, storageKey]);

  // Close dropdown when clicking outside
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifs(updated);
    toast.success('Đã đánh dấu tất cả là đã đọc', 'Thông Báo');
  };

  const handleClearAll = () => {
    saveNotifs([]);
    toast.info('Đã xóa tất cả thông báo', 'Thông Báo');
  };

  const handleClickItem = (item: AppNotification) => {
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, isRead: true } : n));
    saveNotifs(updated);
    setIsOpen(false);
    navigate(item.link);
  };

  // Demo simulation trigger
  const handleTriggerLiveDemo = () => {
    const demoItems = isOperator
      ? [
          {
            type: 'BOOKING' as const,
            role: 'OPERATOR' as const,
            title: '🎟️ Đơn đặt vé mới: Khách hàng vừa đặt ghế B02',
            message: 'Khách hàng Lê Hoàng Cường vừa đặt thành công 1 vé tuyến Hà Nội - Sa Pa. Giá vé: 450.000 đ.',
            link: '/company/bookings',
            priority: 'HIGH' as const,
          },
          {
            type: 'CHECKIN' as const,
            role: 'OPERATOR' as const,
            title: '⚡ Soát vé thành công: Vé TK-20261101-CA17-01',
            message: 'Hành khách vừa hoàn tất quét vé điện tử tại cửa xe, ghế A04 đã xác nhận lên xe.',
            link: '/scanner',
            priority: 'NORMAL' as const,
          },
          {
            type: 'FINANCE' as const,
            role: 'OPERATOR' as const,
            title: '💵 TravelEasy đã thanh toán đối soát đợt 2',
            message: 'Kế toán sàn TravelEasy đã hoàn tất lệnh chuyển khoản 35.800.000 đ vào tài khoản ngân hàng nhà xe.',
            link: '/company/settlements',
            priority: 'HIGH' as const,
          },
        ]
      : [
          {
            type: 'SECURITY' as const,
            role: 'ADMIN' as const,
            title: '🛡️ Audit Log: Can thiệp CSDL được ghi nhận',
            message: 'Phát hiện thao tác cập nhật bảng giá vé ngoài giờ hành chính từ IP 118.69.182.4.',
            link: '/admin/audit-logs',
            priority: 'HIGH' as const,
          },
          {
            type: 'BOOKING' as const,
            role: 'ADMIN' as const,
            title: '📊 Đơn vé giá trị cao trên sàn',
            message: 'Khách hàng đặt vé đoàn 8 chỗ tuyến Sài Gòn - Đà Lạt (Tổng tiền: 2.800.000 đ).',
            link: '/admin/bookings',
            priority: 'NORMAL' as const,
          },
        ];

    const randomPick = demoItems[Math.floor(Math.random() * demoItems.length)];
    sendAppNotification(randomPick);
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'HIGH') return n.priority === 'HIGH' || n.type === 'SECURITY';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'SECURITY':
        return <ShieldAlert size={16} color="#ef4444" />;
      case 'COMPANY':
        return <Bus size={16} color="#10b981" />;
      case 'FINANCE':
        return <DollarSign size={16} color="#f59e0b" />;
      case 'REVIEW':
        return <Star size={16} color="#8b5cf6" />;
      case 'BOOKING':
        return <Ticket size={16} color="#3b82f6" />;
      case 'CHECKIN':
        return <QrCode size={16} color="#06b6d4" />;
      case 'TRIP':
        return <Bus size={16} color="#f97316" />;
      default:
        return <Bell size={16} color="#64748b" />;
    }
  };

  const getIconBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'SECURITY':
        return isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2';
      case 'COMPANY':
        return isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7';
      case 'FINANCE':
        return isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7';
      case 'REVIEW':
        return isDark ? 'rgba(139, 92, 246, 0.2)' : '#f3e8ff';
      case 'BOOKING':
        return isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe';
      case 'CHECKIN':
        return isDark ? 'rgba(6, 182, 212, 0.2)' : '#cffafe';
      case 'TRIP':
        return isDark ? 'rgba(249, 115, 22, 0.2)' : '#ffedd5';
      default:
        return isDark ? '#1e293b' : '#f1f5f9';
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Nút Chuông Thông Báo */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOperator ? 'Thông báo vận hành nhà xe' : 'Trung tâm thông báo hệ thống'}
        aria-label="Thông báo"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
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
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isBumping ? 'scale(1.15)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#e2e8f0';
          e.currentTarget.style.borderColor = isDark ? '#60a5fa' : '#3b82f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isOpen
            ? isDark
              ? '#1e293b'
              : '#e2e8f0'
            : isDark
            ? 'rgba(30, 41, 59, 0.7)'
            : '#f1f5f9';
          e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
        }}
      >
        <Bell size={18} color={isDark ? '#f8fafc' : '#334155'} />

        {/* Chấm đỏ / Badge số thông báo chưa đọc */}
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
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${isDark ? '#0f172a' : '#ffffff'}`,
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)',
              animation: isBumping ? 'bounce 0.5s infinite' : 'pulse 2.5s infinite',
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
            width: '410px',
            maxWidth: '92vw',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '16px',
            boxShadow: isDark
              ? '0 25px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 25px 40px -10px rgba(15, 23, 42, 0.18)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header Popover */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {isOperator ? 'Thông Báo Vận Hành Nhà Xe' : isAdmin ? 'Thông Báo Quản Trị Hệ Thống' : 'Thông Báo'}
              </div>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                    color: isDark ? '#fca5a5' : '#dc2626',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
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
                  title="Đánh dấu tất cả là đã đọc"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: isDark ? '#38bdf8' : '#0284c7',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#f0f9ff',
                    border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.2)' : '#bae6fd'}`,
                    cursor: 'pointer',
                  }}
                >
                  <CheckCheck size={13} /> Đã đọc
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Xóa tất cả"
                  style={{
                    padding: '5px',
                    borderRadius: '6px',
                    color: isDark ? '#94a3b8' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Action Ribbon: LIVE DEMO EVENT TRIGGER BUTTON */}
          <div
            style={{
              padding: '8px 18px',
              backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
              borderBottom: `1px solid ${isDark ? '#334155' : '#dcfce7'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: isDark ? '#94a3b8' : '#15803d', fontWeight: 600 }}>
              <Volume2 size={13} color={isDark ? '#38bdf8' : '#16a34a'} />
              <span>Sự kiện âm thanh & CSDL thời gian thực</span>
            </div>
            <button
              onClick={handleTriggerLiveDemo}
              title="Nhấn để bắn 1 sự kiện thông báo mô phỏng trực tiếp kèm âm thanh chime"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: isDark ? '#0284c7' : '#16a34a',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Zap size={12} fill="#ffffff" />
              <span>Bắn Test Live</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '8px 16px',
              gap: '6px',
              borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
              backgroundColor: isDark ? '#111827' : '#ffffff',
            }}
          >
            {(['ALL', 'UNREAD', 'HIGH'] as const).map((tab) => {
              const active = filter === tab;
              const label =
                tab === 'ALL'
                  ? `Tất cả (${notifications.length})`
                  : tab === 'UNREAD'
                  ? `Chưa đọc (${unreadCount})`
                  : 'Quan trọng';
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: active
                      ? isDark
                        ? '#3b82f6'
                        : '#2563eb'
                      : isDark
                      ? '#1e293b'
                      : '#f1f5f9',
                    color: active ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                    border: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Danh sách thông báo */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
            }}
          >
            {filteredNotifs.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: isDark ? '#64748b' : '#94a3b8',
                  fontSize: '13px',
                }}
              >
                <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div>Không có thông báo nào trong danh mục này</div>
              </div>
            ) : (
              filteredNotifs.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => handleClickItem(item)}
                    style={{
                      padding: '12px 18px',
                      borderBottom: `1px solid ${isDark ? '#1e293b' : '#f8fafc'}`,
                      backgroundColor: item.isRead
                        ? isDark
                          ? '#111827'
                          : '#ffffff'
                        : isDark
                        ? 'rgba(30, 41, 59, 0.5)'
                        : '#f0f9ff',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = item.isRead
                        ? isDark
                          ? '#111827'
                          : '#ffffff'
                        : isDark
                        ? 'rgba(30, 41, 59, 0.5)'
                        : '#f0f9ff';
                    }}
                  >
                    {/* Icon Category */}
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
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          marginBottom: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: item.isRead ? 600 : 800,
                            color: isDark ? '#f8fafc' : '#0f172a',
                          }}
                        >
                          {item.title}
                        </span>
                        {!item.isRead && (
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          lineHeight: '1.4',
                          color: isDark ? '#cbd5e1' : '#475569',
                          marginBottom: '5px',
                        }}
                      >
                        {item.message}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '10.5px',
                          color: isDark ? '#64748b' : '#94a3b8',
                        }}
                      >
                        <span>{item.timestamp}</span>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: isDark ? '#38bdf8' : '#0284c7',
                            fontWeight: 600,
                          }}
                        >
                          Xem chi tiết <ChevronRight size={11} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
