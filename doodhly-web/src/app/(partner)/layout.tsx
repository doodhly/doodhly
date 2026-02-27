import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // AuthGuard handles protection and loading state
    return (
        <AuthGuard allowedRoles={['DELIVERY_PARTNER']}>
            <div className="min-h-screen bg-gray-900 text-white">
                {/* High Contrast Header */}
                <header className="bg-black p-4 flex justify-between items-center border-b border-gray-700">
                    <h1 className="text-xl font-bold text-yellow-400">Doodhly Partner</h1>
                    <div className="bg-green-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                        Online
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="pb-16 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
                    {children}
                </main>

                {/* Action Bar (Footer) */}
                <nav className="fixed bottom-0 inset-x-0 bg-black border-t border-gray-700 p-4 flex justify-between">
                    <button className="text-gray-400 hover:text-white flex flex-col items-center text-xs gap-1">
                        <span>📋</span> Route
                    </button>
                    <button className="text-gray-400 hover:text-white flex flex-col items-center text-xs gap-1">
                        <span>📦</span> History
                    </button>
                    <button className="text-gray-400 hover:text-white flex flex-col items-center text-xs gap-1">
                        <span>👤</span> Profile
                    </button>
                </nav>
            </div>
        </AuthGuard>
    );
}
