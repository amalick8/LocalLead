import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      
      // Check if it's a Supabase configuration error
      if (errorMessage.includes('VITE_SUPABASE') || errorMessage.includes('supabaseKey')) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8 shadow-sm">
              <h1 className="text-2xl font-semibold text-slate-900 mb-4">Configuration Error</h1>
              <p className="text-slate-600 mb-4">
                {errorMessage}
              </p>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-900 mb-2">To fix this:</p>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Create a <code className="bg-slate-200 px-1 rounded">.env</code> file in the project root</li>
                  <li>Add the following variables:</li>
                </ol>
                <pre className="mt-3 text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=https://txjepqarsckyawlsfbxg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_taq5yneBLC74vqIgNkB3bg_ANKJSkAO`}
                </pre>
                <p className="text-xs text-slate-500 mt-3">
                  After adding the .env file, restart the dev server.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
