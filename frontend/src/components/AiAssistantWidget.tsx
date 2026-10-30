import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Bot,
  X,
  Send,
  Sparkles,
  MapPin,
  ArrowRight,
  RotateCcw,
  Ticket,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Compass,
  Smile,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
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
    text: `Xin chào! Tôi là Trợ lý AI Thông Minh của **TravelEasy** 🚌✨

Tôi được tối ưu để đồng hành cùng bạn 24/7 với dữ liệu nhà xe cập nhật theo thời gian thực:
• **Gợi ý tuyến đường & lịch trình:** Tìm xe chất lượng cao, tối ưu thời gian di chuyển.
• **Tư vấn vị trí giường nằm:** Chọn tầng 1 chống say xe, êm ái cho gia đình & trẻ nhỏ.
• **Giải đáp chính sách:** Hoàn/hủy vé, đổi chuyến miễn phí trước 2 tiếng & cam kết 150%.
• **Hỗ trợ thanh toán:** Quét mã VietQR PayOS duyệt vé tự động trong 3 giây.

Bạn muốn khởi hành đi đâu hoặc cần tư vấn thông tin gì hôm nay?`,
    suggestedRoute: null,
    time: 'Vừa xong',
  },
];

const QUICK_PROMPTS = [
  { label: '🏔️ Đi Đà Lạt xe nào tốt?', query: 'Tư vấn chuyến đi Đà Lạt giúp tôi, xe nào chất lượng và êm ái nhất?' },
  { label: '💺 Chọn giường nào đỡ say xe?', query: 'Đi xe giường nằm thì nên chọn vị trí ghế nào để không bị say xe?' },
  { label: '🎟️ Có mã giảm giá nào không?', query: 'Hiện tại sàn TravelEasy đang có những mã voucher ưu đãi nào?' },
  { label: '🏖️ Vé xe Sài Gòn - Nha Trang?', query: 'Xe đi Nha Trang từ TP. Hồ Chí Minh giá bao nhiêu, chạy cao tốc mất mấy tiếng?' },
  { label: '🌲 Xe cabin Hà Nội - Sa Pa?', query: 'Có chuyến xe giường nằm hoặc cabin đôi nào từ Hà Nội đi Sa Pa không?' },
  { label: '💳 Hướng dẫn quét mã VietQR?', query: 'Hướng dẫn thanh toán vé xe qua quét mã VietQR PayOS?' },
  { label: '🛡️ Chính sách hủy vé hoàn tiền?', query: 'Chính sách hủy vé, đổi chuyến và cam kết hoàn 150% của sàn?' },
];

const STARTER_CARDS = [
  {
    icon: '🏔️',
    title: 'Đi Đà Lạt 3N2Đ',
    desc: 'Lộ trình săn mây Cầu Đất, xe phòng Limousine êm ái & dự trù chi phí.',
    query: 'Tư vấn chuyến đi Đà Lạt 3 ngày 2 đêm, xe Limousine nào chất lượng nhất?',
    badge: 'Hot nhất',
  },
  {
    icon: '💺',
    title: 'Ghế Chống Say Xe',
    desc: 'Bí quyết chọn giường tầng 1 dãy giữa A02-A05 giảm rung lắc tối đa.',
    query: 'Đi xe giường nằm thì nên chọn vị trí ghế nào để không bị say xe?',
    badge: 'Hữu ích',
  },
  {
    icon: '🎟️',
    title: 'Săn Voucher 50K',
    desc: 'Tổng hợp mã giảm 20%, 50.000đ độc quyền áp dụng trực tiếp hôm nay.',
    query: 'Hiện tại sàn TravelEasy đang có những mã voucher ưu đãi nào?',
    badge: 'Ưu đãi',
  },
  {
    icon: '💳',
    title: 'Quét Mã VietQR',
    desc: 'Thanh toán PayOS qua mọi ngân hàng, tự động kích hoạt vé trong 3s.',
    query: 'Hướng dẫn thanh toán vé xe qua quét mã VietQR PayOS?',
    badge: 'Tức thì 3s',
  },
  {
    icon: '🏖️',
    title: 'Sài Gòn - Nha Trang',
    desc: 'Chạy toàn tuyến cao tốc 7 tiếng, khám phá lặn biển Hòn Mun.',
    query: 'Xe đi Nha Trang từ TP. Hồ Chí Minh giá bao nhiêu, chạy cao tốc mất mấy tiếng?',
    badge: 'Biển xanh',
  },
  {
    icon: '🛡️',
    title: 'Đổi Vé & Cam Kết 150%',
    desc: 'Miễn phí đổi vé trước 2h, bồi hoàn 150% nếu nhà xe bỏ khách.',
    query: 'Chính sách hủy vé, đổi chuyến và cam kết hoàn 150% của sàn?',
    badge: 'An tâm',
  },
];

