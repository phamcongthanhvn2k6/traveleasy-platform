import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ChatbotWidget } from './components/ai/ChatbotWidget';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-gray-50">
        <div>
          <Header onOpenCart={() => setIsCartOpen(true)} />
          <main>
            <AppRoutes />
          </main>
        </div>
        <Footer />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  );
};

export default App;
