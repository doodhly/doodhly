"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { smoothEase } from "@/lib/motion";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    tilt?: boolean;
    intensity?: "light" | "medium" | "heavy";
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, tilt = false, intensity = "medium", hoverEffect = false }: GlassCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!tilt || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Subtle tilt
        const rotateY = ((x - centerX) / centerX) * 5;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
            transition: `transform 0.1s cubic-bezier(${smoothEase.join(',')})`,
        });
    };

    const handleMouseLeave = () => {
        if (!tilt) return;
        setStyle({
            transform: "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)",
            transition: "transform 0.5s ease-out",
        });
    };

    const bgStyles = {
        light: "bg-white/40 border-white/40",
        medium: "bg-white/60 border-white/50",
        heavy: "bg-white/80 border-white/60"
    };

    return (
        <LazyMotion features={domAnimation}>
        <m.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "backdrop-blur-xl border shadow-xl rounded-2xl relative overflow-hidden transform-gpu will-change-transform",
                bgStyles[intensity],
                tilt ? "transform-style-3d cursor-default" : "",
                hoverEffect ? "hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out" : "",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </m.div>
        </LazyMotion>
    );
}
