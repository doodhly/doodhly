"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonProps } from "@/components/ui/Button";

interface NavigateButtonProps extends ButtonProps {
    href: string;
}

export function NavigateButton({ href, children, onClick, ...props }: NavigateButtonProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(e);
        router.push(href);
    };

    return (
        <Button onClick={handleClick} {...props}>
            {children}
        </Button>
    );
}
