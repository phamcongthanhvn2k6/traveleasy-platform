import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  style?: React.CSSProperties;
}

/**
 * Hiệu ứng Skeleton Loading Shimmer mượt mà, chuẩn UI/UX cao cấp
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded-lg',
  style = {},
}) => {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      style={{
        width: width !== undefined ? width : '100%',
        height: height !== undefined ? height : '1rem',
        backgroundColor: '#e2e8f0',
        backgroundImage: 'linear-gradient(90deg, rgba(226, 232, 240, 0.7) 0%, rgba(241, 245, 249, 1) 50%, rgba(226, 232, 240, 0.7) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes skeleton-pulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Skeleton Table cho danh sách chuyến xe / bảng dữ liệu công ty
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 6,
  columns = 8,
}) => {
  return (
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
          <td className="p-4">
            <Skeleton width="75px" height="22px" rounded="rounded-md" />
          </td>
          <td className="p-4">
            <div className="space-y-1.5">
              <Skeleton width="160px" height="16px" rounded="rounded" />
              <Skeleton width="90px" height="12px" rounded="rounded" />
            </div>
          </td>
          <td className="p-4">
            <Skeleton width="85px" height="22px" rounded="rounded-full" />
          </td>
          <td className="p-4">
            <div className="space-y-1">
              <Skeleton width="110px" height="14px" rounded="rounded" />
              <Skeleton width="60px" height="11px" rounded="rounded" />
            </div>
          </td>
          <td className="p-4">
            <Skeleton width="90px" height="18px" rounded="rounded" />
          </td>
          <td className="p-4">
            <Skeleton width="45px" height="18px" rounded="rounded" />
          </td>
          <td className="p-4">
            <Skeleton width="80px" height="24px" rounded="rounded-lg" />
          </td>
          <td className="p-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Skeleton width="80px" height="28px" rounded="rounded-lg" />
              <Skeleton width="60px" height="28px" rounded="rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

/**
 * Skeleton cho các thẻ chỉ số KPI Dashboard
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton width="100px" height="14px" rounded="rounded" />
            <Skeleton width="36px" height="36px" rounded="rounded-xl" />
          </div>
          <Skeleton width="130px" height="28px" rounded="rounded-lg" />
          <Skeleton width="90px" height="12px" rounded="rounded" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
