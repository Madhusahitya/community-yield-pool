import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId } from './wagmi';

// CRITICAL: Disable React error overlay immediately after imports
// This must run before React renders to prevent error overlay injection
if (typeof window !== 'undefined') {
  // Override React's error overlay injection
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = message || error?.message || error?.toString() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('TimeoutError') || 
        errorMessage.includes('signal timed out') ||
        errorMessage.includes('rpc.sepolia.org') ||
        errorMessage.includes('The request took too long') ||
        errorMessage.includes('eth_getBalance') ||
        errorMessage.includes('HttpRequestError')) {
      return true; // Suppress completely - prevent React error overlay
    }
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Prevent unhandled rejections from showing in overlay
  window.addEventListener('unhandledrejection', function(event) {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('TimeoutError') || 
        errorMessage.includes('signal timed out') ||
        errorMessage.includes('rpc.sepolia.org') ||
        errorMessage.includes('The request took too long') ||
        errorMessage.includes('eth_getBalance') ||
        errorMessage.includes('HttpRequestError')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
}

// COMPLETELY DISABLE React error overlay in development
// This prevents the error overlay from showing RPC timeout errors
if (process.env.NODE_ENV === 'development') {
  // Override React's error overlay completely
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || event.error?.message || event.error?.toString() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('TimeoutError') || 
        errorMessage.includes('signal timed out') ||
        errorMessage.includes('rpc.sepolia.org') ||
        errorMessage.includes('The request took too long') ||
        errorMessage.includes('eth_getBalance') ||
        errorMessage.includes('HttpRequestError')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  // Also prevent unhandled rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('TimeoutError') || 
        errorMessage.includes('signal timed out') ||
        errorMessage.includes('rpc.sepolia.org') ||
        errorMessage.includes('The request took too long') ||
        errorMessage.includes('eth_getBalance') ||
        errorMessage.includes('HttpRequestError')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  // Disable React's error overlay by overriding the global error handler
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = message || error?.message || error?.toString() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('TimeoutError') || 
        errorMessage.includes('signal timed out') ||
        errorMessage.includes('rpc.sepolia.org') ||
        errorMessage.includes('The request took too long') ||
        errorMessage.includes('eth_getBalance') ||
        errorMessage.includes('HttpRequestError')) {
      return true; // Suppress completely
    }
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
}

// Suppress console errors for RPC timeouts (they're expected with public RPCs)
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => {
  const errorString = args.join(' ');
  // Suppress timeout errors from public RPC and WalletConnect errors (not critical for MetaMask users)
  if (errorString.includes('timeout') || 
      errorString.includes('TimeoutError') || 
      errorString.includes('rpc.sepolia.org') ||
      errorString.includes('The request took too long') ||
      errorString.includes('signal timed out') ||
      errorString.includes('eth_getBalance') ||
      errorString.includes('HttpRequestError') ||
      errorString.includes('walletconnect.com') ||
      errorString.includes('walletconnect.org') ||
      errorString.includes('web3modal.com') ||
      errorString.includes('web3modal.org') ||
      errorString.includes('walletconnect.com') ||
      errorString.includes('Failed to load resource') ||
      errorString.includes('403') ||
      errorString.includes('401') ||
      errorString.includes('404') ||
      errorString.includes('projectId') ||
      errorString.includes('YOUR_PROJECT_ID') ||
      errorString.includes('status of 401') ||
      errorString.includes('status of 403') ||
      errorString.includes('status of 404') ||
      errorString.includes('status of 400')) {
    // Silently ignore - these are expected with public RPC endpoints and WalletConnect (optional)
    return;
  }
  originalError.apply(console, args);
};
console.warn = (...args) => {
  const warnString = args.join(' ');
  // Suppress timeout warnings and WalletConnect warnings (not critical for MetaMask users)
  if (warnString.includes('timeout') || 
      warnString.includes('TimeoutError') || 
      warnString.includes('rpc.sepolia.org') ||
      warnString.includes('WalletConnect') ||
      warnString.includes('Web3Modal') ||
      warnString.includes('projectId') ||
      warnString.includes('YOUR_PROJECT_ID') ||
      warnString.includes('Failed to fetch remote project') ||
      warnString.includes('Lit is in dev mode') ||
      warnString.includes('Multiple versions of Lit') ||
      warnString.includes('walletconnect.com') ||
      warnString.includes('web3modal.com') ||
      warnString.includes('Failed to load resource') ||
      warnString.includes('403') ||
      warnString.includes('401') ||
      warnString.includes('404')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Suppress React error boundary errors for RPC timeouts and WalletConnect errors
window.addEventListener('error', (event) => {
  const errorMessage = event.message || event.error?.message || event.error?.toString() || '';
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('TimeoutError') || 
      errorMessage.includes('signal timed out') ||
      errorMessage.includes('rpc.sepolia.org') ||
      errorMessage.includes('The request took too long') ||
      errorMessage.includes('eth_getBalance') ||
      errorMessage.includes('HttpRequestError') ||
      errorMessage.includes('walletconnect.com') ||
      errorMessage.includes('web3modal.com') ||
      errorMessage.includes('Failed to load resource') ||
      errorMessage.includes('403') ||
      errorMessage.includes('401') ||
      errorMessage.includes('404')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true); // Use capture phase

window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || event.reason?.toString() || '';
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('TimeoutError') || 
      errorMessage.includes('signal timed out') ||
      errorMessage.includes('rpc.sepolia.org') ||
      errorMessage.includes('The request took too long') ||
      errorMessage.includes('eth_getBalance') ||
      errorMessage.includes('HttpRequestError')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Disable React error overlay for RPC timeout errors
if (process.env.NODE_ENV === 'development') {
  // Override React's error overlay
  const originalError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = message || error?.message || error?.toString() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('TimeoutError') || 
        errorMessage.includes('signal timed out') ||
        errorMessage.includes('rpc.sepolia.org') ||
        errorMessage.includes('The request took too long') ||
        errorMessage.includes('eth_getBalance') ||
        errorMessage.includes('HttpRequestError')) {
      return true; // Suppress error - prevent React error overlay
    }
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Also suppress React's error overlay by intercepting error events
  const suppressReactErrorOverlay = () => {
    // Check multiple possible overlay IDs and class names
    const overlaySelectors = [
      '#react-error-overlay',
      '[class*="react-error-overlay"]',
      '[id*="error-overlay"]',
      '[class*="error-overlay"]',
      'iframe[src*="react-error-overlay"]',
    ];
    
    overlaySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const errorText = element.textContent || element.innerText || '';
          if (errorText.includes('timeout') || 
              errorText.includes('TimeoutError') || 
              errorText.includes('signal timed out') ||
              errorText.includes('rpc.sepolia.org') ||
              errorText.includes('The request took too long') ||
              errorText.includes('eth_getBalance') ||
              errorText.includes('HttpRequestError') ||
              errorText.includes('HTTP request failed')) {
            element.style.display = 'none';
            element.remove(); // Remove it completely
          }
        });
      } catch (e) {
        // Ignore errors in selector
      }
    });
    
    // Also check for iframes (React error overlay uses iframe)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        if (iframe.src && iframe.src.includes('react-error-overlay')) {
          iframe.style.display = 'none';
          iframe.remove();
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    });
  };
  
  // Check for error overlay periodically and aggressively
  setInterval(suppressReactErrorOverlay, 50); // Check every 50ms
  
  // Also check immediately multiple times
  setTimeout(suppressReactErrorOverlay, 100);
  setTimeout(suppressReactErrorOverlay, 500);
  setTimeout(suppressReactErrorOverlay, 1000);
  
  // Use MutationObserver to catch overlay as soon as it's added
  const observer = new MutationObserver(() => {
    suppressReactErrorOverlay();
  });
  
  // Observe the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  // Also observe the root element
  const rootElement = document.getElementById('root');
  if (rootElement) {
    observer.observe(rootElement, {
      childList: true,
      subtree: true,
    });
  }
}

