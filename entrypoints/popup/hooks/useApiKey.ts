import { useState, useEffect } from 'react';

interface UseApiKeyReturn {
  apiKey: string;
  setApiKey: (key: string) => void;
  savedKey: string | null;
  saveApiKey: () => Promise<void>;
  clearApiKey: () => Promise<void>;
  isLoading: boolean;
}

export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load API key từ chrome.storage khi mount
    chrome.storage.local.get(['openaiApiKey'], (result) => {
      if (result.openaiApiKey && typeof result.openaiApiKey === 'string') {
        setSavedKey(result.openaiApiKey);
        setApiKey(result.openaiApiKey);
      }
      setIsLoading(false);
    });
  }, []);

  const saveApiKey = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!apiKey.trim()) {
        reject(new Error('API Key không được để trống'));
        return;
      }
      chrome.storage.local.set({ openaiApiKey: apiKey.trim() }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        setSavedKey(apiKey.trim());
        resolve();
      });
    });
  };

  const clearApiKey = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(['openaiApiKey'], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        setSavedKey(null);
        setApiKey('');
        resolve();
      });
    });
  };

  return {
    apiKey,
    setApiKey,
    savedKey,
    saveApiKey,
    clearApiKey,
    isLoading,
  };
}
