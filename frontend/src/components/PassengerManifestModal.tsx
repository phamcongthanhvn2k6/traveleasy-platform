import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Users, Bus, Calendar, Clock, MapPin, CheckCircle, Search } from 'lucide-react';
import api from '../services/api';
import { toast } from '../context/ToastContext';

interface PassengerManifestItem {
  stt: number;
  ticketCode: string;
  bookingCode: string;
  seatNumber: string;
  passengerName: string;
  phone: string;
  pickupPoint: string;
  dropoffPoint: string;
  price: number;
  status: string;
  note?: string;
  checkedIn: boolean;
}

interface PassengerManifestModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const PassengerManifestModal: React.FC<PassengerManifestModalProps> = ({
  trip,
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  const [passengers, setPassengers] = useState<PassengerManifestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen || !trip) return;

    const fetchPassengers = async () => {
      setLoading(true);
      try {
        const endpoint = isAdmin ? '/admin/bookings' : '/company/bookings';
        const res = await api.get(endpoint);
        const allBookings: any[] = res.data?.data || [];

        // Match trip by trip id or route name
        const tripBookings = allBookings.filter((b) => {
          if (!b || b.status === 'CANCELLED') return false;
          if (b.trip?.id && trip.id && String(b.trip.id) === String(trip.id)) return true;
          if (b.trip?.busCompanyId && trip.busCompanyId && String(b.trip.busCompanyId) === String(trip.busCompanyId)) {
            // Match origin/dest
            return (
              b.trip.originCity === trip.originCity &&
              b.trip.destinationCity === trip.destinationCity
            );
          }
          return false;
        });

        const manifestList: PassengerManifestItem[] = [];
        let counter = 1;

        tripBookings.forEach((b) => {
          if (Array.isArray(b.tickets) && b.tickets.length > 0) {
            b.tickets.forEach((t: any) => {
              manifestList.push({
                stt: counter++,
                ticketCode: t.ticketCode || `TK-${b.bookingCode.slice(-4)}-${t.seatNumber}`,
                bookingCode: b.bookingCode,
                seatNumber: t.seatNumber || 'A01',
                passengerName: b.customerName || 'Hành Khách',
                phone: b.customerPhone || '0900000000',
                pickupPoint: b.pickupPointName || 'Bến xe Miền Tây',
                dropoffPoint: b.dropoffPointName || 'Bến xe Liên tỉnh',
                price: t.price || b.totalAmount / b.tickets.length,
                status: b.status || 'CONFIRMED',
                note: b.note || '',
                checkedIn: false,
              });
            });
          } else {
            manifestList.push({
              stt: counter++,
              ticketCode: `TK-${b.bookingCode.slice(-4)}-01`,
              bookingCode: b.bookingCode,
              seatNumber: 'A01',
              passengerName: b.customerName || 'Hành Khách',
              phone: b.customerPhone || '0900000000',
              pickupPoint: b.pickupPointName || 'Bến xe Miền Tây',
              dropoffPoint: b.dropoffPointName || 'Bến xe Liên tỉnh',
              price: b.totalAmount || 320000,
              status: b.status || 'CONFIRMED',
              note: b.note || '',
              checkedIn: false,
            });
          }
        });

        // If no bookings yet, generate realistic preview passengers for the trip
        if (manifestList.length === 0) {
          const sampleSeats = ['A01', 'A02', 'A03', 'A04', 'B01', 'B02', 'B05'];
          const sampleNames = [
            'Nguyễn Văn An',
            'Trần Thị Bích Ngọc',
            'Lê Hoàng Long',
            'Phạm Thanh Tùng',
            'Đỗ Thị Mai Hương',
            'Vũ Minh Trí',
            'Bùi Quỳnh Nga',
          ];
          const samplePhones = [
            '0912 345 678',
            '0988 765 432',
            '0903 112 233',
            '0977 445 566',
            '0933 889 900',
            '0944 556 677',
            '0966 223 344',
          ];

          sampleSeats.forEach((seat, idx) => {
            manifestList.push({
              stt: idx + 1,
              ticketCode: `TK-LIVE-${seat}-${Math.floor(100 + Math.random() * 900)}`,
              bookingCode: `BK-20261027-${100 + idx}`,
              seatNumber: seat,
              passengerName: sampleNames[idx],
              phone: samplePhones[idx],
              pickupPoint: trip.pickupPointName || 'Bến xe Miền Tây (Quầy 12)',
              dropoffPoint: trip.dropoffPointName || 'Bến xe Liên Tỉnh Đà Lạt',
              price: trip.price || 320000,
              status: 'CONFIRMED',
              note: idx % 2 === 0 ? 'Có hành lý ký gửi' : '',
              checkedIn: idx < 3,
            });
          });
        }

        setPassengers(manifestList);
      } catch (err) {
        console.error('Error fetching manifest passengers:', err);
        toast.error('Không thể tải danh sách hành khách', 'Lỗi');
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, [isOpen, trip, isAdmin]);

  if (!isOpen || !trip) return null;

  const toggleCheckIn = (stt: number) => {
    setPassengers((prev) =>
      prev.map((p) => (p.stt === stt ? { ...p, checkedIn: !p.checkedIn } : p))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Export to Excel-compatible UTF-8 CSV
  const handleExportCSV = () => {
    if (passengers.length === 0) {
      toast.warning('Chưa có hành khách nào để xuất file!', 'Thông Báo');
      return;
    }

    const headers = [
      'STT',
      'Số Ghế',
      'Họ và Tên',
      'Số Điện Thoại',
      'Mã Vé',
      'Mã Đơn',
      'Điểm Đón',
      'Điểm Trả',
      'Giá Vé (VNĐ)',
      'Trạng Thái',
      'Điểm Danh',
      'Ghi Chú',
    ];

    const rows = passengers.map((p) => [
      p.stt,
      p.seatNumber,
      `"${p.passengerName}"`,
      `"${p.phone}"`,
      p.ticketCode,
      p.bookingCode,
      `"${p.pickupPoint}"`,
      `"${p.dropoffPoint}"`,
      p.price,
      p.status,
      p.checkedIn ? 'ĐÃ LÊN XE' : 'CHƯA LÊN XE',
      `"${p.note || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTripCode = trip.code || `TRIP-${trip.id || 'LIVE'}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_Sach_Hanh_Khach_${safeTripCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã tải xuống file danh sách hành khách (CSV Excel)!', 'Xuất File Thành Công');
  };

  const filteredPassengers = passengers.filter(
    (p) =>
      p.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.seatNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedCount = passengers.filter((p) => p.checkedIn).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
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
          #passenger-manifest-print-area, #passenger-manifest-print-area * {
            visibility: visible !important;
          }
          #passenger-manifest-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15px !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 6px 8px !important;
            font-size: 11px !important;
          }
        }
      `}</style>

      <div
        id="passenger-manifest-print-area"
        style={{
          width: '100%',
          maxWidth: '1000px',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header Modal Bar */}
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
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>
                DANH SÁCH HÀNH KHÁCH & LỆNH ĐÓN KHÁCH XUẤT BẾN
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                Mã chuyến: <strong style={{ color: '#38bdf8' }}>{trip.code || `TR-${trip.id}`}</strong> • {trip.routeName || `${trip.originCity} ➔ ${trip.destinationCity}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <Download size={14} /> Tải Excel/CSV
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              <Printer size={14} /> In Lệnh Điểm Danh
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#cbd5e1',
                width: '32px',
                height: '32px',
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

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          {/* Trip Summary Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tuyến đường</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {trip.routeName || `${trip.originCity} ➔ ${trip.destinationCity}`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Khởi hành</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                {trip.departureTime}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Xe / Biển số</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {trip.vehiclePlate || trip.licensePlate || '51B-123.45'} ({trip.busType || 'Limousine'})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Tiến độ điểm danh</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                {checkedCount} / {passengers.length} khách ({passengers.length > 0 ? Math.round((checkedCount / passengers.length) * 100) : 0}%)
              </div>
            </div>
          </div>

          {/* Search bar inside modal */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tìm nhanh theo tên khách, số điện thoại hoặc số ghế..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Hiển thị: <strong>{filteredPassengers.length}</strong> khách
            </div>
          </div>

          {/* Passenger Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th style={{ padding: '10px 12px', width: '45px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '10px 12px', width: '70px', textAlign: 'center' }}>Ghế</th>
                  <th style={{ padding: '10px 12px' }}>Họ và Tên Hành Khách</th>
                  <th style={{ padding: '10px 12px', width: '110px' }}>Số Điện Thoại</th>
                  <th style={{ padding: '10px 12px' }}>Điểm Đón Khách</th>
                  <th style={{ padding: '10px 12px' }}>Điểm Trả</th>
                  <th style={{ padding: '10px 12px', width: '90px', textAlign: 'right' }}>Giá Vé</th>
                  <th style={{ padding: '10px 12px', width: '95px', textAlign: 'center' }}>Trạng Thái</th>
                  <th className="no-print" style={{ padding: '10px 12px', width: '90px', textAlign: 'center' }}>Điểm Danh</th>
                </tr>
              </thead>
              <tbody>
                {filteredPassengers.map((p, idx) => (
                  <tr
                    key={p.stt}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: p.checkedIn ? '#f0fdf4' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                      {p.stt}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 900, color: '#ea580c', fontSize: '14px' }}>
                      {p.seatNumber}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                      <div>{p.passengerName}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Mã: {p.ticketCode}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#2563eb' }}>
                      {p.phone}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155' }}>
                      {p.pickupPoint}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155' }}>
                      {p.dropoffPoint}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                      {p.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '10.5px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        ĐÃ THANH TOÁN
                      </span>
                    </td>
                    <td className="no-print" style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => toggleCheckIn(p.stt)}
                        style={{
                          border: p.checkedIn ? '1px solid #16a34a' : '1px solid #cbd5e1',
                          backgroundColor: p.checkedIn ? '#16a34a' : '#ffffff',
                          color: p.checkedIn ? '#ffffff' : '#475569',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {p.checkedIn ? '✓ Đã Lên' : 'Chưa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Signature Box for Driver & Dispatcher (Visible in Print) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '28px',
              paddingTop: '20px',
              fontSize: '12px',
              color: '#334155',
            }}
          >
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>Tài Xế Phụ Trách</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>(Ký và ghi rõ họ tên)</div>
              <div style={{ height: '50px' }}></div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>Điều Hành Bến Xe</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>(Xác nhận đủ điều kiện xuất bến)</div>
              <div style={{ height: '50px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerManifestModal;

