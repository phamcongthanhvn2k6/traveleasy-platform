/**
 * @file CompanyPricingRulesPage.tsx
 * @description Quản trị Chính sách Giá vé động & Phụ thu Lễ Tết/Cuối tuần (/company/pricing-rules)
 * @author Trần Minh Đức (minhdctrn13)
 * @role Pricing & Policy Specialist
 * @task [S307][PRICING] Sprint 3 (3 SP)
 */
import React, { useState } from 'react';
import {
  Tag,
  Percent,
  Calendar,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Info,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';

interface PricingRule {
  id: string;
  name: string;
  ruleType: 'SURCHARGE' | 'DISCOUNT';
  scope: 'ALL_ROUTES' | 'SPECIFIC_ROUTE';
  targetRouteName?: string;
  adjustmentType: 'PERCENT' | 'FIXED';
  adjustmentValue: number;
  startDate: string;
  endDate: string;
  applicableDays: string[];
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  description?: string;
}

const STORAGE_KEY = 'traveleasy_company_pricing_rules';

export const CompanyPricingRulesPage: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveRules = (newRules: PricingRule[]) => {
    setRules(newRules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [ruleType, setRuleType] = useState<'SURCHARGE' | 'DISCOUNT'>('SURCHARGE');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(20);
  const [adjustmentType, setAdjustmentType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [description, setDescription] = useState('');

  const handleAddRule = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên quy tắc giá vé');
      return;
    }
    const newRule: PricingRule = {
      id: `rule-${Date.now()}`,
      name,
      ruleType,
      scope: 'ALL_ROUTES',
      adjustmentType,
      adjustmentValue: Number(adjustmentValue),
      startDate,
      endDate,
      applicableDays: ['Thứ 6', 'Thứ 7', 'Chủ nhật'],
      status: 'ACTIVE',
      description
    };
    saveRules([newRule, ...rules]);
    setIsModalOpen(false);
    toast.success('Đã kích hoạt chính sách giá vé mới thành công!');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* BANNER THÔNG TIN TASK SPRINT 3 & NGƯỜI PHỤ TRÁCH */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-800 text-white p-5 rounded-2xl shadow-md mb-6 border border-indigo-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase">
                  SPRINT 3 TASK
                </span>
                <span className="text-xs font-semibold text-indigo-200">Mã thẻ: [S307][PRICING] • Định mức: 3 SP</span>
              </div>
              <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-300" />
                Quản Trị Chính Sách Giá Vé Động & Phụ Thu Lễ Tết
              </h2>
              <p className="text-xs text-indigo-200 mt-1">
                Tự động tính toán phụ thu cao điểm hoặc chiết khấu giờ chót khi khách đặt vé trực tuyến
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow">
                Đ
              </div>
              <div>
                <p className="text-xs text-indigo-200">Thành viên phụ trách</p>
                <p className="text-sm font-bold text-white">Trần Minh Đức (@minhdctrn13)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header danh sách & Nút tạo mới */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Danh Mục Quy Tắc Giá Vé</h1>
            <p className="text-sm text-slate-500">Thiết lập linh hoạt biên độ giá theo mùa vụ, ngày lễ và khung giờ khởi hành</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Tạo Quy Tắc Giá Mới
          </button>
        </div>

        {/* Danh sách các thẻ quy tắc */}
        {rules.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 mb-8">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Chưa có chính sách giá vé hoặc phụ thu nào</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Nhà xe có thể bấm "Tạo Quy Tắc Giá Mới" để thiết lập mức phụ thu dịp Lễ Tết (+20%) hoặc giảm giá kích cầu giờ chót (-15%).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {rules.map((rule) => {
              const isSurcharge = rule.ruleType === 'SURCHARGE';
              return (
                <div key={rule.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isSurcharge
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isSurcharge ? <TrendingUp className="w-3.5 h-3.5" /> : <Percent className="w-3.5 h-3.5" />}
                        {isSurcharge ? 'Phụ Thu Cao Điểm' : 'Giảm Giá Giờ Chót'}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          rule.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rule.status === 'ACTIVE' ? 'Đang Áp Dụng' : 'Lên Lịch Trước'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1">{rule.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{rule.description}</p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mức điều chỉnh:</span>
                        <span className={`font-bold text-sm ${isSurcharge ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isSurcharge ? '+' : '-'}
                          {rule.adjustmentValue}
                          {rule.adjustmentType === 'PERCENT' ? '%' : ' đ'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="font-medium text-slate-700">
                          {rule.startDate} ➔ {rule.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phạm vi:</span>
                        <span className="font-medium text-slate-700">{rule.targetRouteName || 'Tất cả các tuyến'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Áp dụng: {rule.applicableDays.join(', ')}</span>
                    <button
                      onClick={() => {
                        saveRules(rules.filter((r) => r.id !== rule.id));
                        toast.info(`Đã gỡ bỏ quy tắc: ${rule.name}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Xóa quy tắc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal tạo quy tắc */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                Thêm Chính Sách Giá Vé Mới
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Quy Tắc Chính Sách</label>
                  <input
                    type="text"
                    placeholder="VD: Phụ thu cao điểm Giáng Sinh..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Loại Quy Tắc</label>
                    <select
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="SURCHARGE">Phụ Thu (+ Tiền)</option>
                      <option value="DISCOUNT">Khuyến Mãi (- Tiền)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mức Điều Chỉnh (% hoặc đ)</label>
                    <input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Từ Ngày</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Đến Ngày</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi Chú Giải Thích</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả lý do phụ thu để hiển thị minh bạch cho hành khách khi thanh toán..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
                >
                  Hủy Bỏ
                </button>
                <button
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Lưu Quy Tắc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPricingRulesPage;
