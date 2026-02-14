import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-slate-900 text-white py-20 px-4">
                    <div className="container mx-auto text-center max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                        <p className="text-slate-300 text-lg mb-8">
                            Have questions about our tutoring services? We're here to help you achieve your academic goals.
                        </p>
                    </div>
                </section>

                {/* Contact Cards Section */}
                <section className="py-16 px-4 bg-slate-50 flex-grow">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Phone Card */}
                            <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-md overflow-hidden group">
                                <div className="h-2 bg-blue-500 w-full"></div>
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Phone size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Call Us</h3>
                                    <p className="text-slate-500 mb-6">Speak directly with our support team.</p>
                                    <a href="tel:+447842507716" className="text-blue-600 font-semibold text-lg hover:underline">
                                        +44 7842 507716
                                    </a>
                                </CardContent>
                            </Card>

                            {/* Email Card */}
                            <Card className="hover:shadow-lg transition-all duration-300 border-none shadow-md overflow-hidden group">
                                <div className="h-2 bg-purple-500 w-full"></div>
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">Email Us</h3>
                                    <p className="text-slate-500 mb-6">Send us a message anytime.</p>
                                    <a href="mailto:contact@acelabtutors.co.uk" className="text-purple-600 font-semibold text-lg hover:underline">
                                        contact@acelabtutors.co.uk
                                    </a>
                                    <p className="text-sm text-slate-400 mt-2">We reply within 24 hours</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="py-8 border-t bg-slate-50">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Acelab Tutors. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
