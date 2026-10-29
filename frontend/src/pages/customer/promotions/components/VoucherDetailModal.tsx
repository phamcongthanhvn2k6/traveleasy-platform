import React, { useState } from 'react';
import { X, Copy, Check, ArrowRight, ShieldCheck, Tag, Calendar, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { IVoucher } from '../types';
import { toast } from '../../../../context/ToastContext';

interface VoucherDetailModalProps {
  voucher: IVoucher | null;
  onClose: () => void;
  onUseNow: (voucher: IVoucher) => void;
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  voucher,
  onClose,
  onUseNow,
}) => {
  const [copied, setCopied] = useState(false);

  if (!voucher) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success(`Đã sao chép mã [${voucher.code}]!`, 'Sao Chép Thành Công');
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDiscount =
    voucher.discountType === 'PERCENT'
      ? `${voucher.discountValue}%`
      : `${voucher.discountValue.toLocaleString('vi-VN')}đ`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Colorful Gradient Accent */}
        <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-white/20 backdrop-blur-sm mb-2">
            <Tag size={12} /> {voucher.categoryLabel}
          </div>

          <h3 className="text-xl font-black text-white leading-tight mb-1">
            {voucher.title}
          </h3>

          <p className="text-xs text-amber-100 font-medium">
            {voucher.description}
          </p>

          {/* Big Discount Tag */}
          <div className="mt-4 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <span className="text-2xl font-black text-white">{formattedDiscount}</span>
            <div className="text-left text-xs text-slate-100 leading-tight">
              <div>Đơn tối thiểu: <strong>{voucher.minSpend.toLocaleString('vi-VN')}đ</strong></div>
              {voucher.maxDiscount && (
                <div>Giảm tối đa: <strong>{voucher.maxDiscount.toLocaleString('vi-VN')}đ</strong></div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs md:text-sm">
          {/* Validity & Usage Info */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-orange-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Hạn Sử Dụng</div>
                <div className="font-extrabold text-slate-900">{voucher.expiryDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Lượt Sử Dụng</div>
                <div className="font-extrabold text-slate-900">
                  {voucher.usedQuantity} / {voucher.totalQuantity} lượt
                </div>
              </div>
            </div>
          </div>

          {/* Applicable Routes */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs md:text-sm">
              <MapPin size={15} className="text-orange-500" /> Tuyến Đường Áp Dụng:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {voucher.applicableRoutes.map((route, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-semibold"
                >
                  {route}
                </span>
              ))}
            </div>
          </div>

          {/* Applicable Payment Methods */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs md:text-sm">
              <CreditCard size={15} className="text-blue-500" /> Phương Thức Thanh Toán Hợp Lệ:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {voucher.applicablePaymentMethods.map((pm, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold"
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Terms and Conditions */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs md:text-sm">
              <AlertCircle size={15} className="text-amber-500" /> Điều Khoản & Quy Định Áp Dụng:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-1 text-xs leading-relaxed">
              {voucher.terms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-800 text-xs md:text-sm transition-all"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-600" /> Đã Sao Chép Mã
              </>
            ) : (
              <>
                <Copy size={16} className="text-slate-500" /> Chép Mã: <strong>{voucher.code}</strong>
              </>
            )}
          </button>

          {/* Use Now Button */}
          <button
            onClick={() => {
              onClose();
              onUseNow(voucher);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs md:text-sm shadow-md hover:shadow-orange-500/25 transition-all"
          >
            Đặt Vé Áp Dụng Ngay <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

