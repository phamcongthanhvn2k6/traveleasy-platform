/**
 * @file CancellationRefundPage.tsx
 * @description [S321] Quản Lý Biểu Phí & Tính Tiền Hoàn Hủy Vé Tự Động (/company/refunds)
 * @author Nguyễn Đại Phát (daiphat)
 * @role Finance Operations & QA/QC
 */
import React, { useState } from 'react';
import {
  ShieldAlert,
  Percent,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Plus,
  Save
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface RefundRule {
  id: number;
  hoursBeforeDeparture: number;
  feePercentage: number;
  refundPercentage: number;
  description: string;
}

export const CancellationRefundPage: React.FC = () => {
  const [rules, setRules] = useState<RefundRule[]>([
    {
      id: 1,
      hoursBeforeDeparture: 24,
      feePercentage: 10,
      refundPercentage: 90,
      description: 'Hủy trước giờ khởi hành > 24 tiếng (Khấu trừ 10%, hoàn 90%)'
    },
    {
      id: 2,
      hoursBeforeDeparture: 12,
      feePercentage: 30,
      refundPercentage: 70,
      description: 'Hủy từ 12 - 24 tiếng trước giờ chạy (Khấu trừ 30%, hoàn 70%)'
    },
    {
      id: 3,
      hoursBeforeDeparture: 2,
      feePercentage: 50,
      refundPercentage: 50,
      description: 'Hủy từ 2 - 12 tiếng trước giờ chạy (Khấu trừ 50%, hoàn 50%)'
    },
    {
      id: 4,
      hoursBeforeDeparture: 0,
      feePercentage: 100,
      refundPercentage: 0,
      description: 'Hủy dưới 2 tiếng hoặc sau giờ xuất bến (Không hoàn tiền)'
    }
  ]);

  const handleSave = () => {
    toast.success('Đã lưu biểu phí hoàn hủy vé thành công vào CSDL nhà xe.', 'Cập Nhật Biểu Phí');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
            <RotateCcw className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Chính Sách Khấu Trừ & Hoàn Hủy Vé
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-full">
                Task S321 - Phat
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cài đặt tỷ lệ khấu trừ tự động theo các mốc thời gian hủy vé của hành khách và sinh phiếu hoàn tiền.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-md"
        >
          <Save className="w-4 h-4" />
          Lưu Cấu Hình
        </button>
      </div>

      {/* Biểu phí bảng */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-rose-600" />
            Biểu Phí Khấu Trừ Hoàn Vé Áp Dụng Toàn Tuyến
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rule.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mốc áp dụng: Hủy trước giờ xuất bến tối thiểu {rule.hoursBeforeDeparture} tiếng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Khấu trừ sàn / nhà xe:</span>
                  <span className="font-bold text-rose-600 text-sm">{rule.feePercentage}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Khách thực nhận:</span>
                  <span className="font-bold text-emerald-600 text-lg">{rule.refundPercentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default CancellationRefundPage;
