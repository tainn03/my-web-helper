import { useState, useRef, useEffect } from 'react';
import { useOpenAIChat } from '../hooks/useOpenAIChat';
import { createDomTools } from '../hooks/domTools';

interface ChatInterfaceProps {
  apiKey: string;
  onSettingsClick?: () => void;
}

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh giúp người dùng tương tác với trang web hiện tại.

Khả năng của bạn:
- Đọc thông tin trang web (title, URL, metadata, số lượng elements)
- Trích xuất text từ bất kỳ phần nào của trang
- Click vào buttons, links
- Điền form (nhập text vào input/textarea)
- Scroll trang web
- Highlight elements để người dùng dễ thấy
- Lấy danh sách links trên trang
- Lấy HTML của elements

Quy tắc:
1. Luôn sử dụng tools khi cần tương tác với trang web
2. Trả lời bằng tiếng Việt nếu người dùng hỏi bằng tiếng Việt
3. Giải thích rõ ràng những gì bạn đang làm
4. Nếu không tìm thấy element, hãy gợi ý selector khác
5. Cảnh báo trước khi thực hiện các thao tác có thể thay đổi dữ liệu (submit form, click delete...)`;

export function ChatInterface({ apiKey, onSettingsClick }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const domTools = createDomTools();
  const { messages, isLoading, error, sendMessage, clearMessages } = useOpenAIChat({
    apiKey,
    systemPrompt: SYSTEM_PROMPT,
    model: 'gpt-4o-mini',
    tools: domTools,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>🤖 My Web Helper</h2>
        <div className="header-actions">
          <button className="icon-btn" onClick={clearMessages} title="Xóa lịch sử chat">
            🗑️
          </button>
          <button className="icon-btn" onClick={onSettingsClick} title="Cài đặt">
            ⚙️
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">👋</div>
            <h3>Xin chào!</h3>
            <p>Tôi có thể giúp bạn tương tác với trang web hiện tại. Hãy thử hỏi:</p>
            <ul className="suggestions">
              <li onClick={() => setInputValue('Trang này là gì?')}>
                "Trang này là gì?"
              </li>
              <li onClick={() => setInputValue('Liệt kê tất cả các links trên trang')}>
                "Liệt kê tất cả các links"
              </li>
              <li onClick={() => setInputValue('Có bao nhiêu input trên trang?')}>
                "Có bao nhiêu input trên trang?"
              </li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}
