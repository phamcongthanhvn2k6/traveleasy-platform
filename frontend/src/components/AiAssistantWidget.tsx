import React, { useState } from 'react';
import api from '../services/api';
import { Bot, X, Send, Sparkles } from 'lucide-react';

export const AiAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Xin chào! Tôi là Trợ lý AI TravelEasy. Bạn cần tư vấn kinh nghiệm du lịch, chọn vị trí giường nằm chống say hay tra cứu tuyến xe nào?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Xin lỗi, trợ lý AI hiện đang bận. Vui lòng thử lại sau!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#2563eb',
            color: '#fff',
            borderRadius: '50px',
            padding: '14px 20px',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '14px',
            zIndex: 90,
            cursor: 'pointer'
          }}
        >
          <Bot size={20} />
          <span>Hỏi Trợ Lý AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '360px',
          height: '500px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 90,
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Trợ Lý Du Lịch AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 12px', backgroundColor: '#eff6ff', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <button 
              onClick={() => handleSend('Xe Sài Gòn đi Đà Lạt?')}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#fff', color: '#1e40af' }}>
              Sài Gòn - Đà Lạt
            </button>
            <button 
              onClick={() => handleSend('Ghế nào đỡ say xe?')}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#fff', color: '#1e40af' }}>
              Ghế chống say xe
            </button>
            <button 
              onClick={() => handleSend('Chính sách huỷ vé?')}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', border: '1px solid #bfdbfe', background: '#fff', color: '#1e40af' }}>
              Chính sách hủy vé
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.sender === 'user' ? '#2563eb' : '#f1f5f9',
                  color: m.sender === 'user' ? '#fff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '13px',
                  lineHeight: 1.4
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: '12px', color: '#64748b' }}>AI đang soạn câu trả lời...</div>}
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Đặt câu hỏi cho AI..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
            <button 
              onClick={() => handleSend()}
              style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
