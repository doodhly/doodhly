import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    cream: "#FFFBF2",
                    "cream-dark": "#F5F0E8",
                    blue: "#0F2C59",
                    "blue-dark": "#0A1F3D",
                    "blue-light": "#E3F2FD",
                    green: "#43A047",
                    "green-light": "#66BB6A",
                    red: "#D32F2F",
                    accent: "#FFB300",
                    "accent-light": "#FFC107",
                    milk: "#FFFFFF",
                    "milk-glass": "rgba(255, 255, 255, 0.85)",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                serif: ["var(--font-merriweather)"],
                display: ["var(--font-space-grotesk)"],
            },
            // 3D TRANSFORMS & PERSPECTIVE
            transformStyle: {
                "3d": "preserve-3d",
                flat: "flat",
            },
            perspective: {
                "none": "none",
                "500": "500px",
                "1000": "1000px",
                "1500": "1500px",
                "2000": "2000px",
            },
            perspectiveOrigin: {
                center: "center",
                top: "top",
                bottom: "bottom",
                left: "left",
                right: "right",
            },
            backfaceVisibility: {
                visible: "visible",
                hidden: "hidden",
            },
            rotate: {
                "y-180": "rotateY(180deg)",
                "x-180": "rotateX(180deg)",
                "y-90": "rotateY(90deg)",
                "x-90": "rotateX(90deg)",
            },
            translate: {
                "z-0": "translateZ(0)",
                "z-10": "translateZ(10px)",
                "z-20": "translateZ(20px)",
                "z-50": "translateZ(50px)",
                "z-100": "translateZ(100px)",
            },
            scale: {
                "3d": "scale3d(var(--tw-scale-x), var(--tw-scale-y), var(--tw-scale-z))",
            },
            // GLASS MORPHISM
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4))",
                "glass-dark": "linear-gradient(135deg, rgba(15, 44, 89, 0.9), rgba(15, 44, 89, 0.6))",
                "milk-splash": "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
                "liquid-wave": "linear-gradient(180deg, rgba(67,160,71,0.1) 0%, rgba(67,160,71,0.05) 100%)",
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                "3d": "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                "floating": "0 20px 60px -15px rgba(0, 0, 0, 0.3)",
                "glow": "0 0 40px rgba(255, 179, 0, 0.3)",
                "inner-glow": "inset 0 0 20px rgba(255, 255, 255, 0.5)",
            },
            // ADVANCED ANIMATIONS
            keyframes: {
                // Entrance animations
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(30px) translateZ(-50px)" },
                    "100%": { opacity: "1", transform: "translateY(0) translateZ(0)" },
                },
                "fade-in-down": {
                    "0%": { opacity: "0", transform: "translateY(-30px) translateZ(-50px)" },
                    "100%": { opacity: "1", transform: "translateY(0) translateZ(0)" },
                },
                "fade-in-scale": {
                    "0%": { opacity: "0", transform: "scale(0.9) translateZ(-100px)" },
                    "100%": { opacity: "1", transform: "scale(1) translateZ(0)" },
                },
                // 3D Flip animations
                "flip-in-x": {
                    "0%": { opacity: "0", transform: "rotateX(-90deg)" },
                    "100%": { opacity: "1", transform: "rotateX(0deg)" },
                },
                "flip-in-y": {
                    "0%": { opacity: "0", transform: "rotateY(-90deg)" },
                    "100%": { opacity: "1", transform: "rotateY(0deg)" },
                },
                "flip-card": {
                    "0%": { transform: "rotateY(0deg)" },
                    "100%": { transform: "rotateY(180deg)" },
                },
                // Floating animations
                "float": {
                    "0%, 100%": { transform: "translateY(0) translateZ(0)" },
                    "50%": { transform: "translateY(-20px) translateZ(20px)" },
                },
                "float-slow": {
                    "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
                    "50%": { transform: "translateY(-10px) rotate(2deg)" },
                },
                // Liquid/Milk animations
                "liquid-wave": {
                    "0%": { transform: "translateX(-100%) skewX(-15deg)" },
                    "100%": { transform: "translateX(100%) skewX(-15deg)" },
                },
                "pour": {
                    "0%": { height: "0%", opacity: "0" },
                    "20%": { opacity: "1" },
                    "100%": { height: "100%", opacity: "1" },
                },
                "ripple": {
                    "0%": { transform: "scale(0)", opacity: "1" },
                    "100%": { transform: "scale(4)", opacity: "0" },
                },
                // 3D Card hover effects
                "tilt-3d": {
                    "0%": { transform: "rotateX(0) rotateY(0) translateZ(0)" },
                    "100%": { transform: "rotateX(var(--rotate-x, 10deg)) rotateY(var(--rotate-y, -10deg)) translateZ(50px)" },
                },
                // Loading/Shimmer
                "shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(255, 179, 0, 0.4)" },
                    "50%": { boxShadow: "0 0 40px rgba(255, 179, 0, 0.8)" },
                },
                // Scroll-triggered parallax
                "parallax-up": {
                    "0%": { transform: "translateY(100px) translateZ(-200px)", opacity: "0" },
                    "100%": { transform: "translateY(0) translateZ(0)", opacity: "1" },
                },
                "parallax-scale": {
                    "0%": { transform: "scale(1.2) translateZ(-100px)", opacity: "0" },
                    "100%": { transform: "scale(1) translateZ(0)", opacity: "1" },
                },
            },
            animation: {
                // Basic entrances
                "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "fade-in-down": "fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "fade-in-scale": "fade-in-scale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                // 3D effects
                "flip-in-x": "flip-in-x 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "flip-in-y": "flip-in-y 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "flip-card": "flip-card 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                // Floating
                "float": "float 3s ease-in-out infinite",
                "float-slow": "float-slow 6s ease-in-out infinite",
                // Dairy-specific
                "liquid-wave": "liquid-wave 2s linear infinite",
                "pour": "pour 1s ease-out forwards",
                "ripple": "ripple 0.6s linear",
                // Interactive
                "tilt-3d": "tilt-3d 0.3s ease-out forwards",
                "shimmer": "shimmer 2s linear infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                // Scroll
                "parallax-up": "parallax-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                "parallax-scale": "parallax-scale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            },
            transitionTimingFunction: {
                "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
                "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
                "snap": "cubic-bezier(0.87, 0, 0.13, 1)",
            },
            transitionDuration: {
                "400": "400ms",
                "600": "600ms",
                "800": "800ms",
            },
        },
    },
    plugins: [
        // 3D transform utilities plugin
        function ({ addUtilities }: { addUtilities: Function }) {
            const newUtilities = {
                ".transform-style-3d": {
                    transformStyle: "preserve-3d",
                },
                ".transform-style-flat": {
                    transformStyle: "flat",
                },
                ".backface-visible": {
                    backfaceVisibility: "visible",
                },
                ".backface-hidden": {
                    backfaceVisibility: "hidden",
                },
                ".perspective-none": {
                    perspective: "none",
                },
                ".perspective-500": {
                    perspective: "500px",
                },
                ".perspective-1000": {
                    perspective: "1000px",
                },
                ".perspective-1500": {
                    perspective: "1500px",
                },
                ".perspective-2000": {
                    perspective: "2000px",
                },
                ".preserve-3d": {
                    transformStyle: "preserve-3d",
                },
                // GPU acceleration
                ".gpu": {
                    transform: "translateZ(0)",
                    willChange: "transform",
                },
                // 3D card effects
                ".card-3d": {
                    transformStyle: "preserve-3d",
                    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                },
                ".card-3d:hover": {
                    transform: "rotateX(var(--rotate-x, 5deg)) rotateY(var(--rotate-y, -5deg)) translateZ(30px)",
                },
                // Glass morphism
                ".glass": {
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4))",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                },
                ".glass-dark": {
                    background: "linear-gradient(135deg, rgba(15, 44, 89, 0.9), rgba(15, 44, 89, 0.6))",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                },
                // Milk/Liquid effects
                ".liquid-bg": {
                    position: "relative",
                    overflow: "hidden",
                },
                ".liquid-bg::before": {
                    content: '""',
                    position: "absolute",
                    top: "0",
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    animation: "liquid-wave 2s linear infinite",
                },
            };
            addUtilities(newUtilities);
        },
    ],
};

export default config;