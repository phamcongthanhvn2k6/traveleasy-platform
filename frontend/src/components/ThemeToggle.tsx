import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
  const { isDark, toggleTheme } = useTheme();

  if (!showLabel) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối (Ban đêm)'}
        aria-label="Toggle Theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9',
          color: isDark ? '#fbbf24' : '#475569',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isDark ? '0 0 12px rgba(251, 191, 36, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#e2e8f0';
          e.currentTarget.style.borderColor = isDark ? '#fbbf24' : '#3b82f6';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(30, 41, 59, 0.7)' : '#f1f5f9';
          e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isDark ? (
          <Moon size={18} color="#fbbf24" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }} />
        ) : (
          <Sun size={18} color="#f59e0b" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.5))' }} />
        )}
      </button>
    );
  }

  // Full Pill Design with sliding thumb & label
  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
      aria-label="Toggle Theme"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px 5px 6px',
        borderRadius: '24px',
        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
        boxShadow: isDark
          ? '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isDark ? '#fbbf24' : '#3b82f6';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Animated Icon Circle */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#fbbf24' : '#f59e0b',
          boxShadow: isDark
            ? '0 0 10px rgba(251, 191, 36, 0.3)'
            : '0 1px 3px rgba(0,0,0,0.12)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isDark ? (
          <Moon size={14} color="#fbbf24" fill="#fbbf24" style={{ transform: 'rotate(-10deg)' }} />
        ) : (
          <Sun size={14} color="#f59e0b" fill="#f59e0b" />
        )}
      </span>

      {/* Text Label */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.2px',
          color: isDark ? '#fbbf24' : '#334155',
          transition: 'color 0.2s ease',
        }}
      >
        {isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}
      </span>
    </button>
  );
};

export default ThemeToggle;
