import Link from "next/link";
import { MilkOff } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream/30 p-4 text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full" />
                <MilkOff className="w-32 h-32 text-brand-blue/80 relative z-10 mb-8" />
            </div>

            <h1 className="text-6xl font-black text-brand-blue mb-4 font-serif">404</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>

            <p className="text-gray-600 max-w-md mb-8">
                The content you are looking for might have been moved, deleted, or possibly never existed.
            </p>

            <Link
                href="/"
                className="px-8 py-3 bg-brand-blue text-white rounded-full font-medium shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all hover:scale-105"
            >
                Return to Homepage
            </Link>
        </div>
    );
}
