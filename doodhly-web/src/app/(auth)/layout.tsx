export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:block bg-brand-blue relative">
                <div className="absolute inset-0 bg-brand-blue/90 flex items-center justify-center p-12 text-white">
                    <div>
                        <h2 className="font-serif text-4xl mb-4">Purity You Can Trust</h2>
                        <p className="text-lg opacity-80">Join the Doodhly family today.</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-brand-cream">
                <div className="w-full max-w-sm space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
