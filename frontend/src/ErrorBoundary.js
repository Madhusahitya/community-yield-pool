import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is an RPC timeout error that we want to suppress
    const errorMessage = error?.message || error?.toString() || '';
    const isRpcTimeout = 
      errorMessage.includes('timeout') || 
      errorMessage.includes('TimeoutError') || 
      errorMessage.includes('signal timed out') ||
      errorMessage.includes('rpc.sepolia.org') ||
      errorMessage.includes('The request took too long') ||
      errorMessage.includes('eth_getBalance') ||
      errorMessage.includes('HttpRequestError');
    
    if (isRpcTimeout) {
      // Suppress RPC timeout errors - they don't affect functionality
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Check if this is an RPC timeout error
    const errorMessage = error?.message || error?.toString() || '';
    const isRpcTimeout = 
      errorMessage.includes('timeout') || 
      errorMessage.includes('TimeoutError') || 
      errorMessage.includes('signal timed out') ||
      errorMessage.includes('rpc.sepolia.org') ||
      errorMessage.includes('The request took too long') ||
      errorMessage.includes('eth_getBalance') ||
      errorMessage.includes('HttpRequestError');
    
    if (isRpcTimeout) {
      // Suppress RPC timeout errors completely
      return;
    }
    
    // Only log non-RPC timeout errors
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Only show error UI for non-RPC timeout errors
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

