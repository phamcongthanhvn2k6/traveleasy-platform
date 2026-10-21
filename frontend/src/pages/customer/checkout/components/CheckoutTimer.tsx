import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  initialSeconds?: number;
  onExpire: () => void;
}

export const CheckoutTimer: React.FC<Props> = ({ initialSeconds = 600, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 120; // under 2 minutes

  return (
    <div
      style={{
        backgroundColor: isUrgent ? '#fef2f2' : '#eff6ff',
        border: `1px solid ${isUrgent ? '#fca5a5' : '#bfdbfe'}`,
        borderRadius: '10px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isUrgent ? (
          <AlertTriangle size={18} color="#dc2626" />
        ) : (
          <Clock size={18} color="#2563eb" />
        )}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isUrgent ? '#b91c1c' : '#1e3a8a',
          }}
        >
          {isUrgent
            ? 'Ghế của bạn sắp hết thời gian giữ chỗ! Vui lòng hoàn tất thanh toán:'
            : 'Thời gian giữ chỗ và hoàn tất đơn hàng còn lại:'}
        </span>
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 800,
          color: isUrgent ? '#dc2626' : '#2563eb',
          backgroundColor: '#ffffff',
          padding: '4px 12px',
          borderRadius: '6px',
          border: `1px solid ${isUrgent ? '#f87171' : '#93c5fd'}`,
        }}
      >
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
};
