# My Web Helper - Chrome Extension

🤖 **Chrome Extension chat AI với OpenAI - Đọc và tương tác với trang web**

## ✨ Tính năng

- 💬 **Chat AI thông minh**: Hỏi AI về nội dung trang web hiện tại
- 🔍 **Đọc DOM**: Trích xuất text, links, thông tin từ trang web
- 🖱️ **Tương tác tự động**: Click buttons, điền forms, scroll
- 🎯 **Highlight elements**: Đánh dấu elements trên trang
- 🔒 **Bảo mật**: API key lưu cục bộ, không gửi dữ liệu lên server
- 🌐 **Tương thích**: Hoạt động trên mọi trang web

## 🚀 Cài đặt

### Manual Installation

1. Download `my-web-helper-1.0.0-chrome.zip` từ [Releases](https://github.com/tainn03/my-web-helper/releases)
2. Giải nén file
3. Mở Chrome → `chrome://extensions/`
4. Bật "Developer mode"
5. Click "Load unpacked" → Chọn thư mục đã giải nén
6. Extension sẽ xuất hiện!

## 💡 Cách sử dụng

1. **Nhập API Key**: Click icon extension → Nhập OpenAI API Key
2. **Chat với AI**: Hỏi về trang web hiện tại
3. **Sử dụng tools**: AI sẽ tự động tương tác với trang

### Ví dụ câu hỏi:

- "Trang này là gì?"
- "Có bao nhiêu sản phẩm?"
- "Liệt kê tất cả links"
- "Click nút đăng nhập"
- "Điền email vào form"

## 🛠️ Công nghệ

- **Framework**: React + TypeScript
- **Build Tool**: WXT (Web Extension Toolkit)
- **AI**: OpenAI GPT-4o-mini với Function Calling
- **Storage**: Chrome Storage API
- **Manifest**: V3 (Chrome Extension Manifest V3)

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

## 🤖 CI/CD

Dự án sử dụng GitHub Actions để tự động hóa quá trình release:

- **Tự động tạo tag**: Khi merge code vào branch `master`, sẽ tự động tạo tag và release mới
- **Tự động build ZIP**: Khi publish release, sẽ tự động build và upload file ZIP extension

Xem chi tiết tại [`.github/workflows/`](.github/workflows/)

⭐ **Nếu bạn thấy hữu ích, hãy cho chúng tôi một ngôi sao!**
