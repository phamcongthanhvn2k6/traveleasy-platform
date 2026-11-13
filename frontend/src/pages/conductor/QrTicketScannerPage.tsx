/**
 * @file QrTicketScannerPage.tsx
 * @description [S320] Giao Diện Điện Thoại Quét Mã QR Soát Vé Cho Phụ Xe (/conductor/scanner)
 * @author Đoàn Nhật Cường (CuongLiam)
 * @role Frontline Operations & Driver Management
 */
import React, { useState } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Ticket,
  User,
  MapPin,
  ShieldCheck,
  Smartphone,
  Radio
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

export const QrTicketScannerPage: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    ticketCode: string;
    customerName: string;
    seatNumber: string;
    tripRoute: string;
    message: string;
  } | null>({
    success: true,
    ticketCode: 'TK-20261110-CT03-01',
    customerName: 'Nguyễn Văn Du Khách',
    seatNumber: 'A05',
    tripRoute: 'TP. Hồ Chí Minh ➔ Đà Lạt',
    message: 'Vé hợp lệ! Khách đã được xác nhận lên xe.'
  });

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    if (manualCode.includes('CT')) {
      setLastScannedResult({
        success: true,
        ticketCode: manualCode.toUpperCase(),
        customerName: 'Đỗ Thảo Vy',
        seatNumber: 'B01',
        tripRoute: 'TP. Hồ Chí Minh ➔ Đà Lạt',
        message: 'Vé hợp lệ! Trạng thái chuyển sang: ĐÃ LÊN XE (USED).'
      });
      toast.success('Soát vé thành công!', 'Vé Hợp Lệ');
    } else {
      setLastScannedResult({
        success: false,
        ticketCode: manualCode.toUpperCase(),
        customerName: 'Không xác định',
        seatNumber: '--',
        tripRoute: '--',
        message: 'Mã vé không tồn tại hoặc sai chuyến xe này!'
      });
      toast.error('Vé không hợp lệ hoặc đã qua giờ!', 'Lỗi Soát Vé');
    }
    setManualCode('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 max-w-lg mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="space-y-2 text-center pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
          <Smartphone className="w-3.5 h-3.5" /> Mobile Web Conductor App
        </div>
        <h1 className="text-xl font-bold">Soát Vé Khách Lên Xe</h1>
        <p className="text-xs text-slate-400">Chuyến: 51B-888.88 | Tuyến Sài Gòn ➔ Đà Lạt (22:30)</p>
      </div>

      {/* Camera Scanner Viewport Mockup */}
      <div className="my-6 relative bg-slate-950 rounded-3xl border-2 border-dashed border-emerald-500/50 p-6 flex flex-col items-center justify-center min-h-[260px] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none animate-pulse" />
        
        {/* Scanner target frame */}
        <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative flex items-center justify-center">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400" />
          
          <Camera className="w-12 h-12 text-emerald-400/60 animate-bounce" />
        </div>
        <p className="text-xs text-emerald-400 mt-4 font-mono font-medium">Đang hướng Camera quét mã QR vé...</p>
      </div>

      {/* Kết quả quét gần nhất */}
      {lastScannedResult && (
        <div className={`p-4 rounded-2xl border transition-all ${
          lastScannedResult.success
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-start gap-3">
            {lastScannedResult.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-sm">{lastScannedResult.message}</p>
              {lastScannedResult.success && (
                <div className="mt-2 text-xs grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400">Khách:</span> <span className="font-bold text-white">{lastScannedResult.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Số ghế:</span> <span className="font-bold text-amber-300 text-sm">{lastScannedResult.seatNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Mã vé:</span> <span className="font-mono text-emerald-300">{lastScannedResult.ticketCode}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nhập mã tay nếu camera không đọc được */}
      <form onSubmit={handleManualScan} className="mt-4 flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Nhập mã vé thủ công (VD: TK-CT01)..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm"
        >
          Check-in
        </button>
      </form>

      {/* [S306] Liên kết GPS Live Tracking cho Tài xế / Phụ xe */}
      <div className="mt-3">
        <a
          href="/tracking/696"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/90 border border-emerald-500/40 text-xs text-slate-200 hover:border-emerald-400 transition"
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              <strong className="text-emerald-400">Định vị GPS Live Xe:</strong> Bật phát vị trí xe
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-400">Mở bản đồ ➔</span>
        </a>
      </div>
    </div>
  );
};
export default QrTicketScannerPage;
