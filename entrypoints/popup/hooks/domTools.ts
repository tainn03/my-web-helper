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
        // ===== DEBUGGING TOOLS =====
        {
            name: 'take_snapshot',
            description: 'Lấy snapshot text của trang hiện tại (title, URL, số elements, danh sách links chính). Luôn dùng tool này trước để hiểu cấu trúc trang.',
            parameters: {
                type: 'object',
                properties: {
                    verbose: {
                        type: 'boolean',
                        description: 'Bao gồm thêm thông tin chi tiết (mặc định: false)',
                    },
                },
                required: [],
            },
            handler: async ({ verbose = false }: { verbose?: boolean }) => {
                return await sendToContentScript({ action: 'take_snapshot', verbose });
            },
        },
        {
            name: 'evaluate_script',
            description: 'Chạy JavaScript function trong trang web và trả về kết quả dạng JSON',
            parameters: {
                type: 'object',
                properties: {
                    function: {
                        type: 'string',
                        description: 'JavaScript function để thực thi. Ví dụ: "() => { return document.title }" hoặc "(selector) => { return document.querySelector(selector)?.innerText }"',
                    },
                    args: {
                        type: 'array',
                        description: 'Mảng arguments để truyền vào function',
                        items: {},
                    },
                },
                required: ['function'],
            },
            handler: async ({ function: func, args = [] }: { function: string; args?: any[] }) => {
                return await sendToContentScript({ action: 'evaluate_script', function: func, args });
            },
        },

        // ===== INPUT AUTOMATION TOOLS =====
        {
            name: 'click',
            description: 'Click vào element theo CSS selector',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector của element cần click',
                    },
                    dblClick: {
                        type: 'boolean',
                        description: 'Double click thay vì single click (mặc định: false)',
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector, dblClick = false }: { selector: string; dblClick?: boolean }) => {
                const res = await sendToContentScript({ action: 'click', selector, dblClick });
                return res?.success ? 'Đã click thành công' : res?.error || 'Không tìm thấy element';
            },
        },
        {
            name: 'fill',
            description: 'Điền text vào input, textarea hoặc select option',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector của input/textarea/select',
                    },
                    value: {
                        type: 'string',
                        description: 'Giá trị cần điền',
                    },
                },
                required: ['selector', 'value'],
            },
            handler: async ({ selector, value }: { selector: string; value: string }) => {
                const res = await sendToContentScript({ action: 'fill', selector, value });
                return res?.success ? 'Đã điền giá trị thành công' : res?.error || 'Không tìm thấy element';
            },
        },
        {
            name: 'hover',
            description: 'Hover (di chuột) lên element',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector của element',
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector }: { selector: string }) => {
                const res = await sendToContentScript({ action: 'hover', selector });
                return res?.success ? 'Đã hover thành công' : res?.error || 'Không tìm thấy element';
            },
        },
        {
            name: 'press_key',
            description: 'Nhấn phím hoặc tổ hợp phím (keyboard shortcuts)',
            parameters: {
                type: 'object',
                properties: {
                    key: {
                        type: 'string',
                        description: 'Phím hoặc tổ hợp phím. Ví dụ: "Enter", "Control+A", "Control+Shift+R"',
                    },
                },
                required: ['key'],
            },
            handler: async ({ key }: { key: string }) => {
                const res = await sendToContentScript({ action: 'press_key', key });
                return res?.success ? `Đã nhấn phím: ${key}` : res?.error || 'Không thể nhấn phím';
            },
        },

        // ===== NAVIGATION TOOLS =====
        {
            name: 'navigate_page',
            description: 'Điều hướng trang (URL mới, back, forward, reload)',
            parameters: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['url', 'back', 'forward', 'reload'],
                        description: 'Loại điều hướng',
                    },
                    url: {
                        type: 'string',
                        description: 'URL đích (chỉ dùng khi type="url")',
                    },
                },
                required: ['type'],
            },
            handler: async ({ type, url }: { type: string; url?: string }) => {
                const res = await sendToContentScript({ action: 'navigate_page', type, url });
                return res?.success ? 'Đã điều hướng thành công' : res?.error || 'Không thể điều hướng';
            },
        },

        // ===== UTILITY TOOLS =====
        {
            name: 'scroll_page',
            description: 'Scroll trang (up, down, top, bottom, hoặc đến element)',
            parameters: {
                type: 'object',
                properties: {
                    direction: {
                        type: 'string',
                        enum: ['up', 'down', 'top', 'bottom', 'to-element'],
                        description: 'Hướng scroll',
                    },
                    selector: {
                        type: 'string',
                        description: 'CSS selector (chỉ dùng khi direction="to-element")',
                    },
                },
                required: ['direction'],
            },
            handler: async ({ direction, selector }: { direction: string; selector?: string }) => {
                const res = await sendToContentScript({ action: 'scroll', direction, selector });
                return res?.success ? 'Đã scroll thành công' : res?.error || 'Không thể scroll';
            },
        },
        {
            name: 'highlight_element',
            description: 'Highlight (đánh dấu màu) element để dễ nhận diện',
            parameters: {
                type: 'object',
                properties: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector của element',
                    },
                    color: {
                        type: 'string',
                        description: 'Màu highlight (mặc định: "red")',
                    },
                },
                required: ['selector'],
            },
            handler: async ({ selector, color = 'red' }: { selector: string; color?: string }) => {
                const res = await sendToContentScript({ action: 'highlight', selector, color });
                return res?.success ? 'Đã highlight element' : res?.error || 'Không tìm thấy element';
            },
        },
    ];
}
