'use client'
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };
    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[40vh] flex-col gap-4">
                    <p className="text-gray-500 text-lg">문제가 발생했습니다. 새로고침해주세요.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded-md">새로고침</button>
                </div>
            );
        }
        return this.props.children;
    }
}
