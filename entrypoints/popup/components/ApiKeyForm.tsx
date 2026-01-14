import { useState } from "react";
import { useApiKey } from "../hooks/useApiKey";

interface ApiKeyFormProps {
  onSuccess?: () => void;
}

export function ApiKeyForm({ onSuccess }: ApiKeyFormProps) {
  const { apiKey, setApiKey, saveApiKey } = useApiKey();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <p>Nhập OpenAI API Key để bắt đầu sử dụng</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="api-key">OpenAI API Key</label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
            required
          />
          <small>API Key sẽ được lưu cục bộ trên máy của bạn</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isSubmitting || !apiKey.trim()}>
          {isSubmitting ? "Đang lưu..." : "Lưu & Mở Chat"}
        </button>
      </form>

      <div className="api-key-help">
        <p>
          Chưa có API Key?{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lấy ở đây
          </a>
        </p>
      </div>
    </div>
  );
}
