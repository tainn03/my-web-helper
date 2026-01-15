import { useState, useEffect } from 'react';

interface UseApiKeyReturn {
    apiKey: string;
    setApiKey: (key: string) => void;
    savedKey: string | null;
    saveApiKey: () => Promise<void>;
    clearApiKey: () => Promise<void>;
    isLoading: boolean;
    model: string;
    setModel: (model: string) => void;
    savedModel: string;
    saveModel: () => Promise<void>;
}

export function useApiKey(): UseApiKeyReturn {
    const [apiKey, setApiKey] = useState<string>('');
    const [savedKey, setSavedKey] = useState<string | null>(null);
    const [model, setModel] = useState<string>('gpt-5-mini');
    const [savedModel, setSavedModel] = useState<string>('gpt-5-mini');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load API key và model từ chrome.storage khi mount
        chrome.storage.local.get(['internalApiKey', 'selectedModel'], (result) => {
            if (result.internalApiKey && typeof result.internalApiKey === 'string') {
                setSavedKey(result.internalApiKey);
                setApiKey(result.internalApiKey);
            }
            if (result.selectedModel && typeof result.selectedModel === 'string') {
                setSavedModel(result.selectedModel);
                setModel(result.selectedModel);
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
            chrome.storage.local.set({ 
                internalApiKey: apiKey.trim(),
                selectedModel: model 
            }, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                setSavedKey(apiKey.trim());
                setSavedModel(model);
                resolve();
            });
        });
    };

    const saveModel = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ selectedModel: model }, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                setSavedModel(model);
                resolve();
            });
        });
    };

    const clearApiKey = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove(['internalApiKey'], () => {
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
        model,
        setModel,
        savedModel,
        saveModel,
    };
}
