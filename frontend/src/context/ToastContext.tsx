import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global dispatcher cho phép gọi toast từ bất cứ đâu (kể cả axios interceptors / non-component files)
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
let globalToastListener: ToastListener | null = null;

export const toast = {
  success: (message: string, title: string = 'Thành công', duration: number = 3500) => {
    if (globalToastListener) globalToastListener({ type: 'success', message, title, duration });
  },
  error: (message: string, title: string = 'Thất bại', duration: number = 4500) => {
    if (globalToastListener) globalToastListener({ type: 'error', message, title, duration });
  },
  warning: (message: string, title: string = 'Cảnh báo', duration: number = 4000) => {
    if (globalToastListener) globalToastListener({ type: 'warning', message, title, duration });
  },
  info: (message: string, title: string = 'Thông báo', duration: number = 3500) => {
    if (globalToastListener) globalToastListener({ type: 'info', message, title, duration });
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration: number = 3500) => {
      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  useEffect(() => {
    globalToastListener = ({ type, message, title, duration }) => {
      showToast(type, message, title, duration);
    };
    return () => {
      globalToastListener = null;
    };
  }, [showToast]);

  const success = useCallback(
    (message: string, title: string = 'Thành công', duration?: number) => {
      showToast('success', message, title, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title: string = 'Thất bại', duration?: number) => {
      showToast('error', message, title, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title: string = 'Cảnh báo', duration?: number) => {
      showToast('warning', message, title, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title: string = 'Thông báo', duration?: number) => {
      showToast('info', message, title, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '440px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Component từng thẻ Toast
const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  const config = {
    success: {
      borderColor: '#10b981',
      bgLight: '#f0fdf4',
      badgeBg: '#10b981',
      titleColor: '#065f46',
      icon: CheckCircle2,
      progressColor: '#10b981',
      label: 'THÀNH CÔNG',
    },
    error: {
      borderColor: '#ef4444',
      bgLight: '#fef2f2',
      badgeBg: '#ef4444',
      titleColor: '#991b1b',
      icon: AlertCircle,
      progressColor: '#ef4444',
      label: 'THẤT BẠI',
    },
    warning: {
      borderColor: '#f59e0b',
      bgLight: '#fffbeb',
      badgeBg: '#f59e0b',
      titleColor: '#92400e',
      icon: AlertTriangle,
      progressColor: '#f59e0b',
      label: 'CẢNH BÁO',
    },
    info: {
      borderColor: '#3b82f6',
      bgLight: '#eff6ff',
      badgeBg: '#3b82f6',
      titleColor: '#1e40af',
      icon: Info,
      progressColor: '#3b82f6',
      label: 'THÔNG BÁO',
    },
  }[item.type];

  const Icon = config.icon;
  const duration = item.duration || 3500;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: '#ffffff',
        border: `1.5px solid ${config.borderColor}`,
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: config.badgeBg,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 10px ${config.badgeBg}40`,
          }}
        >
          <Icon size={20} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: config.titleColor,
                backgroundColor: config.bgLight,
                padding: '1px 6px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}
            >
              {config.label}
            </span>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
              {item.title || (item.type === 'success' ? 'Thao tác thành công' : 'Thông báo')}
            </div>
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#475569',
              lineHeight: 1.45,
              wordBreak: 'break-word',
            }}
          >
            {item.message}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress countdown bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          backgroundColor: config.progressColor,
          transition: 'width 0.05s linear',
        }}
      />
    </div>
  );
};
