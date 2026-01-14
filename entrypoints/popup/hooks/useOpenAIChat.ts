import { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    handler: (args: any) => Promise<any>;
}

interface UseOpenAIChatOptions {
    apiKey: string;
    systemPrompt?: string;
    model?: string;
    tools?: Tool[];
}

export function useOpenAIChat({
    apiKey,
    systemPrompt = 'You are a helpful assistant.',
    model = 'gpt-4o-mini',
    tools = [],
}: UseOpenAIChatOptions) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const clientRef = useRef<OpenAI | null>(null);

    useEffect(() => {
        if (apiKey) {
            clientRef.current = new OpenAI({
                apiKey,
                dangerouslyAllowBrowser: true, // Required for client-side usage
            });
        }
    }, [apiKey]);

    const convertToolsToOpenAIFormat = () => {
        return tools.map((tool) => ({
            type: 'function' as const,
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            },
        }));
    };

    const sendMessage = async (content: string) => {
        if (!clientRef.current || !content.trim()) return;

        setError(null);
        setIsLoading(true);

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const conversationMessages = [
                { role: 'system' as const, content: systemPrompt },
                ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
                { role: 'user' as const, content },
            ];

            const openaiTools = tools.length > 0 ? convertToolsToOpenAIFormat() : undefined;

            let response = await clientRef.current.chat.completions.create({
                model,
                messages: conversationMessages,
                tools: openaiTools,
                tool_choice: openaiTools ? 'auto' : undefined,
            });

            let assistantMessage = response.choices[0].message;

            // Handle tool calls
            while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                const toolResults: Array<{ role: 'tool'; tool_call_id: string; content: string }> = [];

                for (const toolCall of assistantMessage.tool_calls) {
                    // Check if it's a function tool call
                    if (toolCall.type === 'function') {
                        const tool = tools.find((t) => t.name === toolCall.function.name);
                        if (tool) {
                            try {
                                const args = JSON.parse(toolCall.function.arguments);
                                const result = await tool.handler(args);
                                toolResults.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    content: typeof result === 'string' ? result : JSON.stringify(result),
                                });
                            } catch (e) {
                                toolResults.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
                                });
                            }
                        }
                    }
                }

                // Continue conversation with tool results
                response = await clientRef.current.chat.completions.create({
                    model,
                    messages: [
                        ...conversationMessages,
                        assistantMessage,
                        ...toolResults,
                    ],
                    tools: openaiTools,
                    tool_choice: 'auto',
                });

                assistantMessage = response.choices[0].message;
            }

            const finalContent = assistantMessage.content || 'Tôi không thể trả lời câu hỏi này.';

            const botMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: finalContent,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Có lỗi xảy ra khi gọi OpenAI API';
            setError(errorMessage);
            console.error('OpenAI API Error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
    };
}
