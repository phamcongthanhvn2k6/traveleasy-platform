import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Info, Calendar, Tag, BookmarkPlus, CheckCircle2, AlertOctagon } from 'lucide-react';
import { IVoucher } from '../types';
import { toast } from '../../../../context/ToastContext';
import { VoucherWalletService } from '../../../../services/voucherWalletService';

interface VoucherCardProps {
  voucher: IVoucher;
  isOwned?: boolean;
  onSelectDetail: (voucher: IVoucher) => void;
  onUseNow: (voucher: IVoucher) => void;
  onClaimVoucher?: (voucher: IVoucher) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  isOwned = false,
  onSelectDetail,
  onUseNow,
  onClaimVoucher,
}) => {
  const [copied, setCopied] = useState(false);

  // Kiểm tra hạn dùng và số lượt
  const isExpired = voucher.isExpired || VoucherWalletService.isExpired(voucher.expiryDate);
  const isOutOfStock = voucher.isOutOfStock || (voucher.totalQuantity > 0 && voucher.usedQuantity >= voucher.totalQuantity);
  const isUnavailable = isExpired || isOutOfStock;

  const usagePercent = Math.min(
    100,
    Math.round((voucher.usedQuantity / (voucher.totalQuantity || 1)) * 100)
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Đã sao chép mã ưu đãi [${voucher.code}] thành công!`, 'Đã Lưu Vào Bộ Nhớ');
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDiscount =
    voucher.discountType === 'PERCENT'
      ? `${voucher.discountValue}%`
      : `${(voucher.discountValue / 1000).toLocaleString('vi-VN')}K`;

  return (
    <div className={`relative group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 ${
      isUnavailable
        ? 'border-slate-200 opacity-75 grayscale-[30%]'
        : isOwned
        ? 'border-emerald-300/80 shadow-md hover:shadow-xl'
        : 'border-slate-200/90 shadow-sm hover:shadow-xl'
    }`}>
      {/* Semicircle Ticket Cutouts (Vé xé hiệu ứng vé cắt - cân chỉnh chính xác mép phân tách) */}
      <div 
        className="hidden md:block absolute -top-2.5 left-[95px] md:left-[105px] -translate-x-1/2 w-5 h-5 rounded-full bg-slate-50 border-b border-slate-200 z-10" 
      />
      <div 
        className="hidden md:block absolute -bottom-2.5 left-[95px] md:left-[105px] -translate-x-1/2 w-5 h-5 rounded-full bg-slate-50 border-t border-slate-200 z-10" 
      />

      <div className="flex flex-col md:flex-row h-full">
        {/* LEFT COLUMN: VOUCHER VALUE & BRAND BADGE */}
        <div className={`relative p-3.5 md:p-3 w-full md:w-[105px] flex md:flex-col items-center justify-between md:justify-center text-white shrink-0 md:border-r border-dashed border-white/40 ${
          isUnavailable
            ? 'bg-gradient-to-br from-slate-500 to-slate-700'
            : isOwned
            ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700'
            : 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600'
        }`}>
          <div className="text-center">
            {voucher.badge && (
              <span className="hidden md:inline-block text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full mb-1">
                {voucher.badge}
              </span>
            )}
            <div className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white drop-shadow">
              {formattedDiscount}
            </div>
            <div className="text-[10px] md:text-[11px] font-bold text-white/90 uppercase tracking-wider mt-0.5">
              GIẢM GIÁ
            </div>
          </div>

          <div className="md:mt-2.5 text-right md:text-center">
            <span className="text-[10px] font-semibold text-white/90 bg-black/20 px-2 py-0.5 rounded-full">
              {voucher.categoryLabel}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: VOUCHER INFO & CONTROLS */}
        <div className="flex-1 min-w-0 p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            {/* Title & Status Badge - Hiển thị tối đa 2 dòng không bị truncate cộc lốc */}
            <div className="flex items-start justify-between gap-1.5 mb-1.5">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                  {voucher.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onSelectDetail(voucher)}
                className="text-slate-400 hover:text-orange-600 p-1 shrink-0 transition-colors mt-0.5"
                title="Xem chi tiết điều kiện áp dụng"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Ownership Pill or Expiration Warning */}
            <div className="mb-2">
              {isExpired ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  <AlertOctagon size={11} /> Đã Hết Hạn
                </span>
              ) : isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertOctagon size={11} /> Đã Hết Lượt Áp Dụng
                </span>
              ) : isOwned ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} /> Đã Trong Ví Của Bạn
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  <Tag size={11} /> Ưu Đãi Có Thể Thu Thập
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2.5">
              {voucher.description}
            </p>

            {/* Conditions & Expiry Pill */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-600 mb-2.5">
              <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                <Tag size={11} className="text-orange-500" /> Đơn từ {voucher.minSpend.toLocaleString('vi-VN')}đ
              </span>
              <span className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md ${
                isExpired ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
              }`}>
                <Calendar size={11} className={isExpired ? 'text-rose-500' : 'text-slate-400'} /> HSD: {voucher.expiryDate}
              </span>
            </div>

            {/* Progress Bar for Usage */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold mb-1">
                <span className="text-slate-500">Đã dùng {usagePercent}%</span>
                <span className={`font-semibold ${usagePercent > 80 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {usagePercent >= 100 ? 'Hết lượt' : usagePercent > 80 ? 'Sắp hết lượt!' : `Còn ${Math.max(0, voucher.totalQuantity - voucher.usedQuantity)} lượt`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent > 80
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-orange-400 to-amber-400'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* BOTTOM ACTIONS: COPY CODE & DYNAMIC ACTION BUTTON (Bảo đảm không bị tràn viền hay mất chữ) */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
            {/* Coupon Code Tag with Copy Button */}
            <div className="inline-flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2 py-1 transition-all shrink-0">
              <span className="text-[11px] sm:text-xs font-mono font-black text-slate-800 tracking-wide mr-1.5">
                {voucher.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-500 hover:text-orange-600 transition-colors p-0.5"
                title="Sao chép mã"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            </div>

            {/* Primary Action Button theo đúng yêu cầu nghiệp vụ:
                1. Nếu hết hạn / hết lượt: Nút disabled xám.
                2. Nếu chưa có trong ví: Nút "Thêm Voucher" / "Lưu Mã"
                3. Nếu đã sở hữu: Nút "Dùng Ngay" chuyển sang trang đặt vé
            */}
            {isUnavailable ? (
              <button
                type="button"
                disabled
                className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-400 cursor-not-allowed"
              >
                <span>{isExpired ? 'Đã Hết Hạn' : 'Hết Lượt'}</span>
              </button>
            ) : isOwned ? (
              <button
                type="button"
                onClick={() => onUseNow(voucher)}
                className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm hover:shadow-orange-500/20 transition-all active:scale-95"
              >
                <span>Dùng Ngay</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onClaimVoucher?.(voucher)}
                className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-extrabold border-2 border-orange-500 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white shadow-sm transition-all active:scale-95"
              >
                <BookmarkPlus size={13} />
                <span>Thêm Voucher</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
