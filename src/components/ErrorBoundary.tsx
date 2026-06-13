import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Avoid noisy logs in production; surface for dev debug.
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <h1 className="text-xl font-serif text-white">Something went wrong</h1>
            <p className="text-sm text-white/70">
              The screen ran into an unexpected issue. Your data is safe.
            </p>
            <button
              onClick={() => {
                this.reset();
                window.location.reload();
              }}
              className="px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm min-h-[44px]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
