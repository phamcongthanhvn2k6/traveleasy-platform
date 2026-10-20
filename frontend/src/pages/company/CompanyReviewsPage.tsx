import React from 'react';
import { Star, MessageSquare, Flag } from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  tripCode: string;
  reply: string | null;
  reviewedAt: string;
}

export const CompanyReviewsPage: React.FC = () => {
  const reviews: ReviewItem[] = [
    {
      id: 'rev1',
      rating: 5,
      comment: '"Ve on lam, xe sach se!"',
      reviewer: 'tran.b@example.com',
      tripCode: 't4',
      reply: '"Cam on quy khach!"',
      reviewedAt: '23:00 20/09/2026',
    },
    {
      id: 'rev2',
      rating: 4,
      comment: '"Tot nhung muon mot chut."',
      reviewer: 'nguyen.a@example.com',
      tripCode: 't4',
      reply: null,
      reviewedAt: '00:00 21/09/2026',
    },
    {
      id: 'rev3',
      rating: 1,
      comment: '"Huy chuyen bat ngo, rat that long!"',
      reviewer: 'locked@example.com',
      tripCode: 't5',
      reply: null,
      reviewedAt: '02:00 20/09/2026',
    },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb & Header Title */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Nha xe <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span> Danh gia
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
          Danh gia khach hang
        </h1>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          {reviews.length} danh gia
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
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>DANH GIA</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NHAN XET</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGUOI DANH GIA</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>CHUYEN</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>PHAN HOI</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px' }}>NGAY</th>
              <th style={{ padding: '12px 18px', color: '#64748b', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
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
                <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>{r.comment}</td>
                <td style={{ padding: '14px 18px', color: '#475569' }}>{r.reviewer}</td>
                <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>{r.tripCode}</td>
                <td style={{ padding: '14px 18px' }}>
                  {r.reply ? (
                    <span style={{ color: '#059669', fontStyle: 'italic', fontWeight: 500 }}>{r.reply}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Chua phan hoi</span>
                  )}
                </td>
                <td style={{ padding: '14px 18px', color: '#64748b' }}>{r.reviewedAt}</td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      title="Phan hoi"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748b',
                        display: 'flex',
                        borderRadius: '4px'
                      }}
                    >
                      <MessageSquare size={15} />
                    </button>
                    <button
                      title="Bao cao"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748b',
                        display: 'flex',
                        borderRadius: '4px'
                      }}
                    >
                      <Flag size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyReviewsPage;