// Helper to render rich markdown in AI messages
const FormattedAiMessage: React.FC<{ text: string; isDark: boolean }> = ({ text, isDark }) => {
  const lines = text.split('\n');

  const renderInline = (str: string) => {
    // Splits by **bold** or `code`
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={i}
            style={{
              fontWeight: 700,
              color: isDark ? '#60a5fa' : '#1d4ed8',
            }}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <span
            key={i}
            style={{
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
              color: isDark ? '#38bdf8' : '#0284c7',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '4px',
              border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd'}`,
            }}
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const elements: React.ReactNode[] = [];

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={`sp-${idx}`} style={{ height: '6px' }} />);
      return;
    }

    // Header 3: ### Heading
    if (line.startsWith('### ')) {
      const headingText = line.replace(/^###\s+/, '');
      elements.push(
        <div
          key={`h-${idx}`}
          style={{
            margin: '10px 0 6px 0',
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(30, 58, 138, 0.35)' : '#eff6ff',
            borderLeft: `3px solid ${isDark ? '#38bdf8' : '#2563eb'}`,
            fontSize: '13px',
            fontWeight: 800,
            color: isDark ? '#93c5fd' : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{renderInline(headingText)}</span>
        </div>
      );
      return;
    }

    // Divider: ---
    if (line === '---' || line === '***') {
      elements.push(
        <hr
          key={`hr-${idx}`}
          style={{
            border: 'none',
            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            margin: '10px 0',
          }}
        />
      );
      return;
    }

    // Highlight Callout: 👉, 💡, 🔒, ✨
    if (line.startsWith('👉') || line.startsWith('💡') || line.startsWith('🔒') || line.startsWith('✨')) {
      elements.push(
        <div
          key={`tip-${idx}`}
          style={{
            margin: '8px 0',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : '#f0f9ff',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.25)' : '#bae6fd'}`,
            fontSize: '12px',
            lineHeight: 1.5,
            color: isDark ? '#e2e8f0' : '#0369a1',
          }}
        >
          {renderInline(line)}
        </div>
      );
      return;
    }

    // Sub-bullet point: starts with space + * or -
    if (rawLine.startsWith('   ') || rawLine.startsWith('  ')) {
      const subText = rawLine.replace(/^\s+[*•-]\s*/, '');
      elements.push(
        <div
          key={`sub-${idx}`}
          style={{
            paddingLeft: '18px',
            margin: '3px 0',
            fontSize: '12.5px',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            color: isDark ? '#cbd5e1' : '#334155',
          }}
        >
          <span style={{ color: isDark ? '#38bdf8' : '#2563eb', fontSize: '10px', marginTop: '4px' }}>▪</span>
          <div style={{ flex: 1 }}>{renderInline(subText)}</div>
        </div>
      );
      return;
    }

    // Primary bullet point: * or • or -
    if (line.startsWith('* ') || line.startsWith('• ') || line.startsWith('- ')) {
      const bulletText = line.replace(/^[*•-]\s+/, '');
      elements.push(
        <div
          key={`b-${idx}`}
          style={{
            margin: '4px 0',
            fontSize: '13px',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            color: isDark ? '#e2e8f0' : '#1e293b',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#38bdf8' : '#2563eb',
              flexShrink: 0,
              marginTop: '7px',
            }}
          />
          <div style={{ flex: 1 }}>{renderInline(bulletText)}</div>
        </div>
      );
      return;
    }

    // Numbered List: 1. 2. 3.
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div
          key={`num-${idx}`}
          style={{
            margin: '5px 0',
            fontSize: '13px',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            color: isDark ? '#e2e8f0' : '#1e293b',
          }}
        >
          <span
            style={{
              backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
              color: isDark ? '#93c5fd' : '#1d4ed8',
              fontSize: '11px',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            {numMatch[1]}
          </span>
          <div style={{ flex: 1 }}>{renderInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Default regular paragraph
    elements.push(
      <p
        key={`p-${idx}`}
        style={{
          margin: '4px 0',
          fontSize: '13px',
          lineHeight: 1.55,
          color: isDark ? '#e2e8f0' : '#1e293b',
        }}
      >
        {renderInline(line)}
      </p>
    );
  });

  return <div>{elements}</div>;
};

export const AiAssistantWidget: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadPulse, setUnreadPulse] = useState(true);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}! Dán tại bước thanh toán để nhận giảm giá.`, 'Sao Chép Thành Công');
    setTimeout(() => setCopiedVoucher(null), 2500);
  };

  const handleCopyAiMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    toast.success('Đã sao chép nội dung tư vấn của AI vào bộ nhớ tạm!', 'Đã Sao Chép');
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadPulse(false);
      setTimeout(() => inputRef.current?.focus(), 200);
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

      // Smart Route Detection
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
        } else if (lower.includes('đà nẵng') || lower.includes('quy nhơn')) {
          route = 'Đà Nẵng -> Quy Nhơn';
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

        reply = '🎉 TravelEasy đang có các mã ưu đãi độc quyền kết nối trực tiếp từ hệ thống:\n\nBạn có thể bấm **[Sao chép]** bên dưới và dán vào ô Voucher tại bước Thanh Toán để nhận ưu đãi tức thì!';
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
        text: 'Xin chào bạn! Hệ thống trợ lý AI đang tiếp nhận rất nhiều lượt tư vấn cùng lúc. Đội ngũ TravelEasy luôn sẵn sàng hỗ trợ trực tiếp qua tổng đài **1900 8888** hoặc bạn có thể tìm kiếm chuyến xe ngay trên thanh tìm kiếm nhé!',
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteNavigate = (routeStr: string) => {
    const parts = routeStr.split('->').map((p) => p.trim());
    const origin = parts[0] || 'TP. Hồ Chí Minh';
    const destination = parts[1] || 'Đà Lạt';

    setIsOpen(false);
    navigate(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  };

  const handleResetChat = () => {
    setMessages(DEFAULT_MESSAGES);
    toast.info('Đã làm mới cuộc hội thoại với Trợ lý AI!', 'Làm Mới');
  };

  // Follow-up suggestions based on latest context
  const getFollowUpChips = (msg: ChatMessage) => {
    const t = msg.text.toLowerCase();
    if (t.includes('đà lạt')) {
      return [
        { label: '💺 Ghế nào chống say?', q: 'Đi xe giường nằm thì nên chọn vị trí ghế nào để không bị say xe?' },
        { label: '🎟️ Lấy mã giảm 50K', q: 'Có mã voucher giảm giá nào cho tuyến Đà Lạt không?' },
        { label: '🏖️ Đi Nha Trang thế nào?', q: 'Xe đi Nha Trang từ TP. Hồ Chí Minh giá bao nhiêu, chạy cao tốc mất mấy tiếng?' },
      ];
    }
    if (t.includes('say xe') || t.includes('giường nằm')) {
      return [
        { label: '🏔️ Đi Đà Lạt xe nào êm?', q: 'Tư vấn chuyến đi Đà Lạt giúp tôi, xe nào chất lượng và êm ái nhất?' },
        { label: '💳 Cách quét mã PayOS', q: 'Hướng dẫn thanh toán vé xe qua quét mã VietQR PayOS?' },
        { label: '🛡️ Đổi hủy vé ra sao?', q: 'Chính sách hủy vé, đổi chuyến và cam kết hoàn 150% của sàn?' },
      ];
    }
    if (t.includes('thanh toán') || t.includes('payos') || t.includes('vietqr')) {
      return [
        { label: '🎟️ Săn mã giảm giá', q: 'Hiện tại sàn TravelEasy đang có những mã voucher ưu đãi nào?' },
        { label: '🛡️ Chính sách hoàn hủy', q: 'Chính sách hủy vé, đổi chuyến và cam kết hoàn 150% của sàn?' },
        { label: '🏔️ Xem tuyến Đà Lạt', q: 'Tư vấn chuyến đi Đà Lạt giúp tôi, xe nào chất lượng và êm ái nhất?' },
      ];
    }
    return [
      { label: '🏔️ Đi Đà Lạt', q: 'Tư vấn chuyến đi Đà Lạt giúp tôi, xe nào chất lượng và êm ái nhất?' },
      { label: '💺 Mẹo chống say xe', q: 'Đi xe giường nằm thì nên chọn vị trí ghế nào để không bị say xe?' },
      { label: '🎟️ Săn voucher 50K', q: 'Hiện tại sàn TravelEasy đang có những mã voucher ưu đãi nào?' },
    ];
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
        .ai-chat-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .ai-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .ai-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 4px;
        }
        .ai-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
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
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`,
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: isDark ? '#93c5fd' : '#1e3a8a',
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
            bottom: '24px',
            right: '24px',
            width: '410px',
            maxWidth: 'calc(100vw - 32px)',
            height: '630px',
            maxHeight: 'calc(100vh - 40px)',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            borderRadius: '24px',
            boxShadow: isDark
              ? '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)'
              : '0 25px 60px -12px rgba(15, 23, 42, 0.35)',
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
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px' }}>Trợ Lý Du Lịch AI</span>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      boxShadow: '0 0 8px #22c55e',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#bfdbfe', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>TravelEasy Smart Assistant</span>
                  <span>•</span>
                  <span style={{ color: '#86efac', fontWeight: 600 }}>Trực tuyến 24/7</span>
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Đóng cửa sổ"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel Bar */}
          <div
            className="ai-chat-scroll"
            style={{
              padding: '10px 14px',
              backgroundColor: isDark ? '#0b1120' : '#f8fafc',
              borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  background: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#eff6ff';
                  e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#60a5fa';
                  e.currentTarget.style.color = isDark ? '#38bdf8' : '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
                  e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
                  e.currentTarget.style.color = isDark ? '#e2e8f0' : '#1e293b';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div
            className="ai-chat-scroll"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              const followUpChips = !isUser ? getFollowUpChips(m) : [];

              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '85%' : '94%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      backgroundColor: isUser ? '#2563eb' : (isDark ? '#1e293b' : '#ffffff'),
                      color: isUser ? '#ffffff' : (isDark ? '#f8fafc' : '#0f172a'),
                      padding: isUser ? '12px 16px' : '14px 18px',
                      borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      fontSize: '13px',
                      boxShadow: isUser
                        ? '0 6px 16px rgba(37, 99, 235, 0.25)'
                        : (isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)'),
                      border: isUser ? 'none' : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Message Header for AI Bubble */}
                    {!isUser && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          paddingBottom: '6px',
                          borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: isDark ? '#93c5fd' : '#2563eb' }}>
                          <Bot size={14} />
                          <span>TravelEasy AI Assistant</span>
                        </div>
                        <button
                          onClick={() => handleCopyAiMessage(m.id, m.text)}
                          title="Sao chép câu trả lời"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedMessageId === m.id ? '#16a34a' : (isDark ? '#94a3b8' : '#64748b'),
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'all 0.15s',
                          }}
                        >
                          {copiedMessageId === m.id ? (
                            <>
                              <Check size={11} />
                              <span>Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Rich Formatted Message Text */}
                    {isUser ? (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.text}</div>
                    ) : (
                      <FormattedAiMessage text={m.text} isDark={isDark} />
                    )}

                    {/* Interactive Route Navigation Card */}
                    {m.suggestedRoute && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: isDark ? '#0f172a' : '#eff6ff',
                          borderRadius: '12px',
                          border: `1px solid ${isDark ? '#1d4ed8' : '#bfdbfe'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: isDark ? '#93c5fd' : '#1e40af' }}>
                          <MapPin size={13} color={isDark ? '#38bdf8' : '#2563eb'} />
                          <span>GỢI Ý TUYẾN ĐƯỜNG PHÙ HỢP:</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
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
                            padding: '8px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#ea580c' }}>
                          <Ticket size={13} color="#ea580c" />
                          <span>MÃ GIẢM GIÁ KHẢ DỤNG HÔM NAY:</span>
                        </div>
                        {m.voucherList.map((v) => (
                          <div
                            key={v.code}
                            style={{
                              backgroundColor: isDark ? '#431407' : '#fff7ed',
                              border: `1px dashed ${isDark ? '#ea580c' : '#fdba74'}`,
                              borderRadius: '10px',
                              padding: '10px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 800, fontSize: '13.5px', color: isDark ? '#fdba74' : '#c2410c' }}>{v.code}</span>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: isDark ? '#fed7aa' : '#ea580c',
                                    backgroundColor: isDark ? 'rgba(234,88,12,0.3)' : '#ffedd5',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                  }}
                                >
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
                                borderRadius: '8px',
                                padding: '6px 12px',
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
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '11.5px',
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

                  {/* Follow-up suggestion pills for AI messages */}
                  {!isUser && followUpChips.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        marginTop: '8px',
                        paddingLeft: '4px',
                      }}
                    >
                      {followUpChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSend(chip.q)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '14px',
                            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                            background: isDark ? '#0f172a' : '#ffffff',
                            color: isDark ? '#94a3b8' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#2563eb';
                            e.currentTarget.style.color = isDark ? '#38bdf8' : '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
                            e.currentTarget.style.color = isDark ? '#94a3b8' : '#475569';
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}

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

            {/* AI Capabilities & Quick Action Starter Grid (Only shown when initial welcome message) */}
            {messages.length <= 1 && (
              <div
                style={{
                  marginTop: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: isDark ? '#93c5fd' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={13} color="#f59e0b" />
                    <span>CHỦ ĐỀ ĐƯỢC QUAN TÂM NHẤT</span>
                  </span>
                  <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>Chạm để hỏi ngay</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                  }}
                >
                  {STARTER_CARDS.map((card, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(card.query)}
                      style={{
                        background: isDark
                          ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
                          : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        padding: '10px 12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.03)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = isDark ? '#38bdf8' : '#3b82f6';
                        e.currentTarget.style.boxShadow = isDark
                          ? '0 6px 14px rgba(56, 189, 248, 0.2)'
                          : '0 6px 14px rgba(59, 130, 246, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                        e.currentTarget.style.boxShadow = isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.03)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '18px' }}>{card.icon}</span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '6px',
                            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#e0f2fe',
                            color: isDark ? '#38bdf8' : '#0369a1',
                          }}
                        >
                          {card.badge}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: isDark ? '#f8fafc' : '#1e293b',
                          marginTop: '2px',
                        }}
                      >
                        {card.title}
                      </div>
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: isDark ? '#94a3b8' : '#64748b',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {card.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  padding: '12px 18px',
                  borderRadius: '20px 20px 20px 4px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounceDot 1.4s infinite ease-in-out both', animationDelay: '0s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounceDot 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', animation: 'bounceDot 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                <span style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#64748b', marginLeft: '4px', fontWeight: 600 }}>
                  AI đang tra cứu lịch trình & tư vấn...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập câu hỏi (Ví dụ: Chuyến xe đi Đà Lạt...)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#334155' : '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  backgroundColor: input.trim() && !loading ? '#2563eb' : (isDark ? '#334155' : '#e2e8f0'),
                  color: input.trim() && !loading ? '#ffffff' : (isDark ? '#64748b' : '#94a3b8'),
                  border: 'none',
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: input.trim() && !loading ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                <Send size={17} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: isDark ? '#64748b' : '#94a3b8',
                padding: '0 4px',
              }}
            >
              <span>⚡ Nhấn Enter để gửi nhanh</span>
              <span>Bảo chứng bởi TravelEasy 2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistantWidget;
