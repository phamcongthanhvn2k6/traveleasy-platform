import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { AdminRoutes } from './routes/adminRoutes';
import { ClientRoutes } from './routes/clientRoutes';

/**
 * =========================================================================
 * ROOT ROUTER ORCHESTRATOR — TRAVEL EASY PLATFORM
 * Kiến trúc điều hướng phân luồng độc lập, triệt tiêu xung đột code (Zero Merge Conflict)
 * - /admin/*  -> AdminRoutes (Do Phạm Công Thành - Nhóm trưởng quản lý)
 * - /*        -> ClientRoutes (Do 5 thành viên còn lại phụ trách phần Users)
 * =========================================================================
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Phân hệ 1: Quản trị hệ thống & Nhà xe (Admin Portal) */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Phân hệ 2: Khách hàng & Đặt vé trực tuyến (Users/Client Portal) */}
            <Route path="/*" element={<ClientRoutes />} />
          </Routes>
        </main>
        <AiAssistantWidget />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
