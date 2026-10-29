import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Info, Clock, Calendar, Sparkles, Tag } from 'lucide-react';
import { IVoucher } from '../types';
import { toast } from '../../../../context/ToastContext';

interface VoucherCardProps {
  voucher: IVoucher;
  onSelectDetail: (voucher: IVoucher) => void;
  onUseNow: (voucher: IVoucher) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onSelectDetail,
  onUseNow,
}) => {
  const [copied, setCopied] = useState(false);

  const usagePercent = Math.min(
    100,
    Math.round((voucher.usedQuantity / voucher.totalQuantity) * 100)
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
    <div className="relative group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
      {/* Semicircle Ticket Cutouts (Vé xé hiệu ứng vé cắt) */}
      <div 
        className="hidden md:block absolute -top-3 left-[110px] w-6 h-6 rounded-full bg-slate-100 border-b border-slate-300 z-10" 
      />
      <div 
        className="hidden md:block absolute -bottom-3 left-[110px] w-6 h-6 rounded-full bg-slate-100 border-t border-slate-300 z-10" 
      />

      <div className="flex flex-col md:flex-row h-full">
        {/* LEFT COLUMN: VOUCHER VALUE & BRAND BADGE */}
        <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-4 md:w-[110px] flex md:flex-col items-center justify-between md:justify-center text-white shrink-0 md:border-r border-dashed border-white/40">
          <div className="text-center">
            {voucher.badge && (
              <span className="hidden md:inline-block text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full mb-1">
                {voucher.badge}
              </span>
            )}
            <div className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white drop-shadow">
              {formattedDiscount}
            </div>
            <div className="text-[11px] font-bold text-amber-100 uppercase tracking-wider mt-0.5">
              GIẢM GIÁ
            </div>
          </div>

          <div className="md:mt-3 text-right md:text-center">
            <span className="text-[10px] font-semibold text-white/90 bg-black/15 px-2 py-0.5 rounded-full">
              {voucher.categoryLabel}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: VOUCHER INFO & CONTROLS */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
          <div>
            {/* Title & Detail Link */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="text-sm md:text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                {voucher.title}
              </h4>
              <button
                onClick={() => onSelectDetail(voucher)}
                className="text-slate-400 hover:text-orange-600 p-1 shrink-0 transition-colors"
                title="Xem chi tiết điều kiện áp dụng"
              >
                <Info size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
              {voucher.description}
            </p>

            {/* Conditions & Expiry Pill */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-3">
              <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                <Tag size={11} className="text-orange-500" /> Đơn từ {voucher.minSpend.toLocaleString('vi-VN')}đ
              </span>
              <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                <Calendar size={11} className="text-slate-400" /> HSD: {voucher.expiryDate}
              </span>
            </div>

            {/* Progress Bar for Usage */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-slate-500">Đã dùng {usagePercent}%</span>
                <span className={`text-[10px] font-semibold ${usagePercent > 80 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {usagePercent > 80 ? 'Sắp hết lượt!' : `Còn ${voucher.totalQuantity - voucher.usedQuantity} lượt`}
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

          {/* BOTTOM ACTIONS: COPY CODE & USE NOW */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {/* Coupon Code Tag with Copy Button */}
            <div className="inline-flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 transition-all">
              <span className="text-xs font-mono font-black text-slate-800 tracking-wider mr-2">
                {voucher.code}
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-500 hover:text-orange-600 transition-colors p-0.5"
                title="Sao chép mã"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onUseNow(voucher)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-orange-500/20 transition-all active:scale-95"
            >
              <span>Dùng Ngay</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

