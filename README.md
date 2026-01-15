# My Web Helper - Chrome Extension (Internal LY Company Use)

🤖 **Chrome Extension chat AI với GenAI Gateway**

## ✨ Tính năng

- 💬 **Chat AI thông minh**: Hỏi AI về nội dung trang web hiện tại với markdown rendering
- 🔍 **Inspect Elements**: Kiểm tra và phân tích elements trên trang web
- 🌐 **Network Monitoring**: Theo dõi và liệt kê network requests với filtering và pagination
- 🖥️ **JavaScript Execution**: Chạy JavaScript code tùy chỉnh trên trang
- 📄 **Page Source**: Lấy source code HTML của trang
- 🎯 **Tool Call Visibility**: Hiển thị chi tiết các tool calls trong giao diện chat
- 🔧 **Model Selection**: Chọn model AI (gpt-4o, gpt-4.1, gpt-5-mini)
- 🔒 **Bảo mật**: API key lưu cục bộ, không gửi dữ liệu lên server
- 🌐 **Tương thích**: Hoạt động trên mọi trang web
- 🏢 **Internal Proxy**: Sử dụng GenAI Gateway proxy của LY ChatAI

## 🔑 Lấy API Key

Extension này sử dụng **Internal API Key** hoặc **PAT (Personal Access Token)** của GenAI Gateway, **KHÔNG phải** OpenAI API Key.

### Cách lấy PAT (Dành cho nhân viên đã hoàn thành LY Class):

1. Truy cập: [https://chatai.workers-hub.com/dashboard/](https://chatai.workers-hub.com/dashboard/)
2. Đọc và đồng ý với điều khoản
3. Click "Issue PAT" để tạo token
4. Copy token (bắt đầu bằng `ck-...`)

### Cách lấy Internal API Key:

Liên hệ với GenAI Gateway team qua kênh [#ext-help-ly-chatai](https://workers-hub.enterprise.slack.com/archives/C06GJT6J9HB)

**Lưu ý về PAT:**
- Rate limit: 1 request/giây
- Chỉ hỗ trợ `/v1/chat/completions` endpoint
- Dùng cho mục đích cá nhân và thử nghiệm

**Tài liệu đầy đủ:** [GenAI Gateway Getting Started](https://wiki-api-proxy.workers-hub.com/pages/viewpage.action?pageId=777182841)

## 🚀 Cài đặt

### Manual Installation

1. Download `my-web-helper-1.0.0-chrome.zip` từ [Releases](https://github.com/tainn03/my-web-helper/releases)
2. Giải nén file
3. Mở Chrome → `chrome://extensions/`
4. Bật "Developer mode"
5. Click "Load unpacked" → Chọn thư mục đã giải nén
6. Extension sẽ xuất hiện!

## 💡 Cách sử dụng

1. **Nhập Internal API Key hoặc PAT**: Click icon extension → Nhập key từ GenAI Gateway và chọn model AI
2. **Chat với AI**: Hỏi về trang web hiện tại, AI sẽ sử dụng các tools để tương tác
3. **Xem Tool Calls**: Theo dõi các tool calls trong giao diện chat

### Ví dụ câu hỏi:

- "What is the main content of this page?"
- "How many products are listed here?"
- "Inspect the main heading element"
- "List the last 10 network requests"
- "Execute JavaScript to change background color"
- "Get the page source code"

## 🛠️ Công nghệ

- **Framework**: React + TypeScript
- **Build Tool**: WXT (Web Extension Toolkit)
- **AI**: GenAI Gateway (OpenAI proxy) & Function Calling
- **Storage**: Chrome Storage API
- **Manifest**: V3 (Chrome Extension Manifest V3)

## 🌐 GenAI Gateway Configuration

Extension này được cấu hình để sử dụng:
- **Proxy Endpoint**: `https://genai-gateway.flava-cloud.com/v1`
- **Custom Headers**: 
  - `X-Title`: Định danh ứng dụng cho tracking
  - `X-User-Id`: ID nhân viên (tùy chọn, có thể thêm sau)

Chi tiết về các model được hỗ trợ, xem: [GenAI Gateway対応モデル早見表](https://wiki.workers-hub.com/pages/viewpage.action?pageId=2691127037)

## 📦 Build & Development

```bash
# Cài đặt dependencies
npm install

# Development mode
npm run dev

# Build production
npm run build

# Tạo ZIP để deploy
npm run zip

# Tạo source code ZIP
npm run zip:source
```

⭐ **Nếu bạn thấy hữu ích, hãy cho chúng tôi một ngôi sao!**
