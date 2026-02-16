"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Menu, X, ShoppingCart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/student-registration", label: "Student Registration" },
        { href: "/free-class", label: "Free Class" },
        { href: "/courses", label: "Year" },
        { href: "/tutors", label: "Meet Our Tutors" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
            <div className="container mx-auto flex h-24 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Trigger */}
                    <button
                        className="md:hidden p-2 -ml-2 text-foreground hover:bg-slate-100 rounded-md"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <Link href="/" className="flex items-center space-x-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <div className="bg-white p-1 rounded-md border border-slate-200">
                            <img src="/logo_main.png" alt="Acelab" className="h-16 w-auto object-contain" />
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="transition-colors text-foreground hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-foreground hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-slate-200 shadow-sm hover:bg-transparent">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage
                                            src={user.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'}${user.avatar}` : ''}
                                            alt={user.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/${user.role}`} className="cursor-pointer">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/${user.role}/profile`} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
                                Log in
                            </Link>
                            <Link href="/register" className="hidden sm:inline-flex">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t bg-background px-4 py-4 shadow-lg absolute w-full left-0 top-16 flex flex-col space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-foreground transition-colors hover:text-primary py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {!isAuthenticated && (
                        <div className="pt-4 mt-2 border-t flex flex-col space-y-2">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full justify-center">Log in</Button>
                            </Link>
                            <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full justify-center">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
