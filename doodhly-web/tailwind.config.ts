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
                    cream: "#FFFBF2", // Warmer Cream for Background
                    blue: "#0F2C59",  // Deep Trust Blue
                    green: "#43A047", // Fresh Grass Green
                    red: "#D32F2F",
                    accent: "#FFB300", // Gold/Orange for emphasis
                    "blue-light": "#E3F2FD", // Soft blue for backgrounds
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)"],
                serif: ["var(--font-merriweather)"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))",
            },
            keyframes: {
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "scale-in": {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                }
            },
            animation: {
                "fade-in-up": "fade-in-up 0.6s ease-out forwards",
                "fade-in": "fade-in 0.4s ease-out forwards",
                "scale-in": "scale-in 0.3s ease-out forwards",
            },
        },
    },
    plugins: [],
};
export default config;
