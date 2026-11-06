import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  showLoading: (msg?: string) => void;
  hideLoading: () => void;
  progress: number;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: '',
  showLoading: () => {},
  hideLoading: () => {},
  progress: 0,
});

export const useLoading = () => useContext(LoadingContext);

const ROUTE_MESSAGES: Record<string, string> = {
  '/': 'Đang tải trang chủ & tìm kiếm hành trình...',
  '/search': 'Đang tìm kiếm chuyến xe & cập nhật giá tốt nhất...',
  '/checkout': 'Đang kết nối giữ chỗ & chuẩn bị thanh toán...',
  '/my-tickets': 'Đang tải danh sách vé điện tử của bạn...',
  '/lookup': 'Đang tra cứu thông tin vé điện tử...',
  '/profile': 'Đang đồng bộ thông tin tài khoản...',
  '/schedule': 'Đang nạp bảng lịch trình xe toàn quốc...',
  '/admin': 'Đang bảo mật truy cập cổng quản trị Admin...',
  '/company': 'Đang kết nối cổng đối tác nhà xe...',
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<any>(null);
  const minTimerRef = useRef<any>(null);
  const isFirstMount = useRef(true);

  // Kích hoạt animation thanh tiến trình mượt mà
  const startProgress = () => {
    setProgress(15);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimerRef.current);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15 + 8);
      });
    }, 80);
  };

  const completeProgress = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 250);
  };

  const showLoading = (customMsg?: string) => {
    setMessage(customMsg || 'Đang nạp dữ liệu hệ thống...');
    setIsLoading(true);
    startProgress();
  };

  const hideLoading = () => {
    completeProgress();
  };

  // Tự động kích hoạt màn hình chuyển cảnh mượt mà khi đổi Route (đổi URL)
  useEffect(() => {
    // Bỏ qua lần nạp ban đầu nếu đã tải
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Xác định thông điệp ngữ cảnh theo đường dẫn đích
    const path = location.pathname;
    let contextMsg = 'TravelEasy - Khởi hành êm ái, vạn dặm an tâm...';
    for (const [routePrefix, msg] of Object.entries(ROUTE_MESSAGES)) {
      if (path === routePrefix || (routePrefix !== '/' && path.startsWith(routePrefix))) {
        contextMsg = msg;
        break;
      }
    }

    setMessage(contextMsg);
    setIsLoading(true);
    startProgress();

    // Giữ màn hình loading tối thiểu 380ms để data ngầm kịp hydrate và hiệu ứng chuyển cảnh mềm mại
    if (minTimerRef.current) clearTimeout(minTimerRef.current);
    minTimerRef.current = setTimeout(() => {
      completeProgress();
    }, 380);

    return () => {
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [location.pathname, location.search]);

  return (
    <LoadingContext.Provider value={{ isLoading, message, showLoading, hideLoading, progress }}>
      {children}
    </LoadingContext.Provider>
  );
};

