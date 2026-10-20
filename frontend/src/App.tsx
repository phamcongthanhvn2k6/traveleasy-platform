import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { AdminRoutes } from './routes/adminRoutes';
import { CompanyRoutes } from './routes/companyRoutes';
import { ClientRoutes } from './routes/clientRoutes';

/**
 * =========================================================================
 * ROOT ROUTER ORCHESTRATOR — TRAVEL EASY PLATFORM
 * Kiến trúc điều hướng phân luồng độc lập, triệt tiêu xung đột code (Zero Merge Conflict)
 * - /admin/*   -> AdminRoutes (Hệ thống quản trị VeXeRe Admin - Dark Navy)
 * - /company/* -> CompanyRoutes (Cổng đối tác nhà xe FUTA Operator)
 * - /*         -> ClientRoutes (Cổng người dùng & khách hàng đặt vé)
 * =========================================================================
 */
const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCompany = location.pathname.startsWith('/company');

  if (isAdmin) {
    return <AdminRoutes />;
  }

  if (isCompany) {
    return <CompanyRoutes />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <ClientRoutes />
      </main>
      <AiAssistantWidget />
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
