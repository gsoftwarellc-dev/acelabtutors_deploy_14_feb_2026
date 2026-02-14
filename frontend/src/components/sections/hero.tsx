"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Award, Zap } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-20 md:pt-28 lg:pt-36 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs with Animation */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-br from-primary/40 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-br from-secondary/40 to-amber-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                {/* Floating Icons */}
                <div className="absolute top-20 left-[10%] animate-float animation-delay-1000">
                    <Sparkles className="w-8 h-8 text-primary/30" />
                </div>
                <div className="absolute top-40 right-[15%] animate-float animation-delay-3000">
                    <TrendingUp className="w-10 h-10 text-secondary/30" />
                </div>
                <div className="absolute bottom-32 left-[20%] animate-float animation-delay-2000">
                    <Award className="w-12 h-12 text-purple-500/30" />
                </div>
                <div className="absolute top-[60%] right-[25%] animate-float">
                    <Zap className="w-8 h-8 text-amber-500/30" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Badge */}
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-primary/20 backdrop-blur-sm shadow-sm animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-sm font-bold text-primary">
                            #1 Rated Tutoring Platform 2026
                        </span>
                    </div>

                    {/* Main Heading with Gradient Animation */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight animate-fade-in-up animation-delay-200">
                        <span className="block text-slate-900 mb-2">Unlock Your</span>
                        <span className="block relative">
                            <span className="relative z-10 bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent animate-gradient-x">
                                Academic Potential
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-secondary/20 blur-2xl -z-10 animate-pulse"></span>
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 leading-relaxed animate-fade-in-up animation-delay-400">
                        Expert tutoring tailored to your learning style. Master difficult subjects,
                        <span className="font-semibold text-primary"> ace your exams</span>, and build
                        <span className="font-semibold text-secondary"> confidence</span> for the future.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-600">
                        <Link href="/courses" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="group relative w-full text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Browse Courses
                                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>
                            </Button>
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full text-lg px-8 py-6 border-2 hover:bg-slate-50 hover:border-primary/50 hover:scale-105 transition-all duration-300"
                            >
                                Contact
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-8 pt-12 animate-fade-in-up animation-delay-800">
                        <div className="group cursor-pointer transition-transform hover:scale-110">
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                10k+
                            </div>
                            <div className="text-sm text-slate-500 mt-1">Students</div>
                        </div>
                        <div className="group cursor-pointer transition-transform hover:scale-110">
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-amber-600 bg-clip-text text-transparent">
                                500+
                            </div>
                            <div className="text-sm text-slate-500 mt-1">Expert Tutors</div>
                        </div>
                        <div className="group cursor-pointer transition-transform hover:scale-110">
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                98%
                            </div>
                            <div className="text-sm text-slate-500 mt-1">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* Hero Image with Advanced Effects */}
                <div className="mt-20 relative mx-auto max-w-6xl animate-fade-in-up animation-delay-1000">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/10 hover:ring-primary/50 transition-all duration-500 group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-secondary opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-500"></div>

                        {/* Image Container */}
                        <div className="relative bg-white/50 backdrop-blur-sm aspect-video overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/hero.png"
                                alt="Students learning and collaborating"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>

                    {/* Floating Cards */}
                    <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float hidden lg:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-slate-500">Average Improvement</div>
                                <div className="text-lg font-bold text-slate-900">+2 Grades</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float animation-delay-2000 hidden lg:block">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-slate-500">Student Satisfaction</div>
                                <div className="text-lg font-bold text-slate-900">4.9/5.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
