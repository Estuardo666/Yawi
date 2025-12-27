import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error Boundary for the root
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Totem Manager Root Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{ padding: '2rem', margin: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong in Totem Manager.</h2>
          <p>Please check the console for details or refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('totem-manager-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  // Fallback for dev environment or testing if index.html is present
  const devRoot = document.getElementById('root');
  if (devRoot) {
      ReactDOM.createRoot(devRoot).render(
          <React.StrictMode>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </React.StrictMode>
        );
  } else {
      console.error('Totem Manager: Root element not found');
  }
}
