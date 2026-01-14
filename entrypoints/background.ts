export default defineBackground(() => {
  console.log('[My Web Helper] Background service worker started', { id: browser.runtime.id });

  // Xử lý khi extension được cài đặt
  browser.runtime.onInstalled.addListener((details) => {
    console.log('[My Web Helper] Extension installed:', details.reason);
    
    if (details.reason === 'install') {
      // Lần đầu cài đặt - có thể mở trang welcome
      console.log('[My Web Helper] First time install');
    } else if (details.reason === 'update') {
      // Update extension
      console.log('[My Web Helper] Extension updated');
    }
  });

  // Relay message nếu cần (optional - popup có thể gửi trực tiếp đến content script)
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Log messages for debugging
    console.log('[My Web Helper] Background received message:', message, 'from:', sender);
    
    // Có thể thêm logic relay hoặc xử lý ở đây nếu cần
    return false;
  });
});
