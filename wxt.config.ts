import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'My Web Helper',
    description: 'Chrome Extension chat AI với OpenAI - Đọc và tương tác với trang web',
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['<all_urls>'],
    action: {
      default_popup: 'popup.html',
      default_title: 'My Web Helper',
    },
  },
});
