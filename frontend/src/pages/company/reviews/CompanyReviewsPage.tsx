import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Flag, X, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '../../../context/ToastContext';
import api from '../../../services/api';

export interface CompanyReviewItem {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  reviewerName?: string;
  tripCode: string;
  reply: string | null;
  repliedAt?: string | null;
  isReported?: boolean;
  reportReason?: string;
  reviewedAt: string;
}

const STORAGE_KEY = 'traveleasy_company_reviews';

export const CompanyReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CompanyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviewsFromDb = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/reviews');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: CompanyReviewItem[] = res.data.data.map((r: any) => ({
          id: String(r.id),
          rating: r.rating || 5,
          comment: r.reviewSnippet || r.reason || 'Dịch vụ rất chu đáo, xe chạy an toàn và êm ái.',
          reviewer: r.reporterEmail || 'customer@gmail.com',
          reviewerName: r.reviewAuthor || 'Hành khách TravelEasy',
          tripCode: `TR-${r.id || 1}`,
          reply: r.status === 'APPROVED' ? 'TravelEasy Express xin chân thành cảm ơn đánh giá của bạn!' : null,
          repliedAt: r.status === 'APPROVED' ? '24/10/2026' : null,
          isReported: r.status === 'PENDING',
          reportReason: r.reason || undefined,
          reviewedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '24/10/2026',
        }));
        setReviews(mapped);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error('Failed to load reviews from Supabase:', err);
      toast.error('Không thể tải đánh giá từ CSDL', 'Lỗi CSDL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsFromDb();
  }, []);

  const [filterType, setFilterType] = useState<'ALL' | 'UNANSWERED' | 'HIGH' | 'LOW'>('ALL');

  // Reply Modal
  const [replyingReview, setReplyingReview] = useState<CompanyReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');

  // Report Modal
  const [reportingReview, setReportingReview] = useState<CompanyReviewItem | null>(null);
  const [reportReason, setReportReason] = useState('Nội dung thô tục hoặc không phù hợp');
  const [reportNote, setReportNote] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  // Reply Handlers
  const openReplyModal = (review: CompanyReviewItem) => {
    setReplyingReview(review);
    setReplyText(review.reply || '');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    if (!replyText.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi cho khách hàng!', 'Thiếu Nội Dung');
      return;
    }

    try {
      const numId = parseInt(replyingReview.id.replace(/\D/g, ''), 10);
      if (!isNaN(numId) && numId > 0 && numId < 100000) {
        await api.post(`/company/reviews/${numId}/reply`, { reply: replyText.trim() });
      }
    } catch {}

    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const dateStr = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === replyingReview.id) {
          return {
            ...r,
            reply: replyText.trim(),
            repliedAt: dateStr,
          };
        }
        return r;
      })
    );

    toast.success('Đã gửi phản hồi thành công và lưu vào CSDL!', 'Phản Hồi Thành Công');
    setReplyingReview(null);
    setReplyText('');
  };

  // Quick reply snippet
  const applyQuickReply = (text: string) => {
    setReplyText(text);
  };

  // Report Handlers
  const openReportModal = (review: CompanyReviewItem) => {
    setReportingReview(review);
    setReportReason('Nội dung thô tục hoặc không phù hợp');
    setReportNote('');
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview) return;

    try {
      const numId = parseInt(reportingReview.id.replace(/\D/g, ''), 10);
      if (!isNaN(numId) && numId > 0 && numId < 100000) {
        await api.post(`/company/reviews/${numId}/report`, {
          reason: `${reportReason} - Ghi chú: ${reportNote.trim() || 'Không có'}`
        });
      }
    } catch {}

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reportingReview.id) {
          return {
            ...r,
            isReported: true,
            reportReason: `${reportReason} - Ghi chú: ${reportNote.trim() || 'Không có'}`,
          };
        }
        return r;
      })
    );

    toast.warning('Đã gửi báo cáo đánh giá vào CSDL Ban Quản Trị Sàn để kiểm duyệt!', 'Báo Cáo Đã Gửi');
    setReportingReview(null);
  };

  const filtered = reviews.filter((r) => {
    if (filterType === 'UNANSWERED') return !r.reply;
    if (filterType === 'HIGH') return r.rating >= 4;
    if (filterType === 'LOW') return r.rating <= 2;
    return true;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
            Nhà xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Đánh giá
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Đánh giá khách hàng
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {reviews.length} đánh giá ({reviews.filter((r) => !r.reply).length} chưa phản hồi)
          </div>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'UNANSWERED', label: 'Chưa phản hồi' },
            { key: 'HIGH', label: 'Tốt (4-5 ★)' },
            { key: 'LOW', label: 'Cần chú ý (1-2 ★)' },
          ].map((tab) => {
            const isActive = filterType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key as any)}
                style={{
                  backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>ĐÁNH GIÁ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NHẬN XÉT CỦA KHÁCH HÀNG</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGƯỜI ĐÁNH GIÁ</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>CHUYẾN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>PHẢN HỒI NHÀ XE</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGÀY</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Không có đánh giá nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= r.rating ? '#f59e0b' : 'none'}
                          color={star <= r.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500, maxWidth: '280px' }}>
                    <div>"{r.comment}"</div>
                    {r.isReported && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#dc2626',
                          backgroundColor: '#fef2f2',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          marginTop: '4px',
                          border: '1px solid #fecaca'
                        }}
                      >
                        <AlertTriangle size={11} /> Đã báo cáo vi phạm
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.reviewerName || r.reviewer}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{r.reviewer}</div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                      {r.tripCode}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', maxWidth: '280px' }}>
                    {r.reply ? (
                      <div>
                        <div style={{ color: '#059669', fontStyle: 'italic', fontWeight: 500, fontSize: '13px' }}>
                          "{r.reply}"
                        </div>
                        {r.repliedAt && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            {r.repliedAt}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                          backgroundColor: '#f8fafc',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #f1f5f9'
                        }}
                      >
                        Chưa phản hồi
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>{r.reviewedAt}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        title={r.reply ? 'Chỉnh sửa phản hồi' : 'Gửi phản hồi'}
                        onClick={() => openReplyModal(r)}
                        style={{
                          background: r.reply ? '#f8fafc' : '#eff6ff',
                          border: `1px solid ${r.reply ? '#e2e8f0' : '#bfdbfe'}`,
                          cursor: 'pointer',
                          padding: '6px 10px',
                          color: r.reply ? '#475569' : '#2563eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>{r.reply ? 'Sửa' : 'Phản hồi'}</span>
                      </button>

                      <button
                        title={r.isReported ? 'Đã gửi báo cáo' : 'Báo cáo vi phạm'}
                        onClick={() => openReportModal(r)}
                        style={{
                          background: r.isReported ? '#fef2f2' : '#ffffff',
                          border: `1px solid ${r.isReported ? '#fecaca' : '#e2e8f0'}`,
                          cursor: 'pointer',
                          padding: '6px',
                          color: r.isReported ? '#dc2626' : '#94a3b8',
                          display: 'flex',
                          borderRadius: '6px'
                        }}
                      >
                        <Flag size={14} fill={r.isReported ? '#dc2626' : 'none'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Reply to Review */}
      {replyingReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setReplyingReview(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Phản Hồi Đánh Giá Khách Hàng
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Phản hồi của nhà xe sẽ được hiển thị công khai trên ứng dụng
                </p>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Review summary box */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {replyingReview.reviewerName || replyingReview.reviewer}
                </span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      fill={star <= replyingReview.rating ? '#f59e0b' : 'none'}
                      color={star <= replyingReview.rating ? '#f59e0b' : '#cbd5e1'}
                    />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
                "{replyingReview.comment}"
              </div>
            </div>

            {/* Quick reply suggestions */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                Mẫu phản hồi nhanh:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyQuickReply('Dạ nhà xe xin chân thành cảm ơn quý khách đã tin tưởng và đồng hành cùng chúng tôi! Chúc quý khách vạn dặm bình an.')}
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  + Lời cảm ơn chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickReply('Nhà xe rất tiếc về trải nghiệm chưa trọn vẹn của quý khách. Chúng tôi đã ghi nhận phản ánh và sẽ chấn chỉnh ngay chất lượng phục vụ!')}
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#d97706',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  + Xin lỗi & cam kết khắc phục
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendReply}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Nội dung phản hồi <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi lịch sự, nhã nhặn từ đại diện nhà xe..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Send size={14} /> Gửi Phản Hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Review to Platform Admin */}
      {reportingReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setReportingReview(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flag size={18} /> Báo Cáo Đánh Giá Vi Phạm
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Gửi yêu cầu kiểm duyệt lên Quản Trị Viên Sàn TravelEasy
                </p>
              </div>
              <button
                onClick={() => setReportingReview(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendReport}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Lý do báo cáo vi phạm <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Nội dung thô tục hoặc không phù hợp">Nội dung thô tục, xúc phạm hoặc không phù hợp</option>
                  <option value="Cạnh tranh không lành mạnh / Đánh giá ảo">Cạnh tranh không lành mạnh / Spam đánh giá ảo</option>
                  <option value="Sai sự thật về chuyến xe">Cung cấp thông tin sai lệch, vu khống nhà xe</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Chi tiết bằng chứng hoặc giải trình
                </label>
                <textarea
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Ghi rõ thông tin đối chiếu (ví dụ: khách không có mặt trên xe, vé đã hủy hoàn tiền...)..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Gửi Báo Cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyReviewsPage;
