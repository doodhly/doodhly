import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
            <h2 className="font-serif text-4xl text-brand-blue mb-4">404 - Page Not Found</h2>
            <p className="text-gray-600 mb-8">
                We couldn't find the page you were looking for. Maybe it's out for delivery?
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-opacity-90 transition-all shadow-md"
            >
                Return Home
            </Link>
        </div>
    );
}
