"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/Button";
import { toast } from "sonner"; // Assuming sonner is used, or replace with appropriate toast lib

interface ActionButtonProps extends ButtonProps {
    action: () => Promise<void>;
    onSuccess?: () => void;
    onError?: (error: any) => void;
    loadingText?: string;
    minLoadingTime?: number; // Minimum time to show loading state in ms
}

export function ActionButton({
    action,
    onSuccess,
    onError,
    loadingText = "Processing...",
    minLoadingTime = 300,
    children,
    disabled,
    ...props
}: ActionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoading) return;

        // Prevent default if it's a form button (optional, but safer)
        if (props.type !== "submit") {
            e.preventDefault();
        }

        setIsLoading(true);
        const startTime = Date.now();

        try {
            await action();

            // Enforce minimum loading time
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < minLoadingTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
            }

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Action failed:", error);
            const message = error.message || "An unexpected error occurred.";
            toast.error(message);
            if (onError) onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading || disabled}
            isLoading={isLoading}
            {...props}
        >
            {isLoading ? loadingText : children}
        </Button>
    );
}
