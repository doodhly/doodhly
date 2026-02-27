import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import QueryProvider from "@/providers/query-provider";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
    weight: ["300", "400", "700", "900"],
    subsets: ["latin"],
    variable: "--font-merriweather",
});

export const metadata: Metadata = {
    title: "Doodhly | Pure Milk Delivery",
    description: "Fresh, pure cow milk delivered daily to your doorstep in Sakti.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen bg-brand-cream font-sans antialiased selection:bg-brand-green selection:text-white",
                    inter.variable,
                    merriweather.variable
                )}
            >
                <ErrorBoundary>
                    <AuthProvider>
                        <QueryProvider>
                            <main className="flex-1 w-full relative">
                                {children}
                            </main>
                        </QueryProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
