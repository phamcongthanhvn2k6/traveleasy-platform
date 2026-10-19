import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { HomePage } from './pages/HomePage';
import { TicketLookupPage } from './pages/TicketLookupPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lookup" element={<TicketLookupPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </main>
        <AiAssistantWidget />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
