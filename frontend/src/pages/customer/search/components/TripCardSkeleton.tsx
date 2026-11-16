import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { Skeleton } from '../../../../components/common/Skeleton';

interface TripCardSkeletonProps {
  count?: number;
}

export const TripCardSkeleton: React.FC<TripCardSkeletonProps> = ({ count = 3 }) => {
  const { isDark } = useTheme();

  return (
    <div
      className="trip-card-skeleton-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`trip-skeleton-${index}`}
          style={{
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderRadius: '14px',
            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            padding: '20px 24px',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 12px -2px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Main 3-column Grid matching TripResultCard */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 2fr 1.1fr',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            {/* Column 1: Bus Company Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Skeleton
                  width="36px"
                  height="36px"
                  rounded="rounded-lg"
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Skeleton
                    width="70%"
                    height="18px"
                    rounded="rounded-md"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginBottom: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Skeleton
                  width="110px"
                  height="20px"
                  rounded="rounded"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
                />
                <Skeleton
                  width="50px"
                  height="20px"
                  rounded="rounded"
                  style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
                />
              </div>

              <Skeleton
                width="140px"
                height="14px"
                rounded="rounded"
                style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
              />
            </div>

            {/* Column 2: Timeline & Journey */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Departure */}
                <div style={{ width: '80px' }}>
                  <Skeleton
                    width="65px"
                    height="24px"
                    rounded="rounded-md"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginBottom: '6px' }}
                  />
                  <Skeleton
                    width="80px"
                    height="14px"
                    rounded="rounded"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
                  />
                </div>

                {/* Arrow / Distance Shimmer Indicator */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    padding: '0 16px',
                  }}
                >
                  <Skeleton
                    width="90px"
                    height="12px"
                    rounded="rounded"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginBottom: '6px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '6px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#334155' : '#cbd5e1',
                        flexShrink: 0,
                      }}
                    />
                    <Skeleton
                      height="2px"
                      rounded="rounded-full"
                      style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', flex: 1 }}
                    />
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#334155' : '#cbd5e1',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  <Skeleton
                    width="60px"
                    height="10px"
                    rounded="rounded"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginTop: '6px' }}
                  />
                </div>

                {/* Arrival */}
                <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Skeleton
                    width="65px"
                    height="24px"
                    rounded="rounded-md"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginBottom: '6px' }}
                  />
                  <Skeleton
                    width="80px"
                    height="14px"
                    rounded="rounded"
                    style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Price & Action Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Skeleton
                width="120px"
                height="26px"
                rounded="rounded-md"
                style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginBottom: '6px' }}
              />
              <Skeleton
                width="90px"
                height="14px"
                rounded="rounded"
                style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0', marginBottom: '12px' }}
              />
              <Skeleton
                width="118px"
                height="38px"
                rounded="rounded-lg"
                style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
              />
            </div>
          </div>

          {/* Quick links footer row shimmer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <Skeleton width="80px" height="12px" rounded="rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
              <Skeleton width="80px" height="12px" rounded="rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
              <Skeleton width="90px" height="12px" rounded="rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
            </div>
            <Skeleton width="100px" height="12px" rounded="rounded" style={{ backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripCardSkeleton;
