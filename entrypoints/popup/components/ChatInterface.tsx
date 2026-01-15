import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useOpenAIChat } from "../hooks/useOpenAIChat";
import { createDomTools } from "../hooks/domTools";

interface ChatInterfaceProps {
  apiKey: string;
  model: string;
  onSettingsClick?: () => void;
}

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh giúp người dùng tương tác với trang web hiện tại.
Bạn có các công cụ Chrome DevTools MCP để:

**Debugging & Analysis:**
- take_snapshot: Lấy thông tin tổng quan trang (LUÔN GỌI ĐẦU TIÊN)
- evaluate_script: Chạy JavaScript trong trang

**Input Automation:**
- click: Click element (hỗ trợ double-click)
- fill: Điền text vào input/textarea/select
- hover: Hover lên element
- press_key: Nhấn phím/tổ hợp phím (Enter, Control+A...)

**Navigation:**
- navigate_page: Điều hướng (URL, back, forward, reload)
- scroll_page: Scroll trang
- highlight_element: Đánh dấu element

Quy tắc:
1. Lập kế hoạch trước khi hành động
2. Gọi take_snapshot đầu tiên để hiểu cấu trúc trang
3. Sử dụng evaluate_script cho các truy vấn phức tạp
4. Early return ngay khi có thể
5. Cảnh báo trước khi thay đổi dữ liệu (submit form, xóa...)`;
export function ChatInterface({ apiKey, model, onSettingsClick }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const domTools = createDomTools();
  const { messages, isLoading, error, sendMessage, clearMessages } =
    useOpenAIChat({
      apiKey,
      systemPrompt: SYSTEM_PROMPT,
      model,
      tools: domTools,
    });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>🤖 My Web Helper</h2>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={clearMessages}
            title="Xóa lịch sử chat"
          >
            🗑️
          </button>
          <button
            className="icon-btn"
            onClick={onSettingsClick}
            title="Cài đặt"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">👋</div>
            <h3>Xin chào!</h3>
            <p>
              Tôi có thể giúp bạn tương tác với trang web hiện tại. Hãy thử hỏi:
            </p>
            <ul className="suggestions">
              <li onClick={() => setInputValue("Trang này là gì?")}>
                "Trang này là gì?"
              </li>
              <li
                onClick={() =>
                  setInputValue("Liệt kê tất cả các links trên trang")
                }
              >
                "Liệt kê tất cả các links"
              </li>
              <li
                onClick={() => setInputValue("Có bao nhiêu input trên trang?")}
              >
                "Có bao nhiêu input trên trang?"
              </li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === "user" ? "👤" : "🤖"}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ node, className, children, ...props }) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : message.role === "tool" ? (
                  <div>
                      <ReactMarkdown>{message.toolName}</ReactMarkdown>
                    {message.toolArgs && (
                      <details style={{ marginTop: '5px', fontSize: '0.85em', opacity: 0.7 }}>
                        <summary style={{ cursor: 'pointer' }}>Chi tiết</summary>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '8px', 
                          borderRadius: '4px',
                          fontSize: '0.9em',
                          overflow: 'auto',
                          // maxHeight: '150px'
                          maxWidth: '300px'
                        }}>
{JSON.stringify(message.toolArgs, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  message.content
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
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

        {error && <div className="error-banner">⚠️ {error}</div>}

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
          {isLoading ? "⏳" : "➤"}
        </button>
      </form>
    </div>
  );
}
