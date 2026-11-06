import React from 'react';
import { useLoading } from '../context/LoadingContext';
import { useTheme } from '../context/ThemeContext';
import { Bus } from 'lucide-react';

export const GlobalPageLoader: React.FC = () => {
  const { isLoading, message, progress } = useLoading();
  const { isDark } = useTheme();

  return (
    <>
      {/* 1. Thanh tiến trình đỉnh đầu màn hình (Top Slim Progress Bar) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '3.5px',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 50%, #f97316 100%)',
          boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)',
          zIndex: 999999,
          opacity: progress > 0 ? 1 : 0,
          transition: 'width 0.2s ease, opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />

      {/* 2. Màn hình Loading chuyển cảnh toàn diện (Splash Transition Screen) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          backgroundColor: isDark ? 'rgba(11, 15, 25, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? 'auto' : 'none',
          transition: 'opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Glow ambient background effect */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(11,15,25,0) 70%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card chứa hoạt họa xe buýt & logo */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '32px 40px',
            borderRadius: '20px',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(37, 99, 235, 0.15)'}`,
            boxShadow: isDark
              ? '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 20px 40px rgba(37, 99, 235, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            maxWidth: '90%',
            width: '380px',
            textAlign: 'center',
          }}
        >
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Bus size={18} />
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            >
              Travel<span style={{ color: '#2563eb' }}>Easy</span>
              <span style={{ color: '#f97316', fontSize: '18px' }}>.vn</span>
            </span>
          </div>

          {/* Hoạt họa xe buýt lăn bánh trên cung đường (Bus Animation) */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            {/* Chiếc xe buýt nhấp nhô nhẹ nhàng */}
            <div
              style={{
                animation: 'busBounce 0.9s ease-in-out infinite alternate',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                filter: 'drop-shadow(0 6px 12px rgba(37, 99, 235, 0.35))',
              }}
            >
              <Bus size={42} strokeWidth={2.2} />
            </div>

            {/* Vạch kẻ đường di chuyển dưới bánh xe */}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '10px',
                right: '10px',
                height: '2px',
                background: isDark
                  ? 'repeating-linear-gradient(90deg, #38bdf8 0, #38bdf8 8px, transparent 8px, transparent 16px)'
                  : 'repeating-linear-gradient(90deg, #2563eb 0, #2563eb 8px, transparent 8px, transparent 16px)',
                animation: 'roadMove 0.5s linear infinite',
                opacity: 0.7,
              }}
            />
          </div>

          {/* Thông điệp tải dữ liệu */}
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: isDark ? '#e2e8f0' : '#1e293b',
              marginBottom: '8px',
              lineHeight: 1.5,
              minHeight: '22px',
            }}
          >
            {message}
          </div>

          {/* Dải tiến trình nhỏ thanh nhã */}
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: isDark ? '#334155' : '#e2e8f0',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginTop: '12px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                borderRadius: '9999px',
                transition: 'width 0.15s ease',
              }}
            />
          </div>

          {/* Slogan định vị */}
          <div
            style={{
              fontSize: '11px',
              color: isDark ? '#94a3b8' : '#64748b',
              marginTop: '12px',
              letterSpacing: '0.2px',
            }}
          >
            ⚡ Đang nạp dữ liệu trong âm thầm...
          </div>
        </div>
      </div>

      {/* Keyframe animations styles */}
      <style>{`
        @keyframes busBounce {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          100% {
            transform: translateY(1px) rotate(1deg);
          }
        }

        @keyframes roadMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: -16px 0;
          }
        }
      `}</style>
    </>
  );
};

