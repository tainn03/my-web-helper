import { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: Date;
    toolName?: string; // Tên tool đang được gọi
    toolArgs?: any; // Arguments của tool call
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
    model = 'gpt-5-mini',
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
                baseURL: 'https://genai-gateway.flava-cloud.com/v1', // Internal GenAI Gateway proxy
                dangerouslyAllowBrowser: true, // Required for client-side usage
                defaultHeaders: {
                    'X-Title': 'my-web-helper-extension', // Application identifier
                },
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
                ...messages
                    .filter((m) => m.role !== 'tool') // Không gửi tool messages (chỉ dùng để hiển thị)
                    .map((m) => ({
                        role: m.role as 'user' | 'assistant' | 'system',
                        content: m.content,
                    })),
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
                if (assistantMessage.content) {
                    const assistantMsg: Message = {
                        id: crypto.randomUUID(),
                        role: 'assistant',
                        content: assistantMessage.content,
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMsg]);
                }

                const toolResults: Array<{ role: 'tool'; tool_call_id: string; content: string }> = [];

                for (const toolCall of assistantMessage.tool_calls) {
                    if (toolCall.type === 'function') {
                        const tool = tools.find((t) => t.name === toolCall.function.name);
                        if (tool) {
                            try {
                                const args = JSON.parse(toolCall.function.arguments);

                                // Hiển thị tool call lên UI
                                const toolMessage: Message = {
                                    id: crypto.randomUUID(),
                                    role: 'tool',
                                    content: `🔧 ${tool.description}`,
                                    timestamp: new Date(),
                                    toolName: tool.name,
                                    toolArgs: args,
                                };
                                setMessages((prev) => [...prev, toolMessage]);

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

                // Tiếp tục conversation với tool results
                response = await clientRef.current.chat.completions.create({
                    model,
                    messages: [
                        { role: 'system' as const, content: systemPrompt },
                        ...conversationMessages.filter((m) => m.role !== 'system'),
                        { role: 'assistant' as const, content: assistantMessage.content || '', tool_calls: assistantMessage.tool_calls },
                        ...toolResults,
                    ],
                    tools: openaiTools,
                    tool_choice: 'auto',
                } as any);

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
