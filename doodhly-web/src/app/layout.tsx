import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

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
                    "min-h-screen bg-brand-cream font-sans antialiased",
                    inter.variable,
                    merriweather.variable
                )}
            >
                <ErrorBoundary>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
