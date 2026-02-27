import type { Config } from "next";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // STRICT BRUTAL PALETTE
                'brutal-bg': '#FFFAF0',   // Cream/White
                'brutal-black': '#000000', // Pure Black
                'brutal-white': '#FFFFFF', // Pure White

                // Brand Colors
                'brutal-yellow': '#FFE66D',
                'brutal-pink': '#FF6B6B',
                'brutal-blue': '#4ECDC4',
                'brutal-green': '#95E1D3',

                // Semantic Overrides (No Grays)
                'error': '#FF0000',
                'success': '#00FF00',
            },
            fontFamily: {
                sans: ['var(--font-archivo)', 'sans-serif'], // Headings
                mono: ['var(--font-space)', 'monospace'],    // Body
            },
            borderWidth: {
                DEFAULT: '4px', // Standardize 4px everywhere
                '4': '4px',
            },
            boxShadow: {
                'brutal': '8px 8px 0px 0px #000000',
                'brutal-sm': '4px 4px 0px 0px #000000',
                'brutal-hover': '0px 0px 0px 0px #000000', // Pressed state
            },
            dropShadow: {
                'hard': '4px 4px 0px #000',
            },
            backgroundImage: {
                'brutal-noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
            },
            translate: {
                'brutal-pressed': '8px',
            }
        },
    },
    plugins: [],
};
export default config;
