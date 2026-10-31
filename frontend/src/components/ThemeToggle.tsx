import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      aria-label="Toggle Theme"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px 4px 6px',
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
        e.currentTarget.style.borderColor = isDark ? '#60a5fa' : '#3b82f6';
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
          color: isDark ? '#facc15' : '#f59e0b',
          boxShadow: isDark
            ? '0 1px 2px rgba(0,0,0,0.5)'
            : '0 1px 3px rgba(0,0,0,0.12)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {isDark ? (
          <Moon size={14} color="#facc15" fill="#facc15" style={{ transform: 'rotate(-10deg)' }} />
        ) : (
          <Sun size={14} color="#f59e0b" fill="#f59e0b" />
        )}
      </span>

      {/* Text Label */}
      {showLabel && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.2px',
            color: isDark ? '#e2e8f0' : '#334155',
            transition: 'color 0.2s ease',
          }}
        >
          {isDark ? 'Giao diện Tối' : 'Giao diện Sáng'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
