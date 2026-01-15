export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('[My Web Helper] Content script loaded');

    // Listener cho messages từ popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        switch (request.action) {
          // Debugging tools
          case 'take_snapshot':
            handleTakeSnapshot(request.verbose, sendResponse);
            break;
          case 'evaluate_script':
            handleEvaluateScript(request.function, request.args, sendResponse);
            break;
          
          // Input automation
          case 'click':
            handleClick(request.selector, request.dblClick, sendResponse);
            break;
          case 'fill':
            handleFill(request.selector, request.value, sendResponse);
            break;
          case 'hover':
            handleHover(request.selector, sendResponse);
            break;
          case 'press_key':
            handlePressKey(request.key, sendResponse);
            break;
          
          // Navigation
          case 'navigate_page':
            handleNavigatePage(request.type, request.url, sendResponse);
            break;
          
          // Utilities
          case 'scroll':
            handleScroll(request.direction, request.selector, sendResponse);
            break;
          case 'highlight':
            handleHighlight(request.selector, request.color, sendResponse);
            break;
          
          default:
            sendResponse({ error: 'Unknown action' });
        }
      } catch (error) {
        sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
      return true; // Giữ channel mở cho async response
    });

    function handleTakeSnapshot(verbose: boolean = false, sendResponse: (response: any) => void) {
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => ({
          href: (a as HTMLAnchorElement).href,
          text: a.textContent?.trim() || '',
        }))
        .filter((link) => link.href && link.text);

      const snapshot = {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        totalElements: document.querySelectorAll('*').length,
        inputsCount: document.querySelectorAll('input, textarea, select').length,
        buttonsCount: document.querySelectorAll('button, input[type="submit"]').length,
        linksCount: document.querySelectorAll('a[href]').length,
        imagesCount: document.querySelectorAll('img').length,
        formsCount: document.querySelectorAll('form').length,
        mainHeadings: Array.from(document.querySelectorAll('h1, h2')).map((h) => h.textContent?.trim()),
        topLinks: links,
      };

      if (verbose) {
        const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        Object.assign(snapshot, {
          metaDescription: metaDescription?.content || '',
          language: document.documentElement.lang,
          bodyText: document.body.textContent,
        });
      }

      sendResponse(snapshot);
    }

    function handleEvaluateScript(functionStr: string, args: any[] = [], sendResponse: (response: any) => void) {
      const scriptId = 'my-web-helper-eval-' + Date.now();

      // Create script to inject into page
      const script = document.createElement('script');
      script.id = scriptId;
      script.textContent = `
        (async () => {
          try {
            const result = await (${functionStr})(...${JSON.stringify(args)});
            window.postMessage({ type: 'eval_result', id: '${scriptId}', result }, '*');
          } catch (error) {
            window.postMessage({ type: 'eval_error', id: '${scriptId}', error: error.message }, '*');
          }
        })();
      `;

      // Promise to handle the response
      const waitForResult = new Promise((resolve) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.id === scriptId) {
            window.removeEventListener('message', handleMessage);
            document.getElementById(scriptId)?.remove();
            resolve(event.data);
          }
        };
        window.addEventListener('message', handleMessage);

        // Timeout after 10 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          document.getElementById(scriptId)?.remove();
          resolve({ type: 'eval_error', error: 'Script execution timed out' });
        }, 10000);
      });

      // Execute and respond
      document.head.appendChild(script);
      waitForResult.then((data: any) => {
        if (data.type === 'eval_result') {
          sendResponse({ result: data.result, success: true });
        } else {
          sendResponse({ error: data.error, success: false });
        }
      });
    }

    // ===== INPUT AUTOMATION HANDLERS =====
    function handleClick(selector: string, dblClick: boolean = false, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        if (dblClick) {
          el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
        } else {
          el.click();
        }
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    }

    function handleFill(selector: string, value: string, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el) {
        if (el.tagName === 'SELECT') {
          el.value = value;
        } else {
          el.value = value;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    }

    function handleHover(selector: string, sendResponse: (response: any) => void) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    }

    function handlePressKey(key: string, sendResponse: (response: any) => void) {
      try {
        const parts = key.split('+');
        const mainKey = parts[parts.length - 1];
        const modifiers = {
          ctrlKey: parts.includes('Control'),
          shiftKey: parts.includes('Shift'),
          altKey: parts.includes('Alt'),
          metaKey: parts.includes('Meta'),
        };

        const event = new KeyboardEvent('keydown', {
          key: mainKey,
          code: mainKey,
          ...modifiers,
          bubbles: true,
          cancelable: true,
        });

        document.activeElement?.dispatchEvent(event) || document.dispatchEvent(event);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // ===== NAVIGATION HANDLERS =====
    function handleNavigatePage(type: string, url?: string, sendResponse?: (response: any) => void) {
      try {
        switch (type) {
          case 'url':
            if (url) window.location.href = url;
            break;
          case 'back':
            window.history.back();
            break;
          case 'forward':
            window.history.forward();
            break;
          case 'reload':
            window.location.reload();
            break;
        }
        sendResponse?.({ success: true });
      } catch (error) {
        sendResponse?.({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
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
        const originalOutline = el.style.outline;
        const originalOutlineOffset = el.style.outlineOffset;

        el.style.outline = `3px solid ${color}`;
        el.style.outlineOffset = '2px';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          el.style.outline = originalOutline;
          el.style.outlineOffset = originalOutlineOffset;
        }, 3000);

        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Element not found' });
      }
    }
  },
});
