import React, { useRef } from 'react';
import { X, Printer, Download, QrCode, Bus, Clock, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Booking, Ticket } from '../types';

interface BoardingPassModalProps {
  booking: Booking;
  selectedTicket?: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({
  booking,
  selectedTicket,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !booking) return null;

  // If a specific ticket is chosen, render that one; otherwise render all tickets in the booking
  const ticketsToRender = selectedTicket ? [selectedTicket] : booking.tickets || [];

  const formatDateTime = (dtStr?: string): { time: string; date: string } => {
    if (!dtStr) return { time: '-', date: '-' };
    try {
      const d = new Date(dtStr);
      return {
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
      };
    } catch {
      return { time: dtStr, date: '' };
    }
  };

  const depFormatted = formatDateTime(booking.trip?.departureTime);
  const arrFormatted = formatDateTime(booking.trip?.arrivalTime);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="no-print-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #boarding-pass-print-area, #boarding-pass-print-area * {
            visibility: visible !important;
          }
          #boarding-pass-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .boarding-card {
            box-shadow: none !important;
            border: 1.5px solid #0f172a !important;
            page-break-inside: avoid !important;
            margin-bottom: 24px !important;
          }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
        }}
      >
        {/* Modal Top Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bus size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.2px' }}>
                THẺ LÊN XE ĐIỆN TỬ (E-BOARDING PASS)
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Mã đơn vé: <strong style={{ color: '#38bdf8' }}>{booking.bookingCode}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Printer size={15} /> In Thẻ / Tải PDF
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#cbd5e1',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Container for Boarding Passes */}
        <div
          id="boarding-pass-print-area"
          ref={printRef}
          style={{
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {ticketsToRender.map((ticket, idx) => {
            const qrData = `TRAVELEASY:${booking.bookingCode}:${ticket.ticketCode}:${ticket.seatNumber}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

            return (
              <div
                key={ticket.id || idx}
                className="boarding-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  overflow: 'hidden',
                  position: 'relative',
                  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                }}
              >
                {/* LEFT: MAIN PASS (70%) */}
                <div style={{ flex: '1 1 68%', padding: '24px', borderRight: '2px dashed #cbd5e1', position: 'relative' }}>
                  {/* Decorative semicircles for perforation illusion */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-12px',
                      top: '-12px',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '50%',
                      border: '1px solid #cbd5e1',
                      zIndex: 2,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: '-12px',
                      bottom: '-12px',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '50%',
                      border: '1px solid #cbd5e1',
                      zIndex: 2,
                    }}
                  />

                  {/* Header info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          backgroundColor: '#0d9488',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '11px',
                          letterSpacing: '1px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        TRAVELEASY VERIFIED
                      </div>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                        {booking.trip?.busCompanyName || 'TravelEasy Express'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#16a34a',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        padding: '3px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      <CheckCircle2 size={13} /> ĐÃ XÁC THỰC LÊN XE
                    </div>
                  </div>

                  {/* Itinerary Banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f1f5f9',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      marginBottom: '18px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Nơi khởi hành
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                        {booking.trip?.originCity || 'TP. Hồ Chí Minh'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                        {depFormatted.time} • {depFormatted.date}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: '0 10px' }}>
                      <Bus size={22} color="#0d9488" />
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>
                        {booking.trip?.distanceKm ? `${booking.trip.distanceKm} KM` : 'CHUYẾN ĐI'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Nơi đến
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
                        {booking.trip?.destinationCity || 'Đà Lạt'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                        {arrFormatted.time} • {arrFormatted.date}
                      </div>
                    </div>
                  </div>

                  {/* Grid Passenger & Seat Details */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                      paddingBottom: '16px',
                      marginBottom: '16px',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Hành khách
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        {booking.customerName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{booking.customerPhone}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Số ghế
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#ea580c', marginTop: '-2px' }}>
                        {ticket.seatNumber}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Loại xe
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {booking.trip?.busType || 'Limousine VIP'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Biển số: {(booking.trip as any)?.licensePlate || '51B-123.45'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        Giá vé
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                        {ticket.price?.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>

                  {/* Pickup & Dropoff Detail */}
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    <div>
                      📍 Điểm đón:{' '}
                      <strong style={{ color: '#0f172a' }}>{booking.pickupPointName || 'Bến xe Miền Tây'}</strong>
                    </div>
                    <div>
                      🏁 Điểm trả:{' '}
                      <strong style={{ color: '#0f172a' }}>{booking.dropoffPointName || 'Bến xe Liên tỉnh'}</strong>
                    </div>
                  </div>
                </div>

                {/* RIGHT: TICKET STUB / QR CODE (32%) */}
                <div
                  style={{
                    flex: '0 0 32%',
                    backgroundColor: '#fafafa',
                    padding: '24px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                      MÃ KIỂM SOÁT VÉ
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', margin: '2px 0 10px 0' }}>
                      {ticket.ticketCode}
                    </div>

                    {/* QR Code */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'inline-block',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <img
                        src={qrImageUrl}
                        alt={`QR Code ${ticket.ticketCode}`}
                        style={{ width: '130px', height: '130px', display: 'block' }}
                      />
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                      Quét mã QR khi lên xe
                    </div>
                  </div>

                  <div style={{ width: '100%', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                      GHẾ <span style={{ color: '#ea580c', fontSize: '14px', fontWeight: 900 }}>{ticket.seatNumber}</span>
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '2px', lineHeight: 1.3 }}>
                      Có mặt tại bến trước 20 phút giờ khởi hành
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Passenger Notice */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#92400e',
              lineHeight: 1.5,
            }}
          >
            <strong>Lưu ý hành khách:</strong> Vui lòng xuất trình mã QR điện tử trên điện thoại hoặc bản in này cho tài xế/tiếp viên khi lên xe. Hành lý xách tay tối đa 20kg/hành khách. Cần hỗ trợ khẩn cấp liên hệ tổng đài 24/7: <strong>1900 6868</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardingPassModal;
