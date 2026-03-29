'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches CAPTCHA and Clerk initialization failures
 * on auth pages, showing a user-friendly retry UI instead of a broken form.
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleFullReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isCaptchaError = this.state.error?.message
        ?.toLowerCase()
        .includes('captcha');

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-800">
            {isCaptchaError
              ? 'Security verification failed to load'
              : 'Something went wrong'}
          </h2>
          <p className="max-w-md text-sm text-red-600">
            {isCaptchaError
              ? 'The CAPTCHA could not load. This may be caused by a browser extension (e.g. an ad blocker) or network issue.'
              : 'An unexpected error occurred while loading the sign-up form.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={this.handleFullReload}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
