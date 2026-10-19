import React, { useState } from 'react';
import { Trip, TripDetail } from '../types';
import { BusSeatMap } from './BusSeatMap';
import api from '../services/api';
import { Clock, MapPin, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  trip: Trip;
  onBook: (trip: Trip, selectedSeats: string[], points: { pickup?: number; dropoff?: number; pickupName?: string; dropoffName?: string }) => void;
}

export const TripCard: React.FC<Props> = ({ trip, onBook }) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<number | undefined>();
  const [selectedDropoff, setSelectedDropoff] = useState<number | undefined>();

  const toggleExpand = async () => {
    if (!expanded && !tripDetail) {
      setLoadingDetail(true);
      try {
        const res = await api.get(`/trips/${trip.id}`);
        setTripDetail(res.data.data);
        if (res.data.data.pickupPoints?.length > 0) {
          setSelectedPickup(res.data.data.pickupPoints[0].id);
        }
        if (res.data.data.dropoffPoints?.length > 0) {
          setSelectedDropoff(res.data.data.dropoffPoints[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleToggleSeat = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const pickupPointObj = tripDetail?.pickupPoints.find(p => p.id === selectedPickup);
  const dropoffPointObj = tripDetail?.dropoffPoints.find(p => p.id === selectedDropoff);

  const totalPrice = selectedSeats.length * trip.price;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      marginBottom: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '2fr 3fr 1.5fr', alignItems: 'center', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a' }}>{trip.busCompanyName}</span>
            <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              Chính hãng
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={14} color="#10b981" /> {trip.busType}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{formatTime(trip.departureTime)}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{trip.originCity}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {trip.durationHours}h
            </div>
            <div style={{ width: '80px', height: '2px', backgroundColor: '#cbd5e1', margin: '4px auto', position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: '-4px', width: '6px', height: '6px', borderTop: '2px solid #64748b', borderRight: '2px solid #64748b', transform: 'rotate(45deg)' }}></div>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{trip.distanceKm} km</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{formatTime(trip.arrivalTime)}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{trip.destinationCity}</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>
            {trip.price.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>
            Còn {trip.availableSeats} chỗ trống
          </div>
          <button
            onClick={toggleExpand}
            style={{
              backgroundColor: expanded ? '#f1f5f9' : '#2563eb',
              color: expanded ? '#334155' : '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {expanded ? <>Đóng sơ đồ <ChevronUp size={16} /></> : <>Chọn chuyến <ChevronDown size={16} /></>}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px', backgroundColor: '#f8fafc' }}>
          {loadingDetail && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải sơ đồ ghế...</div>}
          {tripDetail && (
            <div>
              {/* Điểm đón / trả */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <MapPin size={14} style={{ display: 'inline', color: '#2563eb' }} /> Chọn điểm đón:
                  </label>
                  <select
                    value={selectedPickup}
                    onChange={(e) => setSelectedPickup(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {tripDetail.pickupPoints.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.address}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <MapPin size={14} style={{ display: 'inline', color: '#f97316' }} /> Chọn điểm trả:
                  </label>
                  <select
                    value={selectedDropoff}
                    onChange={(e) => setSelectedDropoff(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {tripDetail.dropoffPoints.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.address}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sơ đồ ghế */}
              <BusSeatMap 
                seats={tripDetail.seats} 
                selectedSeatNumbers={selectedSeats} 
                onToggleSeat={handleToggleSeat} 
              />

              {/* Thanh thanh toán nhanh */}
              <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Ghế đang chọn: </span>
                  <span style={{ fontWeight: 800, color: '#f97316', fontSize: '16px' }}>
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn ghế'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Tổng tiền: </span>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '20px' }}>
                      {totalPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <button
                    disabled={selectedSeats.length === 0}
                    onClick={() => onBook(trip, selectedSeats, {
                      pickup: selectedPickup,
                      dropoff: selectedDropoff,
                      pickupName: pickupPointObj?.name,
                      dropoffName: dropoffPointObj?.name
                    })}
                    style={{
                      backgroundColor: selectedSeats.length > 0 ? '#f97316' : '#cbd5e1',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Tiếp Tục Đặt Vé
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
