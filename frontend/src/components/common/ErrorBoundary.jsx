import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AgroRise UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          maxWidth: '700px',
          margin: '40px auto',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid #fee2e2',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌱</div>
          <h2 style={{ color: '#0f381e', fontSize: '1.4rem', marginBottom: '8px' }}>
            അഗ്രോറൈസ് പേജ് ലോഡ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു
          </h2>
          <p style={{ color: '#555', fontSize: '0.92rem', marginBottom: '20px' }}>
            Something went wrong while rendering this section. You can refresh or return to the main feed.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                background: '#0b7a3e',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔄 വീണ്ടും ശ്രമിക്കുക (Retry)
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                background: '#f0fdf4',
                color: '#0b7a3e',
                border: '1px solid #bbf7d0',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🌾 പ്രധാന ഫീഡിലേക്ക് (Main Feed)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
