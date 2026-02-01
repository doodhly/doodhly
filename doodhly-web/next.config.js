/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                // Proxy all /api_backend requests to YOUR LOCAL BACKEND directly!
                // This means the browser ONLY talks to ngrok.
                // ngrok then talks to your computer.
                // Your computer (Next.js) then talks to localhost:5000.
                // CORS is 100% GONE.
                source: '/api_backend/:path*',
                destination: 'http://localhost:5000/api/v1/:path*',
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
