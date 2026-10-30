import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bot, X, Send, Sparkles, MapPin, ArrowRight, RotateCcw, MessageSquare, ChevronDown, Ticket, Copy, Check } from 'lucide-react';
import { toast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestedRoute?: string | null;
  voucherList?: Array<{ code: string; title: string; discountText: string }>;
  time: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'ai',
    text: 'Xin chào! Tôi là Trợ lý AI Thông Minh của TravelEasy 🚌✨\n\nTôi có thể giúp bạn:\n• Tìm tuyến xe khách chất lượng & giá tốt nhất\n• Tư vấn vị trí giường nằm êm ái, chống say xe\n• Giải đáp chính sách hủy/đổi vé & thanh toán VietQR/VNPAY\n\nBạn muốn khởi hành đi đâu hôm nay?',
    suggestedRoute: null,
    time: 'Vừa xong',
  },
];

const QUICK_PROMPTS = [
  { label: '🏔️ Đi Đà Lạt xe nào tốt?', query: 'Tư vấn chuyến đi Đà Lạt giúp tôi, xe nào chất lượng và êm ái nhất?' },
  { label: '🏖️ Vé xe Sài Gòn - Nha Trang?', query: 'Xe đi Nha Trang từ TP. Hồ Chí Minh giá bao nhiêu, chạy cao tốc mất mấy tiếng?' },
  { label: '🌲 Xe cabin Hà Nội - Sa Pa?', query: 'Có chuyến xe giường nằm hoặc cabin đôi nào từ Hà Nội đi Sa Pa không?' },
  { label: '💺 Chọn giường nào đỡ say xe?', query: 'Đi xe giường nằm thì nên chọn vị trí ghế nào để không bị say xe?' },
  { label: '🛡️ Chính sách hủy vé hoàn tiền?', query: 'Chính sách hủy vé và hoàn tiền của TravelEasy như thế nào?' },
  { label: '🎟️ Có mã giảm giá nào không?', query: 'Hiện tại sàn TravelEasy đang có những mã voucher ưu đãi nào?' },
];

