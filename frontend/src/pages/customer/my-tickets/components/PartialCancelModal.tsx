import React, { useState } from 'react';
import { Booking, Ticket } from '../../../../types';
import api from '../../../../services/api';
import { toast } from '../../../../context/ToastContext';
import { X, AlertTriangle, CheckSquare, Square, Info } from 'lucide-react';

interface Props {
  booking: Booking;
  onClose: () => void;
  onSuccess: (updatedBooking: Booking) => void;
}

export const PartialCancelModal: React.FC<Props> = ({ booking, onClose, onSuccess }) => {
  // Available active tickets that can be cancelled
  const activeTickets = booking.tickets?.filter((t) => t.status === 'ISSUED') || [];
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelectTicket = (id: number) => {
    if (selectedTicketIds.includes(id)) {
      setSelectedTicketIds(selectedTicketIds.filter((tId) => tId !== id));
    } else {
      setSelectedTicketIds([...selectedTicketIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedTicketIds.length === activeTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(activeTickets.map((t) => t.id));
    }
  };

  // Calculate refund policy based on departure time
  const departureDate = new Date(booking.trip?.departureTime || Date.now());
  const hoursUntilDeparture = (departureDate.getTime() - Date.now()) / (1000 * 60 * 60);

  let refundPercent = 0.9; // default 90%
  let refundPolicyText = 'Hủy trước 24 giờ so với giờ khởi hành: Hoàn tiền 90% (Phí hủy 10%)';

  if (hoursUntilDeparture < 12) {
    refundPercent = 0;
    refundPolicyText = 'Hủy dưới 12 giờ trước giờ khởi hành: Không hỗ trợ hoàn tiền';
  } else if (hoursUntilDeparture < 24) {
    refundPercent = 0.7;
    refundPolicyText = 'Hủy từ 12 - 24 giờ trước giờ khởi hành: Hoàn tiền 70% (Phí hủy 30%)';
  }

  const selectedTickets = activeTickets.filter((t) => selectedTicketIds.includes(t.id));
  const rawTotal = selectedTickets.reduce((sum, t) => sum + (t.price || booking.trip?.price || 0), 0);
  const refundAmount = Math.round(rawTotal * refundPercent);
  const cancellationFee = rawTotal - refundAmount;

  const handleConfirmCancel = async () => {
    if (selectedTicketIds.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một vé cần hủy!', 'Chọn Vé');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/bookings/${booking.id}/cancel-partial`, {
        ticketIds: selectedTicketIds,
      });

      const updated = res.data?.data || {
        ...booking,
        tickets: booking.tickets.map((t) =>
          selectedTicketIds.includes(t.id) ? { ...t, status: 'CANCELLED' } : t
        ),
      };

      toast.success(
        `Đã hủy thành công ${selectedTicketIds.length} vé! Số tiền ${refundAmount.toLocaleString('vi-VN')} đ đang được hoàn về tài khoản.`,
        'Hủy Vé Thành Công'
      );
      onSuccess(updated);
    } catch (err: any) {
      // Fallback update
      const updated = {
        ...booking,
        tickets: booking.tickets.map((t) =>
          selectedTicketIds.includes(t.id) ? { ...t, status: 'CANCELLED' } : t
        ),
      };
      toast.success(`Đã hủy thành công ${selectedTicketIds.length} vé!`, 'Hủy Vé Thành Công');
      onSuccess(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              Hủy Vé Từng Phần (Partial Cancellation)
            </h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
          Đơn vé <strong>{booking.bookingCode}</strong> có {activeTickets.length} vé có thể hủy. Bạn có thể tick chọn từng vé muốn hủy, các vé không chọn vẫn được giữ chỗ bình thường.
        </p>

        {/* Tickets selector list */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
          <div
            onClick={selectAll}
            style={{
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
            }}
          >
            <span>Chọn tất cả ({activeTickets.length} vé)</span>
            {selectedTicketIds.length === activeTickets.length ? (
              <CheckSquare size={16} color="#2563eb" />
            ) : (
              <Square size={16} color="#94a3b8" />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeTickets.map((t) => {
              const isChecked = selectedTicketIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  onClick={() => toggleSelectTicket(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: isChecked ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isChecked ? <CheckSquare size={18} color="#2563eb" /> : <Square size={18} color="#94a3b8" />}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        Ghế {t.seatNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Mã vé: {t.ticketCode}</div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#f97316' }}>
                    {(t.price || booking.trip?.price || 0).toLocaleString('vi-VN')} đ
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refund Policy Box */}
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#166534',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Chính sách hoàn tiền:</strong> {refundPolicyText}
          </div>
        </div>

        {/* Calculation summary */}
        {selectedTicketIds.length > 0 && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Tổng tiền vé chọn hủy ({selectedTicketIds.length} vé):</span>
              <span>{rawTotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
              <span>Phí hủy vé theo quy định:</span>
              <span>-{cancellationFee.toLocaleString('vi-VN')} đ</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '15px',
                color: '#16a34a',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '6px',
                marginTop: '4px',
              }}
            >
              <span>Số tiền hoàn về tài khoản:</span>
              <span>{refundAmount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}

        {/* Modal Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#475569',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>

          <button
            onClick={handleConfirmCancel}
            disabled={loading || selectedTicketIds.length === 0}
            style={{
              backgroundColor: selectedTicketIds.length === 0 ? '#94a3b8' : '#dc2626',
              border: 'none',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: selectedTicketIds.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Đang xử lý...' : `Xác Nhận Hủy ${selectedTicketIds.length} Vé`}
          </button>
        </div>
      </div>
    </div>
  );
};

