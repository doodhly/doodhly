"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/Button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
                    <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl text-center space-y-6">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-brand-blue">Something went wrong</h1>
                        <p className="text-gray-500">We've encountered an unexpected error. Please try refreshing the page or contacting support.</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-brand-blue text-white py-4 text-lg"
                        >
                            Refresh Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
