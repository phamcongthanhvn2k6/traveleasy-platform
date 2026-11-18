import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, XCircle, Tag, ArrowRight, Wallet, BookmarkCheck } from 'lucide-react';
import { FilterType, IVoucher } from '../types';

interface VoucherFilterProps {
  activeTab: FilterType;
  onTabChange: (tab: FilterType) => void;
  vouchers: IVoucher[];
  ownedCodes?: string[];
  onTestCode: (code: string) => { valid: boolean; voucher?: IVoucher; message: string };
  onApplyTestedVoucher: (voucher: IVoucher) => void;
}

export const VoucherFilter: React.FC<VoucherFilterProps> = ({
  activeTab,
  onTabChange,
  vouchers,
  ownedCodes = [],
  onTestCode,
  onApplyTestedVoucher,
}) => {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ valid: boolean; voucher?: IVoucher; message: string } | null>(null);

  // Tính số lượng voucher trong ví
  const ownedVoucherCount = vouchers.filter((v) => ownedCodes.includes(v.code.toUpperCase())).length;

  const tabs: { key: FilterType; label: string; count: number; icon?: React.ReactNode; isSpecial?: boolean }[] = [
    { key: 'ALL', label: 'Tất Cả Ưu Đãi', count: vouchers.length },
    {
      key: 'MY_WALLET',
      label: 'Ví Voucher Của Tôi',
      count: ownedVoucherCount,
      icon: <Wallet size={14} className="text-amber-500" />,
      isSpecial: true,
    },
    { key: 'NEW_USER', label: 'Chào Bạn Mới', count: vouchers.filter((v) => v.category === 'NEW_USER').length },
    { key: 'HOT_ROUTE', label: 'Tuyến Đường Hot', count: vouchers.filter((v) => v.category === 'HOT_ROUTE').length },
    { key: 'ONLINE_PAYMENT', label: 'Thanh Toán Online', count: vouchers.filter((v) => v.category === 'ONLINE_PAYMENT').length },
  ];

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) {
      setTestResult(null);
      return;
    }
    const result = onTestCode(testInput.trim());
    setTestResult(result);
  };

  return (
    <div className="space-y-4">
      {/* Search & Code Checker Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Heading tip */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
            <Tag size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Kiểm Tra & Áp Dụng Mã Ưu Đãi
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Thử Ngay
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Nhập mã bạn có để kiểm tra mức giảm giá và điều kiện áp dụng hợp lệ
            </p>
          </div>
        </div>

        {/* Right: Search / Test Form */}
        <form onSubmit={handleRunTest} className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Nhập mã voucher (VD: BANMOI15)"
              value={testInput}
              onChange={(e) => {
                setTestInput(e.target.value.toUpperCase());
                if (testResult) setTestResult(null);
              }}
              className="w-full pl-3.5 pr-8 py-2 text-xs md:text-sm font-mono uppercase font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case"
            />
            {testInput && (
              <button
                type="button"
                onClick={() => {
                  setTestInput('');
                  setTestResult(null);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-slate-900 hover:bg-orange-600 text-white shadow-sm hover:shadow transition-all shrink-0 active:scale-95"
          >
            Áp Dụng Thử
          </button>
        </form>
      </div>

      {/* Test Result Feedback Box */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn ${
            testResult.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testResult.valid ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {testResult.valid ? 'Mã ưu đãi hợp lệ & sẵn sàng áp dụng' : 'Không thể áp dụng mã này'}
              </div>
              <p className="text-xs opacity-90 mt-0.5">{testResult.message}</p>
            </div>
          </div>

          {testResult.valid && testResult.voucher && (
            <button
              type="button"
              onClick={() => onApplyTestedVoucher(testResult.voucher!)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow transition-colors"
            >
              Dùng Ngay <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? tab.isSpecial
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : tab.isSpecial
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-sm'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.isSpecial
                    ? 'bg-emerald-200/70 text-emerald-900'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default VoucherFilter;
