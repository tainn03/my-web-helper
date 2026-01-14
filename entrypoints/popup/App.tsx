import { useState } from 'react';
import { useApiKey } from './hooks/useApiKey';
import { ApiKeyForm } from './components/ApiKeyForm';
import { ChatInterface } from './components/ChatInterface';
import './App.css';

function App() {
  const { savedKey, clearApiKey, isLoading } = useApiKey();
  const [showSettings, setShowSettings] = useState(false);

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
                <span>{savedKey.slice(0, 7)}...{savedKey.slice(-4)}</span>
              </div>
            </div>
            <button className="danger-btn" onClick={async () => {
              await clearApiKey();
              setShowSettings(false);
            }}>
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
        onSettingsClick={() => setShowSettings(true)} 
      />
    </div>
  );
}

export default App;
