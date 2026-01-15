import { useState } from "react";
import { useApiKey } from "../hooks/useApiKey";

interface ApiKeyFormProps {
  onSuccess?: () => void;
}

export function ApiKeyForm({ onSuccess }: ApiKeyFormProps) {
  const { apiKey, setApiKey, saveApiKey, model, setModel } = useApiKey();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableModels = [
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Model mới nhất, nhanh và tiết kiệm' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Phiên bản cải tiến của GPT-4' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'GPT-4 Optimized' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await saveApiKey();
      onSuccess?.();
      // Force reload để App.tsx nhận được key mới
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="api-key-form">
      <div className="api-key-header">
        <div className="api-key-icon">🔑</div>
        <h1>My Web Helper</h1>
        <p>Nhập Internal API Key (PAT) để bắt đầu sử dụng</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="api-key">Internal API Key hoặc PAT</label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="ok-... hoặc ck-..."
            autoComplete="off"
            required
          />
          <small>API Key sẽ được lưu cục bộ trên máy của bạn</small>
        </div>

        <div className="input-group">
          <label htmlFor="model">Chọn Model</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} - {m.description}
              </option>
            ))}
          </select>
          <small>Model có thể thay đổi sau trong phần Cài đặt</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isSubmitting || !apiKey.trim()}>
          {isSubmitting ? "Đang lưu..." : "Lưu & Mở Chat"}
        </button>
      </form>

      <div className="api-key-help">
        <p>
          <strong>Lấy Internal API Key:</strong>{" "}
          <a
            href="https://wiki-api-proxy.workers-hub.com/pages/viewpage.action?pageId=777182841"
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem hướng dẫn
          </a>
        </p>
        <p>
          <strong>Lấy PAT (Personal Access Token):</strong>{" "}
          <a
            href="https://chatai.workers-hub.com/dashboard/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tạo tại đây
          </a>
        </p>
        <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px' }}>
          💡 PAT có rate limit 1 request/giây, 5 requests/phút
        </p>
      </div>
    </div>
  );
}
