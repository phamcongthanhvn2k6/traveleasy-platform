/**
 * @file QrTicketScannerPage.tsx
 * @description [S320] WebApp Quét QR Soát Vé & Điểm Danh Hành Khách Lên Xe (/conductor/scanner)
 * @author Đoàn Nhật Cường (CuongLiam)
 * @role Frontline Operations & Conductor Management
 */
import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Ticket,
  User,
  Users,
  Smartphone,
  Radio,
  Wifi,
  WifiOff,
  Keyboard,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import {
  ConductorScannerService,
  ConductorSeatManifestResponse,
  ValidateTicketResponse
} from './ConductorScannerService';

export const QrTicketScannerPage: React.FC = () => {
  const [currentTripId, setCurrentTripId] = useState<number>(696);
  const [manifest, setManifest] = useState<ConductorSeatManifestResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'scanner' | 'manifest'>('scanner');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Nhập mã thủ công 6 ký tự
  const [manualCode, setManualCode] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Kết quả quét vé
  const [scanResult, setScanResult] = useState<ValidateTicketResponse | null>({
    valid: true,
    checkInStatus: 'CHECKED_IN',
    validationColor: 'GREEN',
    ticketCode: 'TK-20261110-CT03-01',
    seatNumber: 'A05',
    passengerName: 'Nguyễn Văn Du Khách',
    passengerPhone: '0901234567',
    tripId: 696,
    tripRoute: 'TP. Hồ Chí Minh ➔ Đà Lạt',
    message: 'Vé hợp lệ! Khách đã được xác nhận lên xe.'
  });

  // Âm thanh thông báo Audio Synth (Web Audio API)
  const playFeedbackSound = (type: 'GREEN' | 'RED' | 'YELLOW') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'GREEN') {
        // Âm bíp đôi cao vút thành công
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174.66, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'YELLOW') {
        // Âm cảnh báo 2 nhịp trầm
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Âm buzzer còi lỗi kéo dài
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  };

  const loadManifest = async (tripId: number) => {
    try {
      setLoading(true);
      const data = await ConductorScannerService.getTripManifest(tripId);
      setManifest(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể tải sơ đồ ghế chuyến xe. Đang dùng bộ nhớ cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManifest(currentTripId);

    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentTripId]);

  const handleValidateCode = async (codeToTest: string) => {
    const code = codeToTest.trim();
    if (!code) return;

    try {
      setProcessing(true);
      const result = await ConductorScannerService.validateTicket(code, currentTripId);
      setScanResult(result);
      playFeedbackSound(result.validationColor);

      if (result.valid) {
        toast.success(result.message, 'Vé Hợp Lệ');
        // Tải lại sơ đồ ghế cập nhật số đếm
        loadManifest(currentTripId);
      } else if (result.validationColor === 'YELLOW') {
        toast.warning(result.message, 'Vé Sai Chuyến/Sai Ngày');
      } else {
        toast.error(result.message, 'Vé Không Hợp Lệ / Trùng Lặp');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi quét vé';
      setScanResult({
        valid: false,
        checkInStatus: 'NOT_FOUND',
        validationColor: 'RED',
        ticketCode: code,
        seatNumber: '--',
        message: msg
      });
      playFeedbackSound('RED');
      toast.error(msg);
    } finally {
      setProcessing(false);
      setManualCode('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleValidateCode(manualCode);
    }
  };

  // Mock quét camera tự động khi bấm vào ô scanner
  const handleSimulateCameraScan = () => {
    const mockList = ['TK-696-A01', 'TK-696-A02', 'TK-696-B01', 'TK-999-Z01', 'QR-CT-A01'];
    const randomPick = mockList[Math.floor(Math.random() * mockList.length)];
    handleValidateCode(randomPick);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-lg mx-auto flex flex-col justify-between select-none">
      {/* Top Header & Trạng Thái Mạng */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
            <Smartphone className="w-3.5 h-3.5" /> WebApp Soát Vé Di Động
          </div>

          <div className="flex items-center gap-2">
            {isOfflineMode ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
                <WifiOff className="w-3 h-3" /> Mất sóng (Offline Mode)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <Wifi className="w-3 h-3" /> 4G Đã Sẵn Sàng
              </span>
            )}
            <button
              onClick={() => loadManifest(currentTripId)}
              className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700"
              title="Đồng bộ danh sách vé"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Thông tin chuyến xe */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">Chuyến #{currentTripId}</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-mono">
                {manifest?.licensePlate || '51B-888.88'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{manifest?.route || 'TP. Hồ Chí Minh ➔ Đà Lạt'}</p>
          </div>

          {/* Bộ đếm lên xe */}
          <div className="text-right">
            <div className="text-xs text-slate-400">Đã lên xe / Tổng vé</div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {manifest?.checkedInCount ?? 0} / {manifest?.totalSeats ?? 34}
            </div>
          </div>
        </div>

        {/* Chuyển tab: Quét QR vs Sơ đồ ghế */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'scanner' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Quét QR Camera
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manifest' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Sơ Đồ Ghế & Điểm Danh ({manifest?.pendingCount ?? 0} Chờ)
          </button>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH THEO TAB */}
      {activeTab === 'scanner' ? (
        <div className="space-y-4 my-2">
          {/* Camera Viewport */}
          <div
            onClick={handleSimulateCameraScan}
            className="cursor-pointer group relative bg-slate-950 rounded-3xl border-2 border-dashed border-emerald-500/50 p-6 flex flex-col items-center justify-center min-h-[240px] overflow-hidden shadow-2xl hover:border-emerald-400 transition"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none animate-pulse" />

            <div className="w-44 h-44 border-2 border-emerald-400 rounded-2xl relative flex items-center justify-center bg-black/40">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400" />

              <Camera className="w-12 h-12 text-emerald-400/80 animate-bounce" />
            </div>

            <p className="text-xs text-emerald-400 mt-4 font-mono font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {processing ? 'Đang giải mã vé...' : 'Chạm để mô phỏng quét mã QR vé'}
            </p>
          </div>

          {/* Kết quả soát vé trực tiếp (Màu sắc theo DoD: Xanh lá, Đỏ, Vàng) */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                scanResult.validationColor === 'GREEN'
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                  : scanResult.validationColor === 'YELLOW'
                  ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                  : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.validationColor === 'GREEN' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                ) : scanResult.validationColor === 'YELLOW' ? (
                  <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 space-y-1">
                  <p className="font-bold text-sm leading-snug">{scanResult.message}</p>

                  <div className="mt-2 text-xs grid grid-cols-2 gap-2 text-slate-300 pt-1 border-t border-white/10">
                    <div>
                      <span className="text-slate-400">Khách:</span>{' '}
                      <span className="font-bold text-white">{scanResult.passengerName || '--'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Số ghế:</span>{' '}
                      <span className="font-bold text-amber-300 text-sm">{scanResult.seatNumber || '--'}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="font-mono text-emerald-300 text-[11px]">{scanResult.ticketCode}</span>
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-black/40">
                        {scanResult.checkInStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback nhập mã thủ công 6 ký tự */}
          <form onSubmit={handleManualSubmit} className="space-y-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={20}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Nhập mã vé thủ công (VD: TK-696-A01)..."
                  className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={processing || !manualCode.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition text-xs flex items-center gap-1 shrink-0"
              >
                {processing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Soát Vé'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Dùng khi camera mờ, trời tối hoặc vé bị nhăn không quét được mã QR.
            </p>
          </form>
        </div>
      ) : (
        /* TAB SƠ ĐỒ GHẾ & ĐIỂM DANH */
        <div className="space-y-3 my-2 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Đã lên xe
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Có vé (chưa lên)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block" /> Ghế trống
            </span>
          </div>

          {/* Grid ghế trực tiếp */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto max-h-[380px] space-y-3">
            <div className="grid grid-cols-4 gap-2.5">
              {manifest?.seats?.map((seat) => (
                <button
                  key={seat.seatCode}
                  onClick={() => {
                    if (seat.occupied && !seat.checkedIn && seat.ticketCode) {
                      handleValidateCode(seat.ticketCode);
                    } else if (seat.ticketCode) {
                      toast.info(`Khách: ${seat.passengerName || 'N/A'} - Ghế ${seat.seatCode}`);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between min-h-[75px] ${
                    seat.checkedIn
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : seat.occupied
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/50'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold font-mono">{seat.seatCode}</span>
                    {seat.checkedIn && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>

                  <div className="w-full text-center">
                    {seat.checkedIn ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded">
                        ĐÃ LÊN XE
                      </span>
                    ) : seat.occupied ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1 py-0.5 rounded truncate block">
                        {seat.passengerName ? seat.passengerName.split(' ').slice(-1)[0] : 'CHỜ LÊN'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600">Trống</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer GPS Live Tracking */}
      <div className="pt-2 border-t border-slate-800/80">
        <a
          href="/tracking/696"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-emerald-500/50 transition"
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              <strong className="text-white">GPS Vị Trí Xe:</strong> Bản đồ xe thời gian thực
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            Xem bản đồ <ArrowRight className="w-3 h-3" />
          </span>
        </a>
      </div>
    </div>
  );
};
export default QrTicketScannerPage;
