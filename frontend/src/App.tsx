import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { AdminRoutes } from './routes/adminRoutes';
import { CompanyRoutes } from './routes/companyRoutes';
import { ClientRoutes } from './routes/clientRoutes';
import { ToastProvider } from './context/ToastContext';

/**
 * =========================================================================
 * ROOT ROUTER ORCHESTRATOR — TRAVEL EASY PLATFORM
 * Kiến trúc điều hướng phân luồng độc lập, triệt tiêu xung đột code (Zero Merge Conflict)
 * - /admin/*   -> AdminRoutes (Cổng quản trị TravelEasy Admin - Dark Navy)
 * - /company/* -> CompanyRoutes (Cổng đối tác nhà xe TravelEasy Partner)
 * - /*         -> ClientRoutes (Cổng người dùng & khách hàng đặt vé)
 * =========================================================================
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* 1. Phân hệ Quản trị tối cao (Admin Portal) */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* 2. Phân hệ Đối tác nhà xe (Company Partner Portal) */}
          <Route path="/company/*" element={<CompanyRoutes />} />

          {/* 3. Phân hệ Người dùng & Khách hàng đặt vé (Client Portal) */}
          <Route
            path="/*"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <ClientRoutes />
                </main>
                <AiAssistantWidget />
                <Footer />
              </div>
            }
          />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
