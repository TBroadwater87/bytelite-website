// React Error Boundary for compression demo
import React from 'react';

class CompressionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Compression demo error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>Compression Demo Temporarily Unavailable</h3>
          <p>Please contact support if this persists.</p>
        </div>
      );
    }
    return this.props.children;
  }
}