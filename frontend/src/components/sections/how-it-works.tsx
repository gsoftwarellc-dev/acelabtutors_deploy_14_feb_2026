"use client"

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Browse Year",
            description: "Explore our wide range of courses, filter by subject and level, to find the perfect match for your academic needs.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            number: "02",
            title: "Enroll in a Course",
            description: "Secure your spot in the course of your choice and get immediate access to comprehensive learning materials.",
            color: "from-purple-500 to-pink-500"
        },
        {
            number: "03",
            title: "Start Learning",
            description: "Join your classes, connect with expert tutors, and start achieving your academic goals in our virtual classroom.",
            color: "from-amber-500 to-orange-500"
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Get Started in{" "}
                        <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
                            3 Simple Steps
                        </span>
                    </h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Join thousands of students who have transformed their academic journey with us.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Arrow Connector (hidden on mobile and last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 -right-4 z-10">
                                    <ArrowRight className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors animate-pulse" />
                                </div>
                            )}

                            {/* Step Card */}
                            <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-500 hover:bg-white/15 hover:-translate-y-2 group">
                                {/* Gradient Glow on Hover */}
                                <div className={`absolute -inset-1 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-2xl`}></div>

                                {/* Number */}
                                <div className="relative mb-6">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} text-white text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        {step.number}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-primary transition-all duration-300">
                                    {step.title}
                                </h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {step.description}
                                </p>

                                {/* Decorative Element */}
                                <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-5 rounded-tl-full`}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <Link href="/register">
                        <button className="group relative px-10 py-5 bg-gradient-to-r from-primary via-purple-600 to-secondary text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Your Journey Today
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {/* Animated Shine */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
