/**
 * @file CompanyPricingRulesPage.tsx
 * @description Quản trị Chính sách Giá vé động & Phụ thu Lễ Tết/Cuối tuần (/company/pricing-rules)
 * @author Trần Minh Đức (minhdctrn13)
 * @role Pricing & Policy Specialist
 * @task [S307][PRICING] Sprint 3 (3 SP)
 */
import React, { useState, useEffect, useMemo } from 'react';
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
  Edit2,
  RefreshCw,
  Power,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import {
  CompanyPricingRule,
  PricingRuleType,
  AdjustmentType,
  PricingRuleScope,
  PricingRuleStatus,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  PriceSimulationRequest,
  PriceSimulationResponse
} from '../../../types';

export const CompanyPricingRulesPage: React.FC = () => {
  const [rules, setRules] = useState<CompanyPricingRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'SURCHARGE' | 'DISCOUNT'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [ruleType, setRuleType] = useState<PricingRuleType>('HOLIDAY_SURCHARGE');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('PERCENTAGE');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(20);
  const [scope, setScope] = useState<PricingRuleScope>('ALL_ROUTES');
  const [targetRouteId, setTargetRouteId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-09-04');
  const [selectedDays, setSelectedDays] = useState<string[]>(['FRIDAY', 'SATURDAY', 'SUNDAY']);
  const [priority, setPriority] = useState<number>(100);
  const [description, setDescription] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Live Simulator State
  const [simBasePrice, setSimBasePrice] = useState<number>(250000);
  const [simDepartureTime, setSimDepartureTime] = useState<string>('2026-09-02T08:00');
  const [simTotalSeats, setSimTotalSeats] = useState<number>(40);
  const [simAvailableSeats, setSimAvailableSeats] = useState<number>(25);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<PriceSimulationResponse | null>(null);

  // Danh sách các thứ trong tuần
  const DAYS_OF_WEEK = [
    { key: 'MONDAY', label: 'Thứ 2' },
    { key: 'TUESDAY', label: 'Thứ 3' },
    { key: 'WEDNESDAY', label: 'Thứ 4' },
    { key: 'THURSDAY', label: 'Thứ 5' },
    { key: 'FRIDAY', label: 'Thứ 6' },
    { key: 'SATURDAY', label: 'Thứ 7' },
    { key: 'SUNDAY', label: 'Chủ nhật' }
  ];

  // Tải danh sách quy tắc từ API backend
  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/pricing-rules');
      if (res.data) {
        setRules(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách quy tắc giá:', err);
      toast.error(err.response?.data?.message || 'Không thể tải danh sách quy tắc giá từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingRuleId(null);
    setName('');
    setRuleType('HOLIDAY_SURCHARGE');
    setAdjustmentType('PERCENTAGE');
    setAdjustmentValue(20);
    setScope('ALL_ROUTES');
    setTargetRouteId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    setSelectedDays(['FRIDAY', 'SATURDAY', 'SUNDAY']);
    setPriority(100);
    setDescription('');
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (rule: CompanyPricingRule) => {
    setEditingRuleId(rule.id);
    setName(rule.name);
    setRuleType(rule.ruleType);
    setAdjustmentType(rule.adjustmentType);
    setAdjustmentValue(rule.adjustmentValue);
    setScope(rule.scope || 'ALL_ROUTES');
    const rId = rule.routeId ?? rule.targetRouteId;
    setTargetRouteId(rId ? String(rId) : '');
    setStartDate(rule.startDate);
    setEndDate(rule.endDate);
    const daysStr = rule.applicableDays ?? rule.applicableDaysOfWeek;
    if (daysStr) {
      setSelectedDays(daysStr === 'ALL' ? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] : daysStr.split(','));
    } else {
      setSelectedDays([]);
    }
    setPriority(rule.priority);
    setDescription(rule.description || '');
    setIsModalOpen(true);
  };

  // Xử lý chọn/bỏ chọn thứ trong tuần
  const toggleDayOfWeek = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      setSelectedDays(selectedDays.filter(d => d !== dayKey));
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  // Lưu quy tắc (Tạo mới hoặc Cập nhật)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên quy tắc chính sách giá.');
      return;
    }
    if (adjustmentValue <= 0) {
      toast.error('Mức điều chỉnh giá phải lớn hơn 0.');
      return;
    }
    if (startDate > endDate) {
      toast.error('Ngày bắt đầu không thể sau ngày kết thúc.');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload: CreatePricingRuleRequest = {
        name: name.trim(),
        ruleType,
        adjustmentType,
        adjustmentValue: Number(adjustmentValue),
        scope,
        routeId: scope === 'SPECIFIC_ROUTE' && targetRouteId ? Number(targetRouteId) : null,
        targetRouteId: scope === 'SPECIFIC_ROUTE' && targetRouteId ? Number(targetRouteId) : null,
        startDate,
        endDate,
        applicableDays: selectedDays.length === 7 ? 'ALL' : (selectedDays.length > 0 ? selectedDays.join(',') : 'ALL'),
        applicableDaysOfWeek: selectedDays.length === 7 ? 'ALL' : (selectedDays.length > 0 ? selectedDays.join(',') : 'ALL'),
        isLastMinute: ruleType === 'FLASH_SALE',
        lastMinuteHours: 2,
        minEmptySeatPercentage: 50,
        priority: Number(priority),
        status: 'ACTIVE',
        description: description.trim() || null
      };

      if (editingRuleId) {
        await api.put(`/company/pricing-rules/${editingRuleId}`, payload);
        toast.success('Cập nhật quy tắc giá thành công!');
      } else {
        await api.post('/company/pricing-rules', payload);
        toast.success('Tạo quy tắc giá mới thành công!');
      }

      setIsModalOpen(false);
      fetchRules();
    } catch (err: any) {
      console.error('Lỗi khi lưu quy tắc giá:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu quy tắc.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Bật/tắt trạng thái nhanh 1-Click
  const handleToggleStatus = async (ruleId: number) => {
    try {
      await api.patch(`/company/pricing-rules/${ruleId}/toggle-status`);
      toast.success('Đã cập nhật trạng thái quy tắc giá.');
      fetchRules();
    } catch (err: any) {
      console.error('Lỗi khi thay đổi trạng thái:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái.');
    }
  };

  // Xóa quy tắc giá
  const handleDeleteRule = async (ruleId: number, ruleName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa quy tắc: "${ruleName}"?`)) {
      return;
    }
    try {
      await api.delete(`/company/pricing-rules/${ruleId}`);
      toast.success('Đã xóa quy tắc giá thành công.');
      fetchRules();
    } catch (err: any) {
      console.error('Lỗi khi xóa quy tắc:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa quy tắc.');
    }
  };

  // Mô phỏng tính giá vé trực tiếp (Live Price Simulator)
  const handleRunSimulation = async () => {
    if (simBasePrice <= 0) {
      toast.error('Vui lòng nhập giá vé gốc hợp lệ.');
      return;
    }
    try {
      setSimLoading(true);
      const req: PriceSimulationRequest = {
        basePrice: Number(simBasePrice),
        departureTime: simDepartureTime ? (simDepartureTime.length === 16 ? simDepartureTime + ':00' : simDepartureTime) : new Date().toISOString(),
        totalSeats: Number(simTotalSeats),
        availableSeats: Number(simAvailableSeats)
      };

      const res = await api.post('/company/pricing-rules/simulate', req);
      const simData: PriceSimulationResponse = res.data?.data || res.data;
      setSimResult(simData);
      toast.success('Mô phỏng tính giá động thành công!');
    } catch (err: any) {
      console.error('Lỗi khi mô phỏng giá:', err);
      toast.error(err.response?.data?.message || 'Không thể thực hiện mô phỏng giá.');
    } finally {
      setSimLoading(false);
    }
  };

  // Tính toán thống kê KPI
  const stats = useMemo(() => {
    const total = rules.length;
    const active = rules.filter(r => r.status === 'ACTIVE').length;
    const surcharge = rules.filter(r => r.ruleType === 'HOLIDAY_SURCHARGE' || r.ruleType === 'WEEKEND_SURCHARGE').length;
    const discount = rules.filter(r => r.ruleType === 'FLASH_SALE').length;
    return { total, active, surcharge, discount };
  }, [rules]);

  // Lọc danh sách theo Tab
  const filteredRules = useMemo(() => {
    if (activeTab === 'ACTIVE') return rules.filter(r => r.status === 'ACTIVE');
    if (activeTab === 'SURCHARGE') return rules.filter(r => r.ruleType === 'HOLIDAY_SURCHARGE' || r.ruleType === 'WEEKEND_SURCHARGE');
    if (activeTab === 'DISCOUNT') return rules.filter(r => r.ruleType === 'FLASH_SALE');
    return rules;
  }, [rules, activeTab]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const getRuleTypeBadge = (type: PricingRuleType) => {
    switch (type) {
      case 'HOLIDAY_SURCHARGE':
        return { label: 'Phụ thu Lễ Tết (+20%)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'WEEKEND_SURCHARGE':
        return { label: 'Phụ thu Cuối tuần (+10%)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'FLASH_SALE':
        return { label: 'Flash Sale Giờ Chót (-15%)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Quy Tắc Tùy Chỉnh', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner thông tin Task & Quản trị */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md border border-indigo-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                  SPRINT 3 TASK
                </span>
                <span className="text-xs font-semibold text-indigo-200">
                  Mã thẻ: [S307][PRICING] • Định mức: 3 SP
                </span>
              </div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="w-6 h-6 text-indigo-300" />
                Quản Trị Chính Sách Giá Vé Động & Phụ Thu Lễ Tết
              </h1>
              <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
                Tự động tính toán biên độ giá linh hoạt: Phụ thu cao điểm Lễ Tết (+20%), Cuối tuần (+10%) và Flash Sale giờ chót (-15%) khi khách đặt vé trực tuyến.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm shadow text-white">
                Đ
              </div>
              <div>
                <p className="text-xs text-indigo-200">Chuyên viên phụ trách</p>
                <p className="text-sm font-bold text-white">Trần Minh Đức (@minhdctrn13)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thẻ thống kê KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Tổng Số Quy Tắc</span>
              <Tag className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-0.5">Đã cấu hình trên hệ thống</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Đang Áp Dụng</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{stats.active}</div>
            <div className="text-xs text-slate-400 mt-0.5">Quy tắc đang có hiệu lực</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Phụ Thu Cao Điểm</span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600">{stats.surcharge}</div>
            <div className="text-xs text-slate-400 mt-0.5">Lễ Tết (+20%) & Cuối tuần (+10%)</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Giảm Giá Kích Cầu</span>
              <Percent className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-extrabold text-teal-600">{stats.discount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Flash Sale (-15%) & Đặt sớm</div>
          </div>
        </div>

        {/* Thanh điều hướng & Nút tạo mới */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất Cả ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Đang Bật ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('SURCHARGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'SURCHARGE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Phụ Thu ({stats.surcharge})
            </button>
            <button
              onClick={() => setActiveTab('DISCOUNT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'DISCOUNT'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Giảm Giá ({stats.discount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRules}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo Quy Tắc Giá Mới
            </button>
          </div>
        </div>

        {/* Danh sách thẻ quy tắc */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm">Đang tải dữ liệu chính sách giá từ máy chủ...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Chưa có quy tắc giá vé nào trong mục này</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Nhà xe có thể bấm "Tạo Quy Tắc Giá Mới" để thiết lập mức phụ thu dịp Lễ Tết (+20%) hoặc giảm giá kích cầu giờ chót (-15%).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredRules.map((rule) => {
              const isSurcharge = rule.ruleType === 'HOLIDAY_SURCHARGE' || rule.ruleType === 'WEEKEND_SURCHARGE';
              const badge = getRuleTypeBadge(rule.ruleType);
              const isActive = rule.status === 'ACTIVE';

              return (
                <div
                  key={rule.id}
                  className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all ${
                    isActive ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200/60 opacity-75'
                  }`}
                >
                  <div>
                    {/* Header thẻ */}
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                        {isSurcharge ? <TrendingUp className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                        {badge.label}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(rule.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Bấm để bật hoặc tắt quy tắc"
                      >
                        <Power className="w-3 h-3" />
                        {isActive ? 'Đang Bật' : 'Đang Tắt'}
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1">{rule.name}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {rule.description || 'Chính sách áp dụng tự động khi khách đặt vé trực tuyến trên hệ thống.'}
                    </p>

                    {/* Thông tin chi tiết */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mức điều chỉnh:</span>
                        <span className={`font-bold text-sm ${isSurcharge ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isSurcharge ? '+' : '-'}
                          {rule.adjustmentValue}
                          {rule.adjustmentType === 'PERCENTAGE' ? '%' : ' đ'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Thời gian:</span>
                        <span className="font-medium text-slate-700">
                          {rule.startDate} {'->'} {rule.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Ưu tiên (Priority):</span>
                        <span className="font-bold text-slate-800 px-1.5 py-0.5 bg-slate-200 rounded text-2xs">
                          Mức {rule.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Phạm vi:</span>
                        <span className="font-medium text-slate-700">
                          {rule.scope === 'ALL_ROUTES' ? 'Toàn mạng lưới' : (rule.routeName ? rule.routeName : (rule.routeId ? `Tuyến xe #${rule.routeId}` : `Tuyến xe #${rule.targetRouteId || 'Cụ thể'}`))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions bottom */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-2xs truncate max-w-[150px]">
                      {rule.applicableDays ? (rule.applicableDays === 'ALL' ? 'Tất cả các ngày' : `Áp dụng: ${rule.applicableDays}`) : (rule.applicableDaysOfWeek ? `Áp dụng: ${rule.applicableDaysOfWeek}` : 'Tất cả các ngày')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(rule)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Chỉnh sửa quy tắc"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa quy tắc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WIDGET MÔ PHỎNG TÍNH GIÁ TRỰC TIẾP (LIVE PRICE SIMULATOR) */}
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 overflow-hidden relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Công Cụ Mô Phỏng Tính Giá Trực Tiếp (Live Price Simulator)</h2>
              <p className="text-xs text-slate-500">
                Thử nghiệm ngay kết quả tính toán của động cơ giá động (Dynamic Pricing Engine) dựa trên quy tắc đang bật
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form tham số mô phỏng */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá Vé Gốc Tham Chiếu (VNĐ)</label>
                <input
                  type="number"
                  value={simBasePrice}
                  onChange={(e) => setSimBasePrice(Number(e.target.value))}
                  placeholder="VD: 250000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời Gian Khởi Hành Dự Kiến</label>
                <input
                  type="datetime-local"
                  value={simDepartureTime}
                  onChange={(e) => setSimDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tổng Số Ghế Trên Xe</label>
                <input
                  type="number"
                  value={simTotalSeats}
                  onChange={(e) => setSimTotalSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số Ghế Còn Trống (Available Seats)</label>
                <input
                  type="number"
                  value={simAvailableSeats}
                  onChange={(e) => setSimAvailableSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-2xs text-slate-400 mt-1 block">
                  Tỷ lệ trống: {simTotalSeats > 0 ? ((simAvailableSeats / simTotalSeats) * 100).toFixed(1) : 0}% ({'>'} 50% để kích hoạt Flash Sale giờ chót)
                </span>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {simLoading ? 'Đang Mô Phỏng Tính Giá...' : 'Mô Phỏng Tính Giá Ngay'}
                </button>
              </div>
            </div>

            {/* Kết quả mô phỏng */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Kết Quả Tính Giá Động Thời Gian Thực
                </div>

                {simResult ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400">Giá sau điều chỉnh (Final Price):</span>
                      <div className="text-2xl font-black text-indigo-700">
                        {formatCurrency(simResult.calculatedPrice)}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giá vé gốc:</span>
                        <span className="font-semibold">{formatCurrency(simResult.originalPrice ?? simResult.basePrice ?? 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chênh lệch điều chỉnh:</span>
                        <span className={`font-bold ${(simResult.deltaAmount ?? simResult.adjustmentAmount ?? 0) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {(simResult.deltaAmount ?? simResult.adjustmentAmount ?? 0) >= 0 ? '+' : ''}
                          {formatCurrency(simResult.deltaAmount ?? simResult.adjustmentAmount ?? 0)}
                        </span>
                      </div>
                      {simResult.pricingBadge && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Huy hiệu hiển thị:</span>
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-indigo-100 text-indigo-800">
                            {simResult.pricingBadge}
                          </span>
                        </div>
                      )}
                      {simResult.appliedRuleName && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Quy tắc kích hoạt:</span>
                          <span className="font-bold text-slate-800 text-2xs truncate max-w-[150px]">
                            {simResult.appliedRuleName}
                          </span>
                        </div>
                      )}
                    </div>

                    {(simResult.explanation || simResult.ruleDescription) && (
                      <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 text-2xs text-indigo-900">
                        <strong>Thông báo khách hàng:</strong> {simResult.explanation || simResult.ruleDescription}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Nhập thông số và bấm "Mô Phỏng Tính Giá Ngay" để xem trước kết quả
                  </div>
                )}
              </div>

              <div className="text-2xs text-slate-400 border-t border-slate-200 pt-2 mt-2">
                Áp dụng động cơ giá độc quyền (Non-stacking) & làm tròn thương mại 1.000 VNĐ.
              </div>
            </div>
          </div>
        </div>

        {/* MODAL TẠO / CHỈNH SỬA QUY TẮC GIÁ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  {editingRuleId ? 'Chỉnh Sửa Quy Tắc Giá Vé' : 'Thêm Chính Sách Giá Vé Mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
                {/* Tên quy tắc */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên Quy Tắc Chính Sách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Phụ thu cao điểm Lễ Quốc Khánh 2/9, Flash Sale giờ chót..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>

                {/* Loại quy tắc & Mức ưu tiên */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Loại Quy Tắc</label>
                    <select
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value as PricingRuleType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="HOLIDAY_SURCHARGE">Phụ thu Lễ Tết (+20%)</option>
                      <option value="WEEKEND_SURCHARGE">Phụ thu Cuối tuần (+10%)</option>
                      <option value="FLASH_SALE">Flash Sale Giờ Chót (-15%)</option>
                      <option value="CUSTOM">Tùy Chỉnh Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mức Ưu Tiên (Priority)</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      placeholder="100 = Cao nhất"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                {/* Hình thức điều chỉnh & Giá trị */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hình Thức Điều Chỉnh</label>
                    <select
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="PERCENTAGE">Theo Tỷ Lệ Phần Trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số Tiền Cố Định (VNĐ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mức Điều Chỉnh ({adjustmentType === 'PERCENTAGE' ? '%' : 'VNĐ'})
                    </label>
                    <input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Từ ngày - Đến ngày */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Từ Ngày</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Đến Ngày</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                {/* Các thứ áp dụng trong tuần */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Thứ Trong Tuần Áp Dụng</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(d => {
                      const isSelected = selectedDays.includes(d.key);
                      return (
                        <button
                          key={d.key}
                          type="button"
                          onClick={() => toggleDayOfWeek(d.key)}
                          className={`px-2.5 py-1 rounded text-2xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phạm vi áp dụng */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phạm Vi Áp Dụng</label>
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as PricingRuleScope)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="ALL_ROUTES">Toàn Mạng Lưới (Tất Cả Tuyến)</option>
                      <option value="SPECIFIC_ROUTE">Theo Tuyến Cụ Thể</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mã Tuyến (Nếu có)</label>
                    <input
                      type="number"
                      disabled={scope !== 'SPECIFIC_ROUTE'}
                      value={targetRouteId}
                      onChange={(e) => setTargetRouteId(e.target.value)}
                      placeholder="VD: 101"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100 text-slate-800"
                    />
                  </div>
                </div>

                {/* Ghi chú giải thích */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Giải Thích Minh Bạch</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả lý do phụ thu để hệ thống giải trình minh bạch cho hành khách khi thanh toán vé..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  />
                </div>

                {/* Actions modal */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition-all"
                  >
                    {formSubmitting ? 'Đang Lưu...' : (editingRuleId ? 'Cập Nhật Quy Tắc' : 'Lưu Quy Tắc')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPricingRulesPage;
