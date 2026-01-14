import { Tool } from './useOpenAIChat';

// Helper function để gửi message đến content script
function sendToContentScript(message: any): Promise<any> {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) {
                resolve({ error: 'Không tìm thấy tab đang mở' });
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, message, (res) => {
                if (chrome.runtime.lastError) {
                    resolve({ error: chrome.runtime.lastError.message });
                    return;
                }
                resolve(res || { error: 'Không nhận được phản hồi' });
            });
        });
    });
}

export function createDomTools(): Tool[] {
    return [
        {
            name: 'getPageInfo',
            description: 'Lấy thông tin tổng quan trang web hiện tại: title, url, số elements, số input, meta description...',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
            handler: async () => {
                return await sendToContentScript({ action: 'getPageInfo' });
            },
        },
        {
            name: 'extractText',
            description: 'Trích xuất text từ một selector CSS trên trang',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: "CSS selector, ví dụ: 'h1', '.product-price', '#main-content', 'p'",
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector }: { selector: string }) => {
                const res = await sendToContentScript({ action: 'extractText', selector });
                return res?.text || 'Không tìm thấy element với selector này';
            },
        },
        {
            name: 'extractAllTexts',
            description: 'Trích xuất tất cả texts từ các elements matching selector CSS',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: "CSS selector để match nhiều elements, ví dụ: 'li', '.item', 'h2'",
                    },
                    limit: {
                        type: 'number',
                        description: 'Số lượng tối đa elements cần lấy (mặc định 10)',
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector, limit = 10 }: { selector: string; limit?: number }) => {
                return await sendToContentScript({ action: 'extractAllTexts', selector, limit });
            },
        },
        {
            name: 'clickElement',
            description: 'Click vào element theo selector (button, link, v.v.)',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: "CSS selector của element cần click, ví dụ: 'button.submit', '#login-btn'",
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector }: { selector: string }) => {
                const res = await sendToContentScript({ action: 'click', selector });
                return res?.success ? 'Đã click thành công' : 'Không tìm thấy element để click';
            },
        },
        {
            name: 'fillInput',
            description: 'Điền giá trị vào input hoặc textarea',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: "CSS selector của input/textarea, ví dụ: 'input[name=\"email\"]', '#password'",
                    },
                    value: {
                        type: 'string',
                        description: 'Giá trị cần điền vào',
                    },
                },
                required: ['selector', 'value'],
            },
            handler: async ({ selector, value }: { selector: string; value: string }) => {
                const res = await sendToContentScript({ action: 'fill', selector, value });
                return res?.success ? 'Đã điền giá trị thành công' : 'Không tìm thấy input để điền';
            },
        },
        {
            name: 'getInputValue',
            description: 'Lấy giá trị hiện tại của input/textarea/select',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: "CSS selector của input, ví dụ: 'input[name=\"email\"]'",
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector }: { selector: string }) => {
                const res = await sendToContentScript({ action: 'getInputValue', selector });
                return res?.found ? res.value : 'Không tìm thấy input';
            },
        },
        {
            name: 'scrollPage',
            description: 'Scroll trang web lên, xuống hoặc đến element cụ thể',
            parameters: {
                type: 'object',
                properties: {
                    direction: {
                        type: 'string',
                        enum: ['up', 'down', 'top', 'bottom', 'to-element'],
                        description: "'up', 'down', 'top', 'bottom' hoặc 'to-element'",
                    },
                    selector: {
                        type: 'string',
                        description: "CSS selector nếu direction là 'to-element'",
                    },
                },
                required: ['direction'],
            },
            handler: async ({ direction, selector }: { direction: string; selector?: string }) => {
                const res = await sendToContentScript({ action: 'scroll', direction, selector });
                return res?.success ? 'Đã scroll thành công' : 'Không thể scroll';
            },
        },
        {
            name: 'highlightElement',
            description: 'Highlight (đánh dấu) element trên trang để người dùng dễ thấy',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector của element cần highlight',
                    },
                    color: {
                        type: 'string',
                        description: "Màu viền highlight (mặc định: 'red')",
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector, color = 'red' }: { selector: string; color?: string }) => {
                const res = await sendToContentScript({ action: 'highlight', selector, color });
                return res?.success ? 'Đã highlight element' : 'Không tìm thấy element';
            },
        },
        {
            name: 'getAllLinks',
            description: 'Lấy danh sách tất cả links (href và text) trên trang',
            parameters: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'Số lượng links tối đa cần lấy (mặc định 20)',
                    },
                },
                required: [],
            },
            handler: async ({ limit = 20 }: { limit?: number }) => {
                return await sendToContentScript({ action: 'getAllLinks', limit });
            },
        },
        {
            name: 'getElementHtml',
            description: 'Lấy HTML của element theo selector',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector của element',
                    },
                    outerHtml: {
                        type: 'boolean',
                        description: 'Lấy outerHTML (bao gồm cả tag element) hay chỉ innerHTML (mặc định: false)',
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector, outerHtml = false }: { selector: string; outerHtml?: boolean }) => {
                const res = await sendToContentScript({ action: 'getHtml', selector, outerHtml });
                return res?.found ? res.html : 'Không tìm thấy element';
            },
        },
    ];
}
