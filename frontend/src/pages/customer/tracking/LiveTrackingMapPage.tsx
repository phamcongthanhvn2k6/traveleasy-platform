/**
 * @file LiveTrackingMapPage.tsx
 * @description Bản đồ Định vị GPS Live Tracking xe chạy thời gian thực (Leaflet + OpenStreetMap + SSE Stream)
 * @author Nguyễn Đại Phát (phatnguyn146)
 * @role Analytics & Tracking Specialist
 * @task [S306][TRACKING] Sprint 3 (4 SP)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../../services/api';
import {
  Navigation,
  MapPin,
  Gauge,
  Clock,
  Phone,
  ShieldCheck,
  RotateCw,
  Radio,
  Smartphone,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Bus,
  Layers,
  ArrowRight,
  Ticket,
  QrCode,
  UserCheck,
  Share2
} from 'lucide-react';

export interface UserTripBooking {
  bookingId: number;
  bookingCode: string;
  tripId: number;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  busCompanyName: string;
  busType: string;
  seats: string[];
  pickupPointName?: string;
  dropoffPointName?: string;
  status: string;
}

interface TripGpsData {
  tripId: number;
  tripCode: string;
  routeId: number;
  routeName: string;
  originCity: string;
  destinationCity: string;
  licensePlate: string;
  busType: string;
  busCompanyName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  currentLocationName: string;
  nextStationName: string;
  nextStationDistanceKm: number;
  etaMinutes: number;
  progressPercent: number;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  alcoholTested: boolean;
  status: string;
  updatedAt: string;
  routeCoordinates: number[][];
}

const DEMO_TRIPS = [
  { id: 696, name: 'Sài Gòn ➔ Đà Lạt (Xe VIP Limousine 34 Phòng)' },
  { id: 697, name: 'Hà Nội ➔ Sa Pa (Xe Giường Nằm Luxury Express)' },
  { id: 698, name: 'Đà Nẵng ➔ Quy Nhơn (Xe Giường Nằm Cao Cấp)' }
];

export default function LiveTrackingMapPage() {
  const { tripId: paramTripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  // Danh sách vé thực tế của người dùng hiện tại
  const [myBookings, setMyBookings] = useState<UserTripBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  const activeTripId = Number(paramTripId) || (myBookings.length > 0 ? myBookings[0].tripId : 696);

  const [tripData, setTripData] = useState<TripGpsData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<string>('');
  const [driverMode, setDriverMode] = useState<boolean>(false);
  const [isSharingGps, setIsSharingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [autoFollowBus, setAutoFollowBus] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);

  // 0. Tải danh sách vé của tài khoản người dùng đang đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('traveleasy_token');
    if (!token) return;

    setLoadingBookings(true);
    api.get('/bookings/my-bookings')
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: UserTripBooking[] = data
            .filter((b: any) => b.trip && b.trip.id)
            .map((b: any) => ({
              bookingId: b.id,
              bookingCode: b.bookingCode,
              tripId: b.trip.id,
              originCity: b.trip.originCity || 'Điểm đón',
              destinationCity: b.trip.destinationCity || 'Điểm đến',
              departureTime: b.trip.departureTime || '',
              busCompanyName: b.trip.busCompanyName || 'TravelEasy Partner',
              busType: b.trip.busType || 'LIMOUSINE',
              seats: Array.isArray(b.tickets) ? b.tickets.map((t: any) => t.seatNumber) : [],
              pickupPointName: b.pickupPointName,
              dropoffPointName: b.dropoffPointName,
              status: b.status
            }));
          setMyBookings(mapped);

          // Nếu URL chưa có tripId cụ thể, tự động chọn chuyến xe đầu tiên user đã mua
          if (!paramTripId && mapped.length > 0) {
            navigate(`/tracking/${mapped[0].tripId}`, { replace: true });
          }
        }
      })
      .catch((err) => {
        console.warn('Không thể tải vé người dùng cho GPS Tracking:', err);
      })
      .finally(() => {
        setLoadingBookings(false);
      });
  }, [paramTripId]);

  // Thông tin vé xe cụ thể của khách hàng trên chuyến đang xem (nếu có)
  const currentBooking = myBookings.find((b) => b.tripId === activeTripId);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);

  // 1. Khởi tạo bản đồ Leaflet một lần duy nhất
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.8231, 106.6297],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Fetch snapshot ban đầu & Đăng ký luồng Server-Sent Events (SSE)
  useEffect(() => {
    let eventSource: EventSource | null = null;

    // Reset markers when switching trip
    if (polylineRef.current && mapInstanceRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (busMarkerRef.current && mapInstanceRef.current) {
      busMarkerRef.current.remove();
      busMarkerRef.current = null;
    }
    if (originMarkerRef.current && mapInstanceRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destMarkerRef.current && mapInstanceRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    // Fetch snapshot
    fetch(`/api/v1/tracking/${activeTripId}/current`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          updateGpsState(res.data);
        }
      })
      .catch((err) => console.error('Lỗi tải snapshot tọa độ:', err));

    // Đăng ký SSE Stream 1 giây/lần
    try {
      eventSource = new EventSource(`/api/v1/tracking/${activeTripId}/stream`);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: TripGpsData = JSON.parse(event.data);
          updateGpsState(data);
          setIsConnected(true);
          setLastPingTime(new Date().toLocaleTimeString('vi-VN'));
        } catch (e) {
          console.warn('Lỗi parse SSE message:', e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('Không thể mở kết nối SSE:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [activeTripId]);

  // 3. Cập nhật Marker và Polyline trên bản đồ Leaflet mượt mà
  const updateGpsState = (data: TripGpsData) => {
    setTripData(data);
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLng: [number, number] = [data.latitude, data.longitude];

    // Vẽ hoặc cập nhật lộ trình (Polyline)
    if (data.routeCoordinates && data.routeCoordinates.length > 0) {
      const latLngs = data.routeCoordinates.map((c) => [c[0], c[1]] as [number, number]);

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latLngs, {
          color: '#10b981',
          weight: 6,
          opacity: 0.85
        }).addTo(map);

        // Marker điểm xuất phát
        const first = latLngs[0];
        const originHtml = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-lg border-2 border-white ring-2 ring-emerald-300">
            A
          </div>
        `;
        originMarkerRef.current = L.marker(first, {
          icon: L.divIcon({ html: originHtml, className: 'custom-pin-a', iconSize: [32, 32], iconAnchor: [16, 16] })
        }).addTo(map).bindPopup(`<b>Điểm xuất phát:</b> ${data.originCity}`);

        // Marker điểm đến
        const last = latLngs[latLngs.length - 1];
        const destHtml = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-xs shadow-lg border-2 border-white ring-2 ring-rose-300">
            B
          </div>
        `;
        destMarkerRef.current = L.marker(last, {
          icon: L.divIcon({ html: destHtml, className: 'custom-pin-b', iconSize: [32, 32], iconAnchor: [16, 16] })
        }).addTo(map).bindPopup(`<b>Điểm đến:</b> ${data.destinationCity}`);

        // Fit bounds ban đầu
        map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
      }
    }

    // Tạo hoặc cập nhật Bus Marker với góc quay theo hướng di chuyển (heading)
    const busIconHtml = `
      <div style="transform: rotate(${data.heading || 0}deg); transition: transform 0.8s ease-in-out;" class="relative flex items-center justify-center w-12 h-12">
        <div class="absolute -inset-1 bg-emerald-400 rounded-full opacity-60 animate-ping"></div>
        <div class="w-11 h-11 bg-slate-900 text-emerald-400 rounded-full flex items-center justify-center shadow-2xl border-2 border-emerald-400 text-xl font-bold">
          🚌
        </div>
        <div class="absolute -top-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></div>
      </div>
    `;

    const busIcon = L.divIcon({
      html: busIconHtml,
      className: 'live-bus-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    if (!busMarkerRef.current) {
      busMarkerRef.current = L.marker(latLng, { icon: busIcon }).addTo(map);
      busMarkerRef.current.bindPopup(`
        <div class="p-1 text-xs">
          <p class="font-bold text-emerald-700">${data.licensePlate} (${data.busCompanyName})</p>
          <p class="text-slate-600">Vận tốc: <b>${Math.round(data.speed)} km/h</b></p>
          <p class="text-slate-500">${data.currentLocationName}</p>
        </div>
      `);
    } else {
      busMarkerRef.current.setLatLng(latLng);
      busMarkerRef.current.setIcon(busIcon);
    }

    // Tự động căn tâm bản đồ theo xe nếu người dùng bật chế độ Follow
    if (autoFollowBus && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(latLng, { animate: true, duration: 0.8 });
    }
  };

  // 4. Kích hoạt xe di chuyển 1 bước (Mô phỏng Test & Demo)
  const handleSimulateStep = async () => {
    try {
      setSimulating(true);
      const res = await fetch(`/api/v1/tracking/${activeTripId}/simulate-step`, { method: 'POST' });
      const json = await res.json();
      if (json.data) {
        updateGpsState(json.data);
      }
    } catch (e) {
      console.error('Lỗi khi mô phỏng bước di chuyển:', e);
    } finally {
      setSimulating(false);
    }
  };

  // 5. Chế độ Tài xế chia sẻ GPS thực tế từ thiết bị di động
  const toggleDriverGpsShare = () => {
    if (isSharingGps) {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      setIsSharingGps(false);
      setGpsError(null);
    } else {
      if (!('geolocation' in navigator)) {
        setGpsError('Trình duyệt của bạn không hỗ trợ Geolocation API.');
        return;
      }

      setGpsError(null);
      setIsSharingGps(true);

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, speed, heading } = position.coords;
          try {
            await fetch(`/api/v1/tracking/${activeTripId}/update-location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude,
                longitude,
                speed: speed ? speed * 3.6 : 60.0,
                heading: heading || 0,
                locationName: 'Vị trí GPS thực tế từ điện thoại tài xế',
                driverPhone: tripData?.driverPhone || '0912 345 678'
              })
            });
          } catch (err) {
            console.error('Lỗi đẩy tọa độ GPS tài xế:', err);
          }
        },
        (error) => {
          console.warn('Lỗi lấy GPS thiết bị:', error.message);
          setGpsError('Không thể lấy tọa độ GPS từ thiết bị (' + error.message + '). Bạn có thể bật mô phỏng để test.');
          setIsSharingGps(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );

      geoWatchIdRef.current = watchId;
    }
  };

  // Dọn dẹp geolocation khi component unmount
  useEffect(() => {
    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-6 bg-slate-900 min-h-screen text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* BANNER TASK SPRINT 3 CHUẨN TRELLO */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-teal-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                  SPRINT 3 TASK
                </span>
                <span className="text-xs font-semibold text-emerald-200">Mã thẻ: [S306][TRACKING] • Định mức: 4 SP • Ưu tiên 2</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mt-1.5 flex items-center gap-2">
                <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
                Bản Đồ Định Vị GPS Live Tracking Xe Chạy Thời Gian Thực
              </h2>
              <p className="text-xs md:text-sm text-emerald-200 mt-1 max-w-3xl leading-relaxed">
                Tích hợp bản đồ Leaflet OpenStreetMap, truyền tọa độ siêu tốc qua Server-Sent Events (SSE 1s/lần), tự động ước tính thời gian đón (ETA) và hỗ trợ tài xế chia sẻ vị trí xe thực tế.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 self-start md:self-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow">
                P
              </div>
              <div>
                <p className="text-xs text-emerald-300">Thành viên phụ trách</p>
                <p className="text-sm font-bold text-white">Nguyễn Đại Phát (@phatnguyn146)</p>
              </div>
            </div>
          </div>
        </div>

        {/* BANNER THÔNG TIN VÉ CỦA USER NẾU USER CÓ VÉ TRÊN CHUYẾN NÀY */}
        {currentBooking && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/70 rounded-2xl p-4 md:p-5 shadow-2xl shadow-emerald-950/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950 uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    <UserCheck className="w-3.5 h-3.5" /> Vé Của Bạn Trên Chuyến Này
                  </span>
                  <span className="text-emerald-300 font-bold text-sm">
                    Mã đơn: <strong className="text-white">#{currentBooking.bookingCode}</strong>
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Trạng thái: <strong className="text-emerald-400">{currentBooking.status === 'CONFIRMED' ? 'Đã thanh toán & Giữ chỗ' : currentBooking.status}</strong>
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="bg-amber-400/10 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded font-medium">
                    Ghế ngồi của bạn: <strong className="text-amber-400 font-bold text-sm">{currentBooking.seats.join(', ') || 'Chỗ VIP'}</strong>
                  </span>
                  <span><strong>Hãng xe:</strong> {currentBooking.busCompanyName} ({currentBooking.busType})</span>
                  {currentBooking.pickupPointName && (
                    <span><strong>Điểm đón:</strong> <span className="text-emerald-300 font-medium">{currentBooking.pickupPointName}</span></span>
                  )}
                  {currentBooking.dropoffPointName && (
                    <span><strong>Điểm trả:</strong> <span className="text-emerald-300 font-medium">{currentBooking.dropoffPointName}</span></span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => navigate(`/tickets/${currentBooking.bookingCode}`)}
                className="w-full md:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950"
              >
                <QrCode className="w-4 h-4" /> Mở Vé QR Lên Xe
              </button>
            </div>
          </div>
        )}

        {/* THANH ĐIỀU KHIỂN & CHỌN CHUYẾN XE */}
        <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/70 flex flex-col gap-3 shadow-md">
          {/* PHẦN 1: VÉ CỦA BẠN (TỰ ĐỘNG ĐỒNG BỘ TỪ TÀI KHOẢN NGƯỜI DÙNG) */}
          {myBookings.length > 0 ? (
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-700/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-emerald-400" /> Vé xe bạn đã mua ({myBookings.length} chuyến):
                </label>
                <span className="text-[11px] text-slate-400">Tự động đồng bộ từ tài khoản của bạn</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {myBookings.map((b) => {
                  const isSelected = activeTripId === b.tripId;
                  return (
                    <button
                      key={b.bookingId}
                      onClick={() => navigate(`/tracking/${b.tripId}`)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-300 shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400'
                          : 'bg-slate-900/90 text-emerald-300 border-emerald-700/60 hover:bg-slate-800 hover:border-emerald-500'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-emerald-400'}`}></span>
                      <span>#{b.bookingCode}: {b.originCity} ➔ {b.destinationCity}</span>
                      <span className="bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded text-[11px] border border-emerald-600/60">
                        Ghế: {b.seats.join(', ') || 'VIP'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs bg-slate-900/70 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-slate-500" />
                Bạn chưa có vé xe nào đang chạy trên tài khoản.
              </span>
              <div className="flex items-center gap-2">
                <Link to="/my-tickets" className="text-emerald-400 font-bold hover:underline">
                  Vé của tôi
                </Link>
                <span className="text-slate-600">•</span>
                <Link to="/search" className="text-sky-400 font-bold hover:underline">
                  Đặt vé chuyến mới
                </Link>
              </div>
            </div>
          )}

          {/* PHẦN 2: CHUYẾN XE TOÀN QUỐC & TRẠNG THÁI STREAM */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-slate-400" /> Tuyến xe toàn quốc:
              </label>
              <div className="flex items-center gap-2">
                {DEMO_TRIPS.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => navigate(`/tracking/${trip.id}`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTripId === trip.id
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-900/50 ring-2 ring-teal-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    #{trip.id} - {trip.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Trạng thái kết nối SSE Stream */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="relative flex h-2.5 w-2.5">
                  {isConnected ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  )}
                </span>
                <span className={`font-semibold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConnected ? 'SSE Live Stream 1s' : 'Đang kết nối lại...'}
                </span>
                {lastPingTime && <span className="text-slate-500">({lastPingTime})</span>}
              </div>

              <button
                onClick={() => setAutoFollowBus(!autoFollowBus)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                  autoFollowBus
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                    : 'bg-slate-700 text-slate-400 border-slate-600'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                {autoFollowBus ? 'Bám theo xe: BẬT' : 'Bám theo xe: TẮT'}
              </button>
            </div>
          </div>
        </div>

        {/* CÁC THẺ KPI TỔNG QUAN HÀNH TRÌNH */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Thời gian đến điểm đón (ETA)</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ~{tripData?.etaMinutes ?? 18} <span className="text-sm font-normal text-slate-400">phút</span>
            </div>
            <div className="mt-2 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(5, tripData?.progressPercent || 35))}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Đã hoàn thành {tripData?.progressPercent ?? 35}% hành trình</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Tốc độ hiện tại</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400">
              {Math.round(tripData?.speed ?? 65)} <span className="text-sm font-normal text-slate-400">km/h</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Đúng tốc độ quy định cao tốc
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Trạm dừng chân kế tiếp</span>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base font-bold text-slate-100 truncate mt-1">
              {tripData?.nextStationName || 'Trạm Dầu Giây (Km 52)'}
            </div>
            <p className="text-[11px] text-amber-300 mt-2 font-medium">
              Cách vị trí hiện tại: <b>{tripData?.nextStationDistanceKm ?? 15.2} km</b>
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Biển số & Loại xe</span>
              <Bus className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg font-black text-purple-300 mt-0.5">
              {tripData?.licensePlate || '51B-889.99'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {tripData?.busType || 'Limousine 34 Phòng VIP'}
            </p>
          </div>
        </div>

        {/* VÙNG BẢN ĐỒ LEAFLET CHÍNH & PANEL BÊN CẠNH */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* KHUNG BẢN ĐỒ TƯƠNG TÁC LEAFLET */}
          <div className="lg:col-span-3 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative flex flex-col">
            <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-200">
                  {tripData?.originCity || 'TP. Hồ Chí Minh'} ➔ {tripData?.destinationCity || 'Đà Lạt'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Vị trí: {tripData?.currentLocationName || 'Đang cập nhật...'}</span>
              </div>
              <div className="text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>OpenStreetMap Vector Engine</span>
              </div>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-[520px] bg-slate-950 z-0 relative"
              style={{ minHeight: '480px' }}
            />

            <div className="p-3 bg-slate-850 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Vị trí xe: [{tripData?.latitude ? tripData.latitude.toFixed(4) : '10.8231'}, {tripData?.longitude ? tripData.longitude.toFixed(4) : '106.6297'}] • Hướng di chuyển: {Math.round(tripData?.heading || 0)}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép đường dẫn theo dõi GPS! Bạn có thể gửi cho người thân để cùng theo dõi xe.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  Chia sẻ hành trình cho người thân
                </button>
              </div>
            </div>
          </div>

          {/* CỘT BÊN PHẢI: THÔNG TIN TỔ LÁI, HƯỚNG DẪN ĐÓN XE & HỖ TRỢ KHÁCH HÀNG */}
          <div className="space-y-4">
            {/* Thẻ Tài xế & Kiểm định an toàn */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 shadow-lg space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Tổ Lái & Kiểm Tra An Toàn
              </h3>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {tripData?.driverName ? tripData.driverName.charAt(0) : 'T'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    {tripData?.driverName || 'Nguyễn Văn Hùng (Tài chính)'}
                  </h4>
                  <p className="text-xs text-slate-400">{tripData?.driverLicense || 'GPLX Hạng E (079090012345)'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Số điện thoại tài xế:</span>
                  <a
                    href={`tel:${tripData?.driverPhone || '0912345678'}`}
                    className="font-bold text-emerald-400 hover:underline flex items-center gap-1.5 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/30"
                  >
                    <Phone className="w-3.5 h-3.5" /> {tripData?.driverPhone || '0912 345 678'}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Đơn vị vận hành:</span>
                  <span className="font-semibold text-slate-200">{tripData?.busCompanyName || 'TravelEasy Partner'}</span>
                </div>

                <div className="mt-2 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-300 text-xs">Kiểm tra nồng độ cồn: ĐẠT CHUẨN</p>
                    <p className="text-[10px] text-emerald-400/80">0.00 mg/L khí thở trước khi xuất bến</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HƯỚNG DẪN ĐÓN XE & LƯU Ý DÀNH CHO HÀNH KHÁCH */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 shadow-lg space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" /> Hướng Dẫn Đón Xe Tại Trạm
              </h3>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Thời gian có mặt:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">Quý khách vui lòng có mặt tại điểm đón trước <strong>15 - 30 phút</strong> so với giờ xe dự kiến đến.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60">
                  <Ticket className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Chuẩn bị vé lên xe:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">Mở sẵn mã vé điện tử QR trên điện thoại hoặc tin nhắn SMS để phụ xe quét khi lên xe.</p>
                  </div>
                </div>
              </div>

              {/* Nút Gọi Tổng Đài Trợ Giúp */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tổng đài hỗ trợ 24/7:</span>
                <a
                  href="tel:19006868"
                  className="font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> 1900 6868
                </a>
              </div>
            </div>

            {/* CAM KẾT CHẤT LƯỢNG TRAVEL EASY */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 p-3.5 rounded-xl border border-indigo-500/30 text-xs space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Cam Kết Hành Trình An Toàn
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Xe lắp thiết bị định vị GPS đạt chuẩn QCVN 31:2014/BGTVT. Vận tốc và lộ trình được hệ thống TravelEasy giám sát tự động 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
