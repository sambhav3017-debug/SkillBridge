"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="my-6 flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] backdrop-blur-xl"
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
            <AlertTriangle size={28} />
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {this.props.fallbackTitle || "Something went wrong in this section"}
          </h3>

          <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            An unexpected error occurred while rendering this interface. Your data is safe.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <RefreshCw size={14} />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm"
            >
              <Home size={14} />
              Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
