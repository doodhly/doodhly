import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BrutalHeader } from "@/components/brutal/BrutalHeader";
import Link from "next/link";

const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
    title: "DOODHLY | RAW.",
    description: "Pure milk. No nonsense.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${archivo.variable} ${space.variable} font-mono bg-brutal-bg bg-brutal-noise text-black min-h-screen flex flex-col`}>
                <AuthProvider>
                    <BrutalHeader />

                    <main className="flex-1 relative z-10">
                        {children}
                    </main>

                    {/* Brutal Footer */}
                    <footer className="border-t-DEFAULT border-black bg-brutal-black text-white py-20 relative z-20">
                        <div className="max-w-7xl mx-auto px-4 text-center">
                            <h2 className="font-sans text-[12vw] leading-none opacity-20 select-none pointer-events-none text-white/10">MOO.</h2>
                            <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t-2 border-white/20 pt-8">
                                <p className="font-mono text-sm uppercase tracking-widest">© 2026 DOODHLY INC.</p>
                                <p className="font-mono text-sm uppercase tracking-widest">No Preservatives. Just Vibes.</p>
                            </div>
                        </div>
                    </footer>
                </AuthProvider>
            </body>
        </html>
    );
}
