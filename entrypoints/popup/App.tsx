import { useState } from "react";
import { useApiKey } from "./hooks/useApiKey";
import { ApiKeyForm } from "./components/ApiKeyForm";
import { ChatInterface } from "./components/ChatInterface";
import "./App.css";

function App() {
  const { savedKey, clearApiKey, isLoading, model, setModel, savedModel, saveModel } = useApiKey();
  const [showSettings, setShowSettings] = useState(false);

  const availableModels = [
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Mới nhất, nhanh' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Cải tiến GPT-4' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'GPT-4 Optimized' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="app-container loading">
        <div className="loader">⏳</div>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Chưa có API key -> hiện form nhập
  if (!savedKey) {
    return (
      <div className="app-container">
        <ApiKeyForm />
      </div>
    );
  }

  // Settings modal
  if (showSettings) {
    return (
      <div className="app-container">
        <div className="settings-panel">
          <h2>⚙️ Cài đặt</h2>
          <div className="settings-content">
            <div className="setting-item">
              <label>API Key hiện tại</label>
              <div className="api-key-display">
                <span>
                  {savedKey.slice(0, 7)}...{savedKey.slice(-4)}
                </span>
              </div>
            </div>
            
            <div className="setting-item">
              <label htmlFor="model-select">Model AI</label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Model hiện tại: {availableModels.find(m => m.id === savedModel)?.name}
              </small>
            </div>

            {model !== savedModel && (
              <button
                className="primary-btn"
                onClick={async () => {
                  await saveModel();
                  alert('Đã lưu model mới!');
                }}
                style={{ marginBottom: '10px' }}
              >
                💾 Lưu Model
              </button>
            )}
            
            <button
              className="danger-btn"
              onClick={async () => {
                await clearApiKey();
                setShowSettings(false);
              }}
            >
              🗑️ Xóa API Key
            </button>
          </div>
          <button className="back-btn" onClick={() => setShowSettings(false)}>
            ← Quay lại Chat
          </button>
        </div>
      </div>
    );
  }

  // Main chat interface với OpenAI
  return (
    <div className="app-container">
      <ChatInterface
        apiKey={savedKey}
        model={savedModel}
        onSettingsClick={() => setShowSettings(true)}
      />
    </div>
  );
}

export default App;
