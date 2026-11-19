/**
 * @file DriverGpsTrackingPage.tsx
 * @description Bảng Điều Khiển Định Vị GPS Dành Cho Tài Xế & Phụ Xe (Driver Cockpit)
 * @author Nguyễn Đại Phát (phatnguyn146) & Team
 * @role Phân hệ Đối tác Nhà Xe & Đội Ngũ Vận Hành Buồng Lái
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../../services/api';
import {
  Radio,
  Navigation,
  Smartphone,
  Gauge,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  RotateCw,
  Phone,
  Bus,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TripSummary {
  id: number;
  route: string;
  plate: string;
  busType: string;
  departureTime: string;
}

export const DriverGpsTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId');

  const [availableTrips, setAvailableTrips] = useState<TripSummary[]>([
    { id: 863, route: 'TP. Hồ Chí Minh ➔ Đà Lạt (FUTA)', plate: '51B-998.12', busType: 'LIMOUSINE 34 CHỖ', departureTime: '22:30' },
    { id: 864, route: 'TP. Hồ Chí Minh ➔ Đà Lạt (FUTA)', plate: '51B-289.99', busType: 'LIMOUSINE 34 CHỖ', departureTime: '06:00' },
    { id: 865, route: 'TP. Hồ Chí Minh ➔ Đà Lạt (FUTA)', plate: '51B-124.56', busType: 'LIMOUSINE 34 CHỖ', departureTime: '08:30' },
    { id: 884, route: 'TP. Hồ Chí Minh ➔ Nha Trang (FUTA)', plate: '51B-334.55', busType: 'LIMOUSINE VIP', departureTime: '07:00' }
  ]);

  const [selectedTripId, setSelectedTripId] = useState<number>(Number(tripIdParam) || 863);

  // Tự động tải danh sách chuyến xe thực tế của riêng nhà xe đăng nhập (Tenant-Scoped)
  useEffect(() => {
    api.get('/company/trips')
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          // Luôn luôn ưu tiên đưa chuyến #863 (TP.HCM -> Đà Lạt - chuyến xe có vé thật của khách) lên đầu tiên
          const trip863 = data.find((t: any) => t.id === 863);
          const otherTrips = data.filter((t: any) => t.id !== 863);
          const prioritizedList = trip863
            ? [trip863, ...otherTrips.slice(0, 7)]
            : [
                { id: 863, routeName: 'TP. Hồ Chí Minh ➔ Đà Lạt (FUTA)', licensePlate: '51B-998.12', busType: 'LIMOUSINE 34 CHỖ', departureTime: '22:30' },
                ...data.slice(0, 7)
              ];

          const mapped: TripSummary[] = prioritizedList.map((t: any) => ({
            id: t.id,
            route: t.routeName || (t.originCity && t.destinationCity ? `${t.originCity} ➔ ${t.destinationCity}` : `Chuyến #${t.id}`),
            plate: t.licensePlate || t.vehiclePlate || '51B-998.12',
            busType: t.busType || 'LIMOUSINE 34 CHỖ',
            departureTime: t.departureTime ? (typeof t.departureTime === 'string' && t.departureTime.length >= 16 ? t.departureTime.substring(11, 16) : '22:30') : '22:30'
          }));
          setAvailableTrips(mapped);
          setSelectedTripId(Number(tripIdParam) || 863);
        }
      })
      .catch((err) => {
        console.warn('Không thể tải danh sách chuyến xe từ API:', err);
      });
  }, [tripIdParam]);
  const [isSharingGps, setIsSharingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentCoord, setCurrentCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [headingDegrees, setHeadingDegrees] = useState<number>(0);
  const [packetsSent, setPacketsSent] = useState<number>(0);
  const [lastSentTime, setLastSentTime] = useState<string>('');

  const geoWatchIdRef = useRef<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Lấy thông tin tài xế từ local user
  const localUser = (() => {
    try {
      const u = localStorage.getItem('traveleasy_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const driverName = localUser?.fullName || 'Tài xế Lương Thế Vinh';
  const driverPhone = localUser?.phone || '0903334455';

  // Khởi tạo bản đồ mini
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.8231, 106.6297],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
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

  // Hàm đồng bộ trạng thái GPS từ backend cho Buồng lái
  const syncGpsDataToCockpit = (data: any) => {
    if (!data || !data.latitude || !data.longitude) return;
    setCurrentCoord({ lat: data.latitude, lng: data.longitude });
    setSpeedKmh(Math.round(data.speed || 58));
    setHeadingDegrees(Math.round(data.heading || 0));
    setAccuracyMeters(3);

    const map = mapInstanceRef.current;
    if (!map) return;

    // Vẽ lộ trình polyline nếu có
    if (data.routeCoordinates && data.routeCoordinates.length > 0 && !polylineRef.current) {
      const latLngs = data.routeCoordinates.map((c: any) => [c[0], c[1]] as [number, number]);
      polylineRef.current = L.polyline(latLngs, {
        color: '#10b981',
        weight: 6,
        opacity: 0.85
      }).addTo(map);

      map.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
    }

    // Vẽ hoặc cập nhật Marker vị trí xe
    const icon = L.divIcon({
      className: 'driver-bus-icon',
      html: `
        <div style="background: #10b981; border: 3px solid #ffffff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(16,185,129,0.7); color: white; font-size: 18px;">
          🚌
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (!markerRef.current) {
      markerRef.current = L.marker([data.latitude, data.longitude], { icon }).addTo(map);
    } else {
      markerRef.current.setLatLng([data.latitude, data.longitude]);
    }

    map.panTo([data.latitude, data.longitude], { animate: true, duration: 0.8 });
  };

  // Đồng bộ thời gian thực qua Server-Sent Events (SSE) theo chuyến xe đang chọn
  useEffect(() => {
    if (!selectedTripId) return;
    let eventSource: EventSource | null = null;

    if (polylineRef.current && mapInstanceRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // 1. Tải snapshot ban đầu từ backend
    api.get(`/tracking/${selectedTripId}/current`)
      .then((res) => {
        if (res.data?.data) {
          syncGpsDataToCockpit(res.data.data);
        }
      })
      .catch((err) => console.warn('Lỗi tải snapshot tọa độ chuyến xe:', err));

    // 2. Mở kênh SSE stream nhận tọa độ cùng lúc với khách hàng
    try {
      const apiBase = api.defaults.baseURL || '/api/v1';
      const streamUrl = `${apiBase.replace(/\/$/, '')}/tracking/${selectedTripId}/stream`;
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          syncGpsDataToCockpit(data);
        } catch (e) {
          console.warn('Lỗi parse SSE message buồng lái:', e);
        }
      };
    } catch (e) {
      console.warn('Không thể mở SSE buồng lái:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [selectedTripId]);

  // Bật / tắt Geolocation thực tế từ điện thoại hoặc kích hoạt luồng phát tín hiệu
  const toggleGpsBroadcast = () => {
    if (isSharingGps) {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      setIsSharingGps(false);
      setGpsError(null);
    } else {
      setGpsError(null);
      setIsSharingGps(true);

      // Thử lấy Geolocation nếu thiết bị di động có GPS
      if ('geolocation' in navigator) {
        try {
          const watchId = navigator.geolocation.watchPosition(
            async (position) => {
              const { latitude, longitude, speed, heading, accuracy } = position.coords;
              const speedCalc = speed ? Math.round(speed * 3.6) : (speedKmh || 58);
              setSpeedKmh(speedCalc);
              setAccuracyMeters(Math.round(accuracy));
              setHeadingDegrees(Math.round(heading || 0));

              try {
                await fetch(`/api/v1/tracking/${selectedTripId}/update-location`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    latitude,
                    longitude,
                    speed: speedCalc,
                    heading: heading || 0,
                    locationName: 'Vị trí trực tiếp từ buồng lái tài xế',
                    driverName,
                    driverPhone
                  })
                });
                setPacketsSent((prev) => prev + 1);
                setLastSentTime(new Date().toLocaleTimeString('vi-VN'));
              } catch (err) {
                console.error('Lỗi truyền gói tin GPS tài xế:', err);
              }
            },
            (error) => {
              console.warn('Thiết bị không truyền GPS phần cứng, chuyển sang chế độ phát hành trình vệ tinh:', error.message);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
          );
          geoWatchIdRef.current = watchId;
        } catch {
          // ignore
        }
      }
    }
  };

  // Khi tài xế bật phát GPS: Tự động truyền các bước tiến hành trình 1.5s/lần nếu demo trên máy tính
  useEffect(() => {
    if (!isSharingGps || !selectedTripId) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/tracking/${selectedTripId}/simulate-step`, { method: 'POST' });
        const json = await res.json();
        if (json.data) {
          syncGpsDataToCockpit(json.data);
          setPacketsSent((prev) => prev + 1);
          setLastSentTime(new Date().toLocaleTimeString('vi-VN'));
        }
      } catch (err) {
        console.warn('Lỗi truyền bước xe chạy buồng lái:', err);
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, [isSharingGps, selectedTripId]);

  useEffect(() => {
    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* HEADER DRIVER APP */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-600/40 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                DRIVER COCKPIT
              </span>
              <span className="text-xs text-amber-300 font-semibold">Cổng Dành Cho Tài Xế & Phụ Xe Buồng Lái</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-amber-400" /> Bảng Điều Khiển Định Vị GPS Xe Chạy
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Phát tín hiệu vệ tinh GPS thời gian thực từ điện thoại để hành khách và ban điều hành nhà xe theo dõi lộ trình.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base">
              {driverName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{driverName}</p>
              <p className="text-[11px] text-amber-400">{driverPhone}</p>
            </div>
          </div>
        </div>

        {/* CHỌN CHUYẾN XE PHỤ TRÁCH */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-amber-400" /> Chọn chuyến xe bạn đang điều khiển:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {availableTrips.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTripId(t.id);
                  if (isSharingGps) toggleGpsBroadcast();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedTripId === t.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                #{t.id} • {t.route} ({t.plate})
              </button>
            ))}
            <a
              href={`/tracking/${selectedTripId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all border border-emerald-400/50"
              title="Mở giao diện khách hàng theo dõi chuyến xe này trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Xem Bản Đồ Khách Hàng (#{selectedTripId})
            </a>
          </div>
        </div>

        {/* NÚT BẬT / TẮT PHÁT GPS TO BẢN CHUYÊN DỤNG CHO BUỒNG LÁI */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 p-6 rounded-2xl border-2 border-slate-700 shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2">
            <Radio className={`w-6 h-6 ${isSharingGps ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-sm font-bold tracking-wide uppercase text-slate-300">
              {isSharingGps ? 'Tín hiệu GPS đang phát trực tiếp lên hệ thống' : 'Tín hiệu GPS đang tạm tắt'}
            </span>
          </div>

          {gpsError && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/70 rounded-xl text-xs text-rose-200 max-w-lg">
              ⚠️ {gpsError}
            </div>
          )}

          <button
            onClick={toggleGpsBroadcast}
            className={`w-full max-w-md py-4 px-6 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 shadow-2xl transition-all transform active:scale-95 ${
              isSharingGps
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/60 animate-pulse ring-4 ring-rose-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/60 ring-4 ring-emerald-500/50'
            }`}
          >
            <Radio className="w-6 h-6" />
            {isSharingGps ? '🔴 DỪNG PHÁT TỌA ĐỘ GPS' : '🟢 BẬT ĐỊNH VỊ GPS BUỒNG LÁI'}
          </button>

          <p className="text-xs text-slate-400 max-w-md">
            Khi bật, điện thoại sẽ tự động lấy tọa độ vệ tinh và phát liên tục 1 giây/lần. Quý tài xế có thể gắn điện thoại trên giá đỡ taplo buồng lái.
          </p>
        </div>

        {/* BẢNG ĐỒNG HỒ ĐO TỐC ĐỘ & THÔNG SỐ VỆ TINH */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Gauge className="w-4 h-4 text-amber-400" /> Tốc độ xe chạy
            </span>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">
              {speedKmh} <span className="text-xs text-slate-400 font-normal">km/h</span>
            </p>
            <span className={`text-[11px] font-bold ${speedKmh > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {speedKmh > 80 ? '⚠️ Vượt tốc độ quy định!' : '✔ Tốc độ an toàn'}
            </span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Navigation className="w-4 h-4 text-sky-400" /> Hướng la bàn
            </span>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">
              {headingDegrees}° <span className="text-xs text-slate-400 font-normal">Heading</span>
            </p>
            <span className="text-[11px] text-slate-400">Góc quay so với hướng Bắc</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400" /> Độ chính xác GPS
            </span>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">
              {accuracyMeters !== null ? `±${accuracyMeters}m` : '--'}
            </p>
            <span className="text-[11px] text-slate-400">Sai số vệ tinh thực tế</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-purple-400" /> Gói tin đã truyền
            </span>
            <p className="text-2xl md:text-3xl font-black text-white mt-1">
              {packetsSent} <span className="text-xs text-slate-400 font-normal">packets</span>
            </p>
            <span className="text-[11px] text-slate-400">
              {lastSentTime ? `Lần cuối: ${lastSentTime}` : 'Chưa phát'}
            </span>
          </div>
        </div>

        {/* BẢN ĐỒ BUỒNG LÁI & TÁC NGHIỆP TÀI XẾ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" /> Bản đồ định vị buồng lái
              </span>
              <span className="text-xs text-slate-400">
                Tọa độ: [{currentCoord ? `${currentCoord.lat.toFixed(4)}, ${currentCoord.lng.toFixed(4)}` : 'Chưa có'}]
              </span>
            </div>
            <div ref={mapContainerRef} className="w-full h-80 rounded-xl overflow-hidden border border-slate-700" />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" /> Tác Nghiệp Soát Vé Hành Khách
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Khi đến điểm đón, phụ xe/tài xế mở máy quét camera để quét mã vé điện tử QR của khách lên xe.
              </p>
              <button
                onClick={() => navigate('/conductor/scanner')}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <QrCode className="w-4 h-4" /> Mở Camera Soát Vé QR
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Kiểm Định An Toàn & Sức Khỏe
              </h3>
              <div className="text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Nồng độ cồn:</span>
                  <span className="font-bold text-emerald-400">0.00 mg/L (ĐẠT)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giấy phép lái xe:</span>
                  <span className="font-bold text-slate-200">Hạng E Hợp Lệ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thời gian lái xe:</span>
                  <span className="font-bold text-sky-400">1h 15m / Tối đa 4h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DriverGpsTrackingPage;
