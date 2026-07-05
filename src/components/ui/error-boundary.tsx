"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error(error, "[ErrorBoundary] Uncaught error: %s", error.message);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="mx-auto max-w-lg py-24 text-center" role="alert">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Something went wrong</h2>
          <p className="mb-2 text-sm text-zinc-400">
            An unexpected error occurred. Our team has been notified.
          </p>
          {this.state.error && (
            <details className="mb-6 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3 text-left">
              <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-400">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </Button>
            <Button className="gap-2" onClick={() => { window.location.href = "/automation-studio"; }}>
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
