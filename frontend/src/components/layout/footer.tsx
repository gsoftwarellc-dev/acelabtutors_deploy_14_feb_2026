"use client"

import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { usePathname } from "next/navigation"

export function Footer() {
    const pathname = usePathname()

    // Hide footer on LMS/Dashboard pages
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/tutor') || pathname?.startsWith('/student')) {
        return null
    }

    return (
        <footer className="bg-slate-900 text-slate-300 py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-white p-1 rounded-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo_main.png" alt="Acelab" className="h-24 w-auto object-contain" />
                            </div>
                        </Link>
                        <p className="max-w-sm text-slate-400 leading-relaxed">
                            Empowering students with expert tutoring and comprehensive learning paths. Join us today and unlock your academic potential.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                            <li><Link href="/tutors" className="hover:text-primary transition-colors">Meet Our Tutors</Link></li>
                            <li><Link href="/student-registration" className="hover:text-primary transition-colors">Student Registration</Link></li>
                            <li><Link href="/free-class" className="hover:text-primary transition-colors">Free Class</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><span className="text-slate-400">Email: contact@acelabtutors.co.uk</span></li>
                            <li><span className="text-slate-400">Phone: +44 7842 507716</span></li>
                        </ul>

                        <div className="mt-6 flex gap-4">
                            <Link href="https://www.facebook.com/acelabtutors/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white text-slate-400 transition-all duration-300">
                                <Facebook size={20} />
                            </Link>
                            <Link href="https://www.instagram.com/acelabtutors/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white text-slate-400 transition-all duration-300">
                                <Instagram size={20} />
                            </Link>
                            <Link href="https://www.tiktok.com/@acelabtutors" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white text-slate-400 transition-all duration-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-tiktok"
                                >
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Acelab Tutors. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