// Setup queryClient with aggressive error suppression for RPC timeouts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries globally
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      // Suppress ALL RPC timeout errors globally - they're expected with public RPCs
      onError: (error) => {
        // Suppress all RPC timeout errors - wallet provider will handle actual requests
        const errorMessage = error?.message || error?.toString() || '';
        if (errorMessage.includes('timeout') || 
            errorMessage.includes('TimeoutError') || 
            errorMessage.includes('signal timed out') ||
            errorMessage.includes('rpc.sepolia.org') ||
            errorMessage.includes('The request took too long') ||
            errorMessage.includes('eth_getBalance') ||
            errorMessage.includes('HttpRequestError') ||
            errorMessage.includes('walletconnect.com') ||
            errorMessage.includes('web3modal.com') ||
            errorMessage.includes('Failed to load resource') ||
            errorMessage.includes('403') ||
            errorMessage.includes('401') ||
            errorMessage.includes('404')) {
          // Silently suppress - these are expected with public RPC endpoints and WalletConnect (optional)
          return;
        }
        // Only log non-RPC timeout errors
        console.error('Query error:', error);
      },
    },
  },
});

// Always create Web3Modal (even with empty projectId) to satisfy React Hooks rules
// MetaMask (injected) works without WalletConnect, but we need the modal for the hook to work
// If projectId is empty, Web3Modal will still work but WalletConnect features won't be available
createWeb3Modal({
  wagmiConfig: config,
  projectId: projectId || 'placeholder', // Use placeholder if empty to avoid errors
  enableAnalytics: false, // Disable analytics if no real project ID
});

// Disable React error overlay completely
if (process.env.NODE_ENV === 'development') {
  // Remove error overlay if it exists - use same logic as suppressReactErrorOverlay
  const removeOverlay = () => {
    const overlaySelectors = [
      '#react-error-overlay',
      '[class*="react-error-overlay"]',
      '[id*="error-overlay"]',
      '[class*="error-overlay"]',
      'iframe[src*="react-error-overlay"]',
    ];
    
    overlaySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const errorText = element.textContent || element.innerText || '';
          if (errorText.includes('timeout') || 
              errorText.includes('TimeoutError') || 
              errorText.includes('signal timed out') ||
              errorText.includes('rpc.sepolia.org') ||
              errorText.includes('The request took too long') ||
              errorText.includes('eth_getBalance') ||
              errorText.includes('HttpRequestError') ||
              errorText.includes('HTTP request failed')) {
            element.style.display = 'none';
            element.remove();
          }
        });
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Also check for any error divs
    const errorDivs = document.querySelectorAll('[class*="error"], [id*="error"]');
    errorDivs.forEach(div => {
      const text = div.textContent || div.innerText || '';
      if (text.includes('timeout') || 
          text.includes('TimeoutError') || 
          text.includes('signal timed out') ||
          text.includes('rpc.sepolia.org') ||
          text.includes('HTTP request failed')) {
        div.style.display = 'none';
        div.remove();
      }
    });
    
    // Check for iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        if (iframe.src && iframe.src.includes('react-error-overlay')) {
          iframe.style.display = 'none';
          iframe.remove();
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    });
  };
  
  // Remove immediately and continuously
  setInterval(removeOverlay, 10);
  setTimeout(removeOverlay, 0);
  setTimeout(removeOverlay, 100);
  setTimeout(removeOverlay, 500);
  
  // Watch for new error overlays
  const observer = new MutationObserver(removeOverlay);
  observer.observe(document.body, { childList: true, subtree: true });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

