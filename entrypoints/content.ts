export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('[My Web Helper] Content script loaded');

    // Listener cho messages từ popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        switch (request.action) {
          case 'getPageInfo':
            handleGetPageInfo(sendResponse);
            break;
          case 'extractText':
            handleExtractText(request.selector, sendResponse);
            break;
          case 'extractAllTexts':
            handleExtractAllTexts(request.selector, request.limit, sendResponse);
            break;
          case 'click':
            handleClick(request.selector, sendResponse);
            break;
          case 'fill':
            handleFill(request.selector, request.value, sendResponse);
            break;
          case 'getInputValue':
            handleGetInputValue(request.selector, sendResponse);
            break;
          case 'scroll':
            handleScroll(request.direction, request.selector, sendResponse);
            break;
          case 'highlight':
            handleHighlight(request.selector, request.color, sendResponse);
            break;
          case 'getAllLinks':
            handleGetAllLinks(request.limit, sendResponse);
            break;
          case 'getHtml':
            handleGetHtml(request.selector, request.outerHtml, sendResponse);
            break;
          default:
            sendResponse({ error: 'Unknown action' });
        }
      } catch (error) {
        sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return true; // Giữ channel mở cho async response
    });

    // Handler: Lấy thông tin tổng quan trang
    function handleGetPageInfo(sendResponse: (response: any) => void) {
      const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
      const h1Elements = document.querySelectorAll('h1');
      const h1Texts = Array.from(h1Elements).map((h) => h.textContent?.trim()).filter(Boolean);

      sendResponse({
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        totalElements: document.querySelectorAll('*').length,
        inputsCount: document.querySelectorAll('input, textarea, select').length,
        buttonsCount: document.querySelectorAll('button, input[type="submit"], input[type="button"]').length,
        linksCount: document.querySelectorAll('a[href]').length,
        imagesCount: document.querySelectorAll('img').length,
        formsCount: document.querySelectorAll('form').length,
        metaDescription: metaDescription?.content || '',
        metaKeywords: metaKeywords?.content || '',
        h1Texts: h1Texts,
        language: document.documentElement.lang || 'unknown',
      });
    }

    // Handler: Trích xuất text từ selector
    function handleExtractText(selector: string, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector);
      sendResponse({
        text: el?.textContent?.trim() || '',
        found: !!el,
      });
    }

    // Handler: Trích xuất nhiều texts
    function handleExtractAllTexts(selector: string, limit: number = 10, sendResponse: (response: any) => void) {
      const elements = document.querySelectorAll(selector);
      const texts = Array.from(elements)
        .slice(0, limit)
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
      sendResponse({
        texts,
        totalFound: elements.length,
      });
    }

    // Handler: Click vào element
    function handleClick(selector: string, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.click();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    }

    // Handler: Điền giá trị vào input
    function handleFill(selector: string, value: string, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Input not found' });
      }
    }

    // Handler: Lấy giá trị input
    function handleGetInputValue(selector: string, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el) {
        sendResponse({ value: el.value, found: true });
      } else {
        sendResponse({ value: null, found: false });
      }
    }

    // Handler: Scroll trang
    function handleScroll(direction: string, selector?: string, sendResponse?: (response: any) => void) {
      try {
        switch (direction) {
          case 'up':
            window.scrollBy({ top: -500, behavior: 'smooth' });
            break;
          case 'down':
            window.scrollBy({ top: 500, behavior: 'smooth' });
            break;
          case 'top':
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case 'bottom':
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            break;
          case 'to-element':
            if (selector) {
              const el = document.querySelector(selector);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
            break;
        }
        sendResponse?.({ success: true });
      } catch {
        sendResponse?.({ success: false });
      }
    }

    // Handler: Highlight element
    function handleHighlight(selector: string, color: string = 'red', sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        // Lưu style cũ
        const originalOutline = el.style.outline;
        const originalOutlineOffset = el.style.outlineOffset;

        // Apply highlight
        el.style.outline = `3px solid ${color}`;
        el.style.outlineOffset = '2px';

        // Scroll đến element
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Bỏ highlight sau 3 giây
        setTimeout(() => {
          el.style.outline = originalOutline;
          el.style.outlineOffset = originalOutlineOffset;
        }, 3000);

        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    }

    // Handler: Lấy tất cả links
    function handleGetAllLinks(limit: number = 20, sendResponse: (response: any) => void) {
      const linkElements = document.querySelectorAll('a[href]');
      const links = Array.from(linkElements)
        .slice(0, limit)
        .map((a) => ({
          href: (a as HTMLAnchorElement).href,
          text: a.textContent?.trim() || '',
        }))
        .filter((link) => link.href && link.text);
      sendResponse({
        links,
        totalFound: linkElements.length,
      });
    }

    // Handler: Lấy HTML của element
    function handleGetHtml(selector: string, outerHtml: boolean = false, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector);
      if (el) {
        const html = outerHtml ? el.outerHTML : el.innerHTML;
        // Giới hạn độ dài HTML trả về
        const truncatedHtml = html.length > 5000 ? html.substring(0, 5000) + '...(truncated)' : html;
        sendResponse({ html: truncatedHtml, found: true });
      } else {
        sendResponse({ html: null, found: false });
      }
    }
  },
});
