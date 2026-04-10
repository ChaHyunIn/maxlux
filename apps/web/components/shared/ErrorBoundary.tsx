'use client'
import { Component } from 'react';
import { ErrorFallback } from './ErrorFallback';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };
    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        // TODO: Sentry 또는 에러 리포팅 서비스 연동
    }
    render() {
        if (this.state.hasError) {
            return <ErrorFallback />;
        }
        return this.props.children;
    }
}
