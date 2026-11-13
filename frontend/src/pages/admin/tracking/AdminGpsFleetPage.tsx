/**
 * @file AdminGpsFleetPage.tsx
 * @description Trung Tâm Giám Sát Định Vị Đội Xe Toàn Quốc (Admin Fleet Telematics Radar)
 * @author Nguyễn Đại Phát (phatnguyn146) & Team
 * @role Phân hệ Quản Trị Sàn TravelEasy (Platform Operations)
 */
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radio,
  Navigation,
  Gauge,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Bus,
  Search,
  Filter,
  Layers,
  Building2,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface FleetVehicle {
  tripId: number;
  licensePlate: string;
  companyName: string;
  route: string;
  driverName: string;
  driverPhone: string;
  speed: number;
  latitude: number;
  longitude: number;
  heading: number;
  status: 'RUNNING' | 'STOPPED' | 'OVERSPEED';
  alcoholTested: boolean;
  etaMinutes: number;
  lastPing: string;
}

export const AdminGpsFleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    {
      tripId: 656,
      licensePlate: '51B-889.99',
      companyName: 'Cúc Tùng Limousine',
      route: 'TP. Hồ Chí Minh ➔ Đà Lạt',
      driverName: 'Nguyễn Văn Hùng',
      driverPhone: '0912 345 678',
      speed: 68,
      latitude: 11.2065,
      longitude: 107.3512,
      heading: 45,
      status: 'RUNNING',
      alcoholTested: true,
      etaMinutes: 140,
      lastPing: 'Vừa xong'
    },
    {
      tripId: 706,
      licensePlate: '29B-888.66',
      companyName: 'Sao Việt',
      route: 'Hà Nội ➔ Sa Pa',
      driverName: 'Trần Đình Trọng',
      driverPhone: '0988 777 666',
      speed: 74,
      latitude: 21.6512,
      longitude: 104.8812,
      heading: 320,
      status: 'RUNNING',
      alcoholTested: true,
      etaMinutes: 95,
      lastPing: '1 giây trước'
    },
    {
      tripId: 724,
      licensePlate: '29B-999.88',
      companyName: 'Sao Việt',
      route: 'Sa Pa ➔ Hà Nội',
      driverName: 'Lê Hoàng Nam',
      driverPhone: '0903 111 222',
      speed: 84,
      latitude: 22.0125,
      longitude: 104.5123,
      heading: 140,
      status: 'OVERSPEED',
      alcoholTested: true,
      etaMinutes: 180,
      lastPing: 'Vừa xong'
    },
    {
      tripId: 657,
      licensePlate: '51B-777.33',
      companyName: 'Cúc Tùng Limousine',
      route: 'TP. Hồ Chí Minh ➔ Nha Trang',
      driverName: 'Phạm Quốc Bảo',
      driverPhone: '0934 555 888',
      speed: 0,
      latitude: 10.9571,
      longitude: 107.1654,
      heading: 0,
      status: 'STOPPED',
      alcoholTested: true,
      etaMinutes: 210,
      lastPing: '2 phút trước (Trạm Dầu Giây)'
    }
  ]);

  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(vehicles[0]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Khởi tạo bản đồ bao quát Việt Nam
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.0471, 107.5412], // Trung tâm Việt Nam
        zoom: 6,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Vẽ marker các xe trên toàn sàn
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    markersGroupRef.current.clearLayers();

    filteredVehicles.forEach((v) => {
      const color = v.status === 'OVERSPEED' ? '#ef4444' : v.status === 'RUNNING' ? '#10b981' : '#f59e0b';
      const isSelected = selectedVehicle?.tripId === v.tripId;

      const icon = L.divIcon({
        className: 'fleet-marker',
        html: `
          <div style="background: ${color}; border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px ${color}80; color: white; font-size: 16px;">
            🚌
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([v.latitude, v.longitude], { icon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <strong>${v.licensePlate}</strong> (${v.companyName})<br/>
            Tuyến: ${v.route}<br/>
            Tốc độ: <strong>${v.speed} km/h</strong><br/>
            Tài xế: ${v.driverName} (${v.driverPhone})
          </div>
        `)
        .on('click', () => setSelectedVehicle(v));

      markersGroupRef.current?.addLayer(marker);
    });
  }, [vehicles, selectedCompany, selectedStatus, searchKeyword, selectedVehicle]);

  // Bộ lọc
  const filteredVehicles = vehicles.filter((v) => {
    const matchCompany = selectedCompany === 'ALL' || v.companyName === selectedCompany;
    const matchStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    const matchSearch =
      searchKeyword === '' ||
      v.licensePlate.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      v.route.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchCompany && matchStatus && matchSearch;
  });

  const runningCount = vehicles.filter((v) => v.status === 'RUNNING').length;
  const overspeedCount = vehicles.filter((v) => v.status === 'OVERSPEED').length;
  const stoppedCount = vehicles.filter((v) => v.status === 'STOPPED').length;

  return (
    <div className="p-4 md:p-6 bg-slate-900 min-h-screen text-slate-100 font-sans space-y-5">
      {/* HEADER QUẢN TRỊ VIÊN */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ADMIN FLEET RADAR
            </span>
            <span className="text-xs text-indigo-300 font-semibold">Giám Sát Định Vị Đội Xe Toàn Quốc (QCVN 31:2014/BGTVT)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-indigo-400" /> Trung Tâm Điều Hành & Giám Sát GPS Xe Toàn Sàn
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Theo dõi vị trí, tốc độ, trạng thái an toàn của tất cả các phương tiện đang hoạt động trên hệ thống TravelEasy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Mô phỏng reload dữ liệu live
              setVehicles((prev) =>
                prev.map((v) => ({
                  ...v,
                  speed: v.status === 'STOPPED' ? 0 : Math.floor(50 + Math.random() * 35),
                  lastPing: 'Vừa xong'
                }))
              );
            }}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Quét Tín Hiệu Radar Mới
          </button>
        </div>
      </div>

      {/* KPI METRICS RADAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Bus className="w-4 h-4 text-emerald-400" /> Tổng số xe hoạt động
          </span>
          <p className="text-2xl md:text-3xl font-black text-white mt-1">{vehicles.length}</p>
          <span className="text-[11px] text-emerald-400 font-semibold">100% gắn thiết bị giám sát hành trình</span>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Gauge className="w-4 h-4 text-sky-400" /> Xe đang lăn bánh
          </span>
          <p className="text-2xl md:text-3xl font-black text-sky-400 mt-1">{runningCount}</p>
          <span className="text-[11px] text-slate-400">Đang lưu thông trên cao tốc & QL</span>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Cảnh báo vượt tốc độ
          </span>
          <p className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{overspeedCount}</p>
          <span className="text-[11px] text-rose-300 font-semibold">{overspeedCount > 0 ? 'Cần cảnh báo tài xế (>80km/h)' : 'Không có vi phạm'}</span>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-amber-400" /> Xe tạm dừng / Nghỉ trạm
          </span>
          <p className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{stoppedCount}</p>
          <span className="text-[11px] text-slate-400">Dừng đón trả hoặc nghỉ trạm dừng chân</span>
        </div>
      </div>

      {/* THANH BỘ LỌC TÌM KIẾM */}
      <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm biển số, tuyến, tài xế..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
            />
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Tất cả nhà xe đối tác</option>
            <option value="Cúc Tùng Limousine">Cúc Tùng Limousine</option>
            <option value="Sao Việt">Sao Việt</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="RUNNING">Đang chạy</option>
            <option value="OVERSPEED">Cảnh báo tốc độ</option>
            <option value="STOPPED">Dừng đỗ</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Hiển thị: <strong className="text-white">{filteredVehicles.length}</strong> / {vehicles.length} xe
        </div>
      </div>

      {/* BẢN ĐỒ RADAR TOÀN CẢNH & THÔNG TIN XE ĐANG CHỌN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-slate-800/90 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Bản đồ radar trực tiếp toàn quốc
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Đang chạy</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Quá tốc độ</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Dừng đỗ</span>
            </div>
          </div>
          <div ref={mapContainerRef} className="w-full h-96 rounded-xl overflow-hidden border border-slate-700" />
        </div>

        {/* THẺ CHI TIẾT PHƯƠNG TIỆN ĐANG CHỌN */}
        <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-indigo-400" /> Thông Tin Phương Tiện Chi Tiết
          </h3>

          {selectedVehicle ? (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white">{selectedVehicle.licensePlate}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    selectedVehicle.status === 'OVERSPEED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      : selectedVehicle.status === 'RUNNING'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}>
                    {selectedVehicle.status === 'OVERSPEED' ? 'VƯỢT TỐC ĐỘ' : selectedVehicle.status === 'RUNNING' ? 'ĐANG CHẠY' : 'DỪNG ĐỖ'}
                  </span>
                </div>
                <p className="text-slate-300 font-medium mt-1">{selectedVehicle.companyName}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Tuyến: {selectedVehicle.route}</p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vận tốc hiện tại:</span>
                  <span className="font-bold text-white text-sm">{selectedVehicle.speed} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tài xế phụ trách:</span>
                  <span className="font-semibold text-slate-200">{selectedVehicle.driverName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <a href={`tel:${selectedVehicle.driverPhone}`} className="font-bold text-emerald-400 hover:underline">
                    {selectedVehicle.driverPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kiểm tra nồng độ cồn:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 0.00 mg/L (Hợp lệ)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tọa độ GPS:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    [{selectedVehicle.latitude.toFixed(4)}, {selectedVehicle.longitude.toFixed(4)}]
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cập nhật lần cuối:</span>
                  <span className="text-slate-300">{selectedVehicle.lastPing}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([selectedVehicle.latitude, selectedVehicle.longitude], 13);
                  }
                }}
                className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <Eye className="w-3.5 h-3.5" /> Định Vị Tâm Bản Đồ Vào Xe Này
              </button>
            </div>
          ) : (
            <p className="text-slate-400 text-xs">Vui lòng chọn 1 phương tiện trên bản đồ hoặc bảng danh sách bên dưới.</p>
          )}
        </div>
      </div>

      {/* BẢNG DANH SÁCH CHI TIẾT CÁC PHƯƠNG TIỆN */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-4">
          <Bus className="w-4 h-4 text-indigo-400" /> Bảng Thống Kê & Giám Sát Chi Tiết Toàn Đội Xe
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/60">
                <th className="p-3">Biển Số Xe</th>
                <th className="p-3">Đối Tác Nhà Xe</th>
                <th className="p-3">Tuyến Đường Vận Hành</th>
                <th className="p-3">Tài Xế Buồng Lái</th>
                <th className="p-3">Vận Tốc</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">An Toàn Sức Khỏe</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr
                  key={v.tripId}
                  className={`border-b border-slate-700/60 hover:bg-slate-700/40 transition-colors ${
                    selectedVehicle?.tripId === v.tripId ? 'bg-indigo-950/40' : ''
                  }`}
                >
                  <td className="p-3 font-bold text-white">{v.licensePlate}</td>
                  <td className="p-3 text-slate-300">{v.companyName}</td>
                  <td className="p-3 text-slate-300 font-medium">{v.route}</td>
                  <td className="p-3 text-slate-300">{v.driverName}</td>
                  <td className="p-3">
                    <span className={`font-bold ${v.speed > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {v.speed} km/h
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      v.status === 'OVERSPEED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : v.status === 'RUNNING'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {v.status === 'OVERSPEED' ? 'Quá tốc độ' : v.status === 'RUNNING' ? 'Đang chạy' : 'Dừng đỗ'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 0.00 mg/L
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedVehicle(v);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([v.latitude, v.longitude], 12);
                        }
                      }}
                      className="px-2.5 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      Theo dõi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminGpsFleetPage;
