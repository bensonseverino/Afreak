import { Component } from 'react';

/**
 * Catches render-time errors anywhere inside the app tree and shows a small
 * branded fallback instead of leaving the public storefront blank.
 *
 * The public storefront renders `<AccountProvider>` at the root, and that
 * provider's `useMe()` can throw for a signed-out visitor (HTTP 401). This
 * boundary keeps that from turning the whole page into a white screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, info: error };
  }

  componentDidCatch(error, info) {
    // In production you would send this to an error tracker. For now we log
    // it so a dev/caught session can inspect the cause.
    console.error('[ErrorBoundary] app render error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-paper flex items-center justify-center p-6 font-sans text-center"
          style={{ color: 'var(--ink, #111)' }}
        >
          <div className="max-w-md">
            <h1
              className="font-display font-bold uppercase text-3xl mb-4"
              style={{ fontFamily: 'var(--display, Archivo, sans-serif)' }}
            >
              Something went wrong
            </h1>
            <p className="text-graphite mb-8" style={{ color: 'var(--graphite, #555)' }}>
              We could not load the storefront right now.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="font-sans font-semibold uppercase text-xs tracking-label underline"
              style={{ color: 'var(--ink, #111)' }}
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
