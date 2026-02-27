"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrutalButton } from "./BrutalButton";
import { useAuth } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BrutalHeader() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    if (isAuthPage) return null;

    const navLinks = [
        { name: 'Products', href: '/products' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    if (user) {
        navLinks.push({ name: 'Dashboard', href: '/dashboard' });
    }

    return (
        <header className="border-b-4 border-black bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="font-sans text-3xl md:text-4xl font-black tracking-tighter hover:underline decoration-4 underline-offset-4 uppercase">
                    DOODHLY<span className="text-brutal-primary">.RAW</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 font-mono font-bold text-sm uppercase tracking-widest items-center">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "hover:bg-brutal-yellow hover:text-black px-2 py-1 transition-colors border-2 border-transparent hover:border-black",
                                pathname === link.href && "bg-black text-white"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {user ? (
                        <BrutalButton variant="outline" size="sm" onClick={() => logout()}>
                            LOGOUT
                        </BrutalButton>
                    ) : (
                        <Link href="/login">
                            <BrutalButton variant="primary" size="sm">
                                GIMME MILK
                            </BrutalButton>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden p-2 border-2 border-black active:bg-black active:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t-4 border-black bg-brutal-bg p-4 flex flex-col gap-4 absolute w-full shadow-brutal">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="font-sans text-4xl font-black uppercase hover:text-brutal-primary border-b-2 border-black pb-2"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="mt-4">
                        {user ? (
                            <BrutalButton className="w-full" onClick={() => logout()}>LOGOUT</BrutalButton>
                        ) : (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <BrutalButton className="w-full" variant="primary">LOGIN</BrutalButton>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
