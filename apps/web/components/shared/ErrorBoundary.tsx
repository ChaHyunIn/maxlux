'use client'
import { Component, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };
    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return <ErrorFallback />;
        }
        return this.props.children;
    }
}