export const AiAssistantWidget: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadPulse, setUnreadPulse] = useState(true);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}! Dán tại bước thanh toán để nhận giảm giá.`, 'Sao Chép Thành Công');
    setTimeout(() => setCopiedVoucher(null), 2500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadPulse(false);
    }
  }, [messages, isOpen]);

  const getCurrentTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend });
      const data = res.data?.data || {};

      let reply = data.reply || 'Cảm ơn bạn đã hỏi! TravelEasy luôn sẵn sàng đồng hành cùng bạn.';
      let route = data.suggestedRoute || null;

      // Extra client intelligence if general keyword matched
      const lower = textToSend.toLowerCase();
      if (!route) {
        if (lower.includes('đà lạt') || lower.includes('da lat')) {
          route = 'TP. Hồ Chí Minh -> Đà Lạt';
        } else if (lower.includes('nha trang')) {
          route = 'TP. Hồ Chí Minh -> Nha Trang';
        } else if (lower.includes('sa pa') || lower.includes('sapa') || lower.includes('lào cai')) {
          route = 'Hà Nội -> Sa Pa';
        } else if (lower.includes('vũng tàu')) {
          route = 'TP. Hồ Chí Minh -> Vũng Tàu';
        } else if (lower.includes('phan thiết') || lower.includes('mũi né')) {
          route = 'TP. Hồ Chí Minh -> Phan Thiết';
        }
      }

      let vouchers: Array<{ code: string; title: string; discountText: string }> | undefined = undefined;

      if (lower.includes('mã giảm') || lower.includes('voucher') || lower.includes('khuyến mãi') || lower.includes('ưu đãi')) {
        try {
          const promoRes = await api.get('/promotions');
          if (promoRes.data?.data && Array.isArray(promoRes.data.data)) {
            vouchers = promoRes.data.data.slice(0, 4).map((p: any) => ({
              code: p.code,
              title: p.title || p.description,
              discountText: p.discountType === 'PERCENT' ? `Giảm ${p.discountValue}%` : `Giảm ${(p.discountValue || 50000).toLocaleString('vi-VN')}đ`,
            }));
          }
        } catch (e) {
          console.warn('Could not fetch promotions for AI widget:', e);
        }

        if (!vouchers || vouchers.length === 0) {
          vouchers = [
            { code: 'SAPA20', title: 'Mùa thu vàng Sa Pa', discountText: 'Giảm 20%' },
            { code: 'DALATVIP', title: 'Thành Bưởi Limousine Đà Lạt', discountText: 'Giảm 50.000đ' },
            { code: 'WELCOME50', title: 'Ưu đãi thành viên mới', discountText: 'Giảm 50.000đ' },
            { code: 'PAYOS50', title: 'Thanh toán PayOS VietQR', discountText: 'Giảm 30.000đ' },
          ];
        }

        reply = '🎉 TravelEasy đang có các mã ưu đãi độc quyền kết nối trực tiếp từ hệ thống:\n\nBạn có thể bấm [Sao chép mã] bên dưới và nhập tại bước Thanh toán đơn vé nhé!';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        suggestedRoute: route,
        voucherList: vouchers,
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Xin chào bạn! Hệ thống trợ lý AI đang tiếp nhận rất nhiều lượt tư vấn. Đội ngũ TravelEasy luôn sẵn sàng hỗ trợ trực tiếp qua tổng đài 1900 8888 hoặc bạn có thể tìm kiếm chuyến xe ngay trên thanh tìm kiếm nhé!',
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteNavigate = (routeStr: string) => {
    // Route format: "TP. Hồ Chí Minh -> Đà Lạt"
    const parts = routeStr.split('->').map((p) => p.trim());
    const origin = parts[0] || 'TP. Hồ Chí Minh';
    const destination = parts[1] || 'Đà Lạt';

    setIsOpen(false);
    navigate(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  };

  const handleResetChat = () => {
    setMessages(DEFAULT_MESSAGES);
  };

  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.6), 0 10px 25px -5px rgba(37, 99, 235, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(37, 99, 235, 0), 0 12px 30px -5px rgba(37, 99, 235, 0.5);
          }
        }
        @keyframes bounceDot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .ai-chat-bubble pre {
          white-space: pre-wrap;
          font-family: inherit;
        }
      `}</style>

      {/* Floating launcher button */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '26px',
            right: '26px',
            zIndex: 9990,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
          }}
        >
          {unreadPulse && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1e3a8a',
                cursor: 'pointer',
                animation: 'pulseGlow 2.5s infinite',
              }}
              onClick={() => setIsOpen(true)}
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>Cần trợ lý AI tư vấn chuyến đi?</span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#2563eb',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              borderRadius: '50px',
              padding: '14px 22px',
              border: 'none',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={18} color="#ffffff" />
            </div>
            <span>Hỏi Trợ Lý AI</span>
            <span
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              24/7
            </span>
          </button>
        </div>
      )}

      {/* Modern AI Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '26px',
            right: '26px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '600px',
            maxHeight: 'calc(100vh - 50px)',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderRadius: '20px',
            boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px' }}>Trợ Lý Du Lịch AI</span>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#bfdbfe', marginTop: '1px' }}>
                  TravelEasy Smart Travel Assistant
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleResetChat}
                title="Làm mới đoạn hội thoại"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ cửa sổ"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel Bar */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
            }}
          >
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '5px 11px',
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  background: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#1e293b',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#eff6ff';
                  e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#93c5fd';
                  e.currentTarget.style.color = isDark ? '#38bdf8' : '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
                  e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
                  e.currentTarget.style.color = isDark ? '#f8fafc' : '#1e293b';
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isUser ? '#2563eb' : (isDark ? '#1e293b' : '#ffffff'),
                      color: isUser ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                      padding: '12px 16px',
                      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      boxShadow: isUser
                        ? '0 4px 12px rgba(37, 99, 235, 0.25)'
                        : (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0, 0, 0, 0.05)'),
                      border: isUser ? 'none' : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {m.text}

                    {/* Interactive Route Navigation Card */}
                    {m.suggestedRoute && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '10px 12px',
                          backgroundColor: isDark ? '#0f172a' : '#eff6ff',
                          borderRadius: '10px',
                          border: `1px solid ${isDark ? '#1d4ed8' : '#bfdbfe'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: isDark ? '#93c5fd' : '#1e40af' }}>
                          <MapPin size={13} color={isDark ? '#38bdf8' : '#2563eb'} />
                          <span>GỢI Ý TUYẾN ĐƯỜNG PHÙ HỢP:</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {m.suggestedRoute}
                        </div>
                        <button
                          onClick={() => handleRouteNavigate(m.suggestedRoute!)}
                          style={{
                            marginTop: '4px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                          }}
                        >
                          <span>Xem vé & Đặt chuyến này</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}

                    {/* Interactive Real Vouchers List */}
                    {m.voucherList && m.voucherList.length > 0 && (
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#ea580c' }}>
                          <Ticket size={13} color="#ea580c" />
                          <span>MÃ GIẢM GIÁ KHẢ DỤNG HÔM NAY:</span>
                        </div>
                        {m.voucherList.map((v) => (
                          <div
                            key={v.code}
                            style={{
                              backgroundColor: isDark ? '#431407' : '#fff7ed',
                              border: `1px dashed ${isDark ? '#ea580c' : '#fdba74'}`,
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 800, fontSize: '13px', color: isDark ? '#fdba74' : '#c2410c' }}>{v.code}</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#fed7aa' : '#ea580c', backgroundColor: isDark ? 'rgba(234,88,12,0.3)' : '#ffedd5', padding: '1px 6px', borderRadius: '4px' }}>
                                  {v.discountText}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: isDark ? '#fbcfe8' : '#7c2d12', marginTop: '2px' }}>{v.title}</div>
                            </div>
                            <button
                              onClick={() => handleCopyVoucher(v.code)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: copiedVoucher === v.code ? '#16a34a' : '#ea580c',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              {copiedVoucher === v.code ? (
                                <>
                                  <Check size={12} />
                                  <span>Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/promotions');
                          }}
                          style={{
                            marginTop: '4px',
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            color: isDark ? '#fb923c' : '#ea580c',
                            border: `1px solid ${isDark ? '#ea580c' : '#fdba74'}`,
                            borderRadius: '6px',
                            padding: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          Xem tất cả khuyến mãi tại Trung Tâm Voucher ➔
                        </button>
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      color: isDark ? '#64748b' : '#94a3b8',
                      marginTop: '4px',
                      padding: '0 4px',
                    }}
                  >
                    {m.time}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  padding: '12px 18px',
                  borderRadius: '18px 18px 18px 4px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounceDot 1.4s infinite ease-in-out both', animationDelay: '0s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounceDot 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounceDot 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                <span style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#64748b', marginLeft: '4px', fontWeight: 600 }}>
                  AI đang tư vấn...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi (Ví dụ: Chuyến xe đi Đà Lạt...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                fontSize: '13px',
                outline: 'none',
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                color: isDark ? '#f8fafc' : '#0f172a',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = isDark ? '#334155' : '#cbd5e1')}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: input.trim() && !loading ? '#2563eb' : (isDark ? '#334155' : '#cbd5e1'),
                color: '#ffffff',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistantWidget;
