import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Gift,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Percent,
  TrendingUp,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  X,
  PlusCircle,
  Check,
  Filter
} from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { TableSkeleton } from '../../../components/common/Skeleton';

export interface PromotionItem {
  id: number;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit: number;
  usedCount: number;
  category: string;
  applicableOrigin?: string;
  applicableDestination?: string;
  badgeText?: string;
  terms?: string;
  isActive: boolean;
  createdAt?: string;
}

export const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);

  // Modal State for Quota Adjustment (Cấp thêm lượt dùng)
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaTarget, setQuotaTarget] = useState<PromotionItem | null>(null);
  const [addQuotaAmount, setAddQuotaAmount] = useState<number>(100);
  const [submittingQuota, setSubmittingQuota] = useState(false);

  // Form State
  const initialFormState = {
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    minOrderValue: 200000,
    maxDiscount: 50000,
    usageLimit: 500,
    category: 'ALL',
    applicableOrigin: '',
    applicableDestination: '',
    badgeText: 'GIẢM 10%',
    terms: 'Áp dụng cho mọi vé xe đặt trực tuyến trên sàn TravelEasy.',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch Promotions from Backend
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/promotions', {
        params: {
          search: search.trim() || undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setPromotions(res.data.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách khuyến mại:', err);
      toast.error('Không thể tải dữ liệu khuyến mại từ máy chủ!', 'Lỗi Kết Nối');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedPromoId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: PromotionItem) => {
    setIsEditing(true);
    setSelectedPromoId(item.id);
    setFormData({
      code: item.code,
      title: item.title,
      description: item.description || '',
      discountType: item.discountType,
      discountValue: item.discountValue,
      minOrderValue: item.minOrderValue || 0,
      maxDiscount: item.maxDiscount || 0,
      usageLimit: item.usageLimit,
      category: item.category || 'ALL',
      applicableOrigin: item.applicableOrigin || '',
      applicableDestination: item.applicableDestination || '',
      badgeText: item.badgeText || '',
      terms: item.terms || '',
      startDate: item.startDate ? item.startDate.slice(0, 16) : '',
      endDate: item.endDate ? item.endDate.slice(0, 16) : '',
      isActive: Boolean(item.isActive),
    });
    setIsModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã khuyến mại!', 'Thiếu Thông Tin');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khuyến mại!', 'Thiếu Thông Tin');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && selectedPromoId) {
        await api.put(`/admin/promotions/${selectedPromoId}`, formData);
        toast.success(`Đã cập nhật mã khuyến mại [${formData.code.toUpperCase()}] thành công!`, 'Cập Nhật');
      } else {
        await api.post('/admin/promotions', formData);
        toast.success(`Đã tạo mới mã khuyến mại [${formData.code.toUpperCase()}] thành công!`, 'Tạo Thành Công');
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu mã khuyến mại!', 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Active/Inactive
  const handleToggleStatus = async (item: PromotionItem) => {
    try {
      const res = await api.patch(`/admin/promotions/${item.id}/toggle-status`);
      const updated = res.data?.data;
      toast.info(res.data?.message || `Đã thay đổi trạng thái mã [${item.code}]`, 'Trạng Thái');
      setPromotions((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isActive: updated?.isActive ?? !p.isActive } : p))
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật trạng thái!', 'Lỗi');
    }
  };

  // Open Quota Grant Modal
  const handleOpenQuotaModal = (item: PromotionItem) => {
    setQuotaTarget(item);
    setAddQuotaAmount(100);
    setIsQuotaModalOpen(true);
  };

  // Submit Grant Quota
  const handleSubmitQuota = async () => {
    if (!quotaTarget || addQuotaAmount <= 0) {
      toast.error('Số lượng lượt cấp thêm phải lớn hơn 0!', 'Lỗi');
      return;
    }
    setSubmittingQuota(true);
    try {
      const res = await api.patch(`/admin/promotions/${quotaTarget.id}/adjust-quota`, {
        addAmount: addQuotaAmount,
      });
      toast.success(res.data?.message || `Đã cấp thêm +${addQuotaAmount} lượt cho mã [${quotaTarget.code}]!`, 'Cấp Lượt Thành Công');
      setIsQuotaModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi cấp thêm lượt!', 'Lỗi');
    } finally {
      setSubmittingQuota(false);
    }
  };

  // Delete Promo
  const handleDeletePromo = async (item: PromotionItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mã khuyến mại [${item.code}] khỏi hệ thống?`)) {
      return;
    }
    try {
      await api.delete(`/admin/promotions/${item.id}`);
      toast.success(`Đã xóa mã khuyến mại [${item.code}] thành công!`, 'Đã Xóa');
      setPromotions((prev) => prev.filter((p) => p.id !== item.id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể xóa mã khuyến mại!', 'Lỗi');
    }
  };

  // Stats calculation
  const totalPromos = promotions.length;
  const activePromos = promotions.filter((p) => p.isActive).length;
  const totalUsed = promotions.reduce((acc, p) => acc + (p.usedCount || 0), 0);
  const totalLimit = promotions.reduce((acc, p) => acc + (p.usageLimit || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-600 text-white rounded-xl shadow-md">
            <Tag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Quản Lý Chương Trình Khuyến Mại & Voucher Sàn
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 rounded-full">
                Admin Central
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cấu hình mã giảm giá, kiểm soát hạn mức, cơ chế tự động trừ khi đặt vé và cấp thêm lượt sử dụng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPromotions}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo Mã Ưu Đãi Mới
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Chiến Dịch
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalPromos}
            </span>
            <span className="text-xs text-slate-400">chương trình</span>
          </div>
          <span className="text-xs text-blue-600 font-medium mt-1 block">
            Bao gồm mọi mã toàn sàn
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đang Hoạt Động
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              {activePromos}
            </span>
            <span className="text-xs text-slate-400">/{totalPromos} mã</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            Khách có thể áp dụng ngay
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lượt Đã Dùng
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {totalUsed.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">lượt</span>
          </div>
          <span className="text-xs text-amber-600 font-medium mt-1 block">
            Tự động trừ khi khách đặt vé
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Hạn Mức Cấp
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">
              {totalLimit.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-400">hạn ngạch</span>
          </div>
          <span className="text-xs text-purple-600 font-medium mt-1 block">
            Có thể cấp thêm bất kỳ lúc nào
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo mã (SAPA20, DALATVIP...), tiêu đề hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Mọi Danh Mục</option>
              <option value="HOT_ROUTE">Tuyến Đường Hot</option>
              <option value="NEW_CUSTOMER">Khách Hàng Mới</option>
              <option value="ONLINE_PAYMENT">Thanh Toán Online (PayOS)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Mọi Trạng Thái</option>
              <option value="ACTIVE">Đang Hoạt Động</option>
              <option value="INACTIVE">Tạm Dừng</option>
              <option value="EXPIRED">Đã Quá Hạn</option>
              <option value="DEPLETED">Đã Hết Lượt</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Table of Promotions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Mã & Chiến Dịch</th>
                <th className="p-4">Mức Giảm</th>
                <th className="p-4">Điều Kiện Áp Dụng</th>
                <th className="p-4">Tiến Độ Sử Dụng</th>
                <th className="p-4">Thời Hạn</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <TableSkeleton rows={5} columns={7} />
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Tag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Không tìm thấy mã khuyến mại nào phù hợp
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Hãy tạo mã ưu đãi mới để kích cầu đặt vé cho các tuyến xe liên tỉnh.
                    </p>
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => {
                  const used = promo.usedCount || 0;
                  const limit = promo.usageLimit || 1;
                  const percent = Math.min(100, Math.round((used / limit) * 100));
                  const isDepleted = used >= limit;

                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* Code & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-mono font-bold text-xs rounded-lg border border-orange-200 dark:border-orange-800">
                            {promo.code}
                          </span>
                          {promo.badgeText && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold rounded">
                              {promo.badgeText}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white mt-1">
                          {promo.title}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                          {promo.description}
                        </div>
                      </td>

                      {/* Discount Amount */}
                      <td className="p-4">
                        {promo.discountType === 'PERCENT' ? (
                          <div>
                            <span className="font-bold text-orange-600 text-base">
                              Giảm {promo.discountValue}%
                            </span>
                            {promo.maxDiscount ? (
                              <span className="text-[11px] text-slate-400 block">
                                Tối đa {Number(promo.maxDiscount).toLocaleString('vi-VN')} đ
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-emerald-600 text-base">
                              -{Number(promo.discountValue).toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-[11px] text-slate-400 block">Giảm trực tiếp</span>
                          </div>
                        )}
                      </td>

                      {/* Conditions */}
                      <td className="p-4">
                        <div className="text-xs space-y-0.5">
                          <div>
                            Đơn tối thiểu:{' '}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {promo.minOrderValue ? `${Number(promo.minOrderValue).toLocaleString('vi-VN')} đ` : '0 đ'}
                            </strong>
                          </div>
                          {promo.applicableOrigin && promo.applicableDestination ? (
                            <div className="text-blue-600 dark:text-blue-400 font-medium">
                              Tuyến: {promo.applicableOrigin} ➔ {promo.applicableDestination}
                            </div>
                          ) : (
                            <div className="text-slate-400">Toàn bộ tuyến xe</div>
                          )}
                        </div>
                      </td>

                      {/* Usage Progress */}
                      <td className="p-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {used.toLocaleString('vi-VN')} / {limit.toLocaleString('vi-VN')}
                          </span>
                          <span className={`font-bold ${isDepleted ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDepleted
                                ? 'bg-rose-500'
                                : percent > 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {isDepleted && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">
                            ⚠️ Đã hết lượt dùng!
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          HSD:{' '}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(promo)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                            promo.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${promo.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {promo.isActive ? 'Kích Hoạt' : 'Tạm Dừng'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Cấp thêm lượt */}
                          <button
                            onClick={() => handleOpenQuotaModal(promo)}
                            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            title="Cấp thêm lượt dùng cho voucher"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            +Lượt
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            onClick={() => handleOpenEdit(promo)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Chỉnh sửa voucher"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Xóa */}
                          <button
                            onClick={() => handleDeletePromo(promo)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Xóa voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: TẠO MỚI / CHỈNH SỬA VOUCHER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isEditing ? 'Chỉnh Sửa Chương Trình Khuyến Mại' : 'Tạo Mã Khuyến Mại Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thiết lập quy tắc giảm giá, số lượt phát hành và đối tượng áp dụng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Code & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Voucher (Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SAPA20, DALATVIP..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nhóm Khách Hàng / Danh Mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white cursor-pointer"
                  >
                    <option value="ALL">Toàn Bộ Khách Hàng (Tất Cả)</option>
                    <option value="NEW_CUSTOMER">Khách Mới Đăng Ký (Chào Bạn Mới)</option>
                    <option value="HOT_ROUTE">Tuyến Đường Hot (Sa Pa, Đà Lạt...)</option>
                    <option value="ONLINE_PAYMENT">Thanh Toán Online (PayOS / VietQR)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Title & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu Đề Khuyến Mại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Giảm 20% Vé Đi Sa Pa Mùa Thu Vàng"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Huy Hiệu (Badge Text)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: GIẢM 20%, GIẢM 50K..."
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Discount Type & Value & Max Discount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Loại Giảm Giá
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENT' | 'FIXED' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white cursor-pointer"
                  >
                    <option value="PERCENT">Phần Trăm (%)</option>
                    <option value="FIXED">Số Tiền Cố Định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mức Giảm ({formData.discountType === 'PERCENT' ? '%' : 'VNĐ'}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giảm Tối Đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Không giới hạn"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 4: Min Order & Usage Limit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giá Trị Đơn Tối Thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hạn Mức Phát Hành (Lượt Dùng) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Route Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm Xuất Phát (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Hà Nội, TP. Hồ Chí Minh..."
                    value={formData.applicableOrigin}
                    onChange={(e) => setFormData({ ...formData, applicableOrigin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm Đến (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Sa Pa, Đà Lạt, Nha Trang..."
                    value={formData.applicableDestination}
                    onChange={(e) => setFormData({ ...formData, applicableDestination: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 6: Description & Terms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô Tả Chương Trình
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả quyền lợi và đối tượng khách hàng..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                />
              </div>

              {/* Row 7: Validity Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thời Gian Bắt Đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Thời Gian Kết Thúc (HSD)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Kích hoạt chương trình ngay sau khi lưu
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Lưu Thay Đổi' : 'Tạo Khuyến Mại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CẤP THÊM LƯỢT DÙNG (GRANT QUOTA) */}
      {isQuotaModalOpen && quotaTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Cấp Thêm Lượt Dùng Voucher
                </h3>
              </div>
              <button
                onClick={() => setIsQuotaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-800 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Mã khuyến mại:</div>
              <div className="font-mono font-bold text-base text-orange-600">
                {quotaTarget.code} — {quotaTarget.title}
              </div>
              <div className="text-xs text-slate-500 pt-1">
                Hiện tại:{' '}
                <strong>
                  {quotaTarget.usedCount} / {quotaTarget.usageLimit} lượt
                </strong>{' '}
                (Còn {Math.max(0, quotaTarget.usageLimit - quotaTarget.usedCount)} lượt)
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Chọn Nhanh Số Lượng Cấp Thêm:
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddQuotaAmount(amt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      addQuotaAmount === amt
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hoặc Nhập Số Lượng Tùy Chỉnh:
              </label>
              <input
                type="number"
                min="1"
                value={addQuotaAmount}
                onChange={(e) => setAddQuotaAmount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Hạn mức sau khi cấp:{' '}
                <strong className="text-emerald-600">
                  {quotaTarget.usageLimit + addQuotaAmount} lượt
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={submittingQuota}
                onClick={handleSubmitQuota}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Xác Nhận Cấp Lượt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotionsPage;

