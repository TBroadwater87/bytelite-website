import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ByteLite Error Boundary caught:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Send error to monitoring service in production
    if (import.meta.env.PROD) {
      // TODO: Integrate with error monitoring service (e.g., Sentry)
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We apologize for the inconvenience. Please try refreshing the page.</p>
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error details (development only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    throw error; // This will be caught by the nearest ErrorBoundary
  };
}

// Wrapper component for async errors
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(new Error(event.message));
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  
  if (error) {
    throw error;
  }
  
  return <>{children}</>;
}