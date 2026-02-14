"use client"

import { Calendar, CheckCircle, GraduationCap, Users, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
    {
        icon: Users,
        title: "Expert Instructors",
        description: "Learn from vetted experts and top educators through our structured course materials.",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600"
    },
    {
        icon: Calendar,
        title: "Flexible Learning",
        description: "Access course materials anytime, anywhere, and progress through the curriculum at your own pace.",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600"
    },
    {
        icon: GraduationCap,
        title: "Comprehensive Curriculum",
        description: "Follow a structured learning path with courses designed to cover every aspect of your syllabus.",
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50",
        iconColor: "text-amber-600"
    },
    {
        icon: CheckCircle,
        title: "Proven Results",
        description: "98% of our students see an improvement in their grades after completing our courses.",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        iconColor: "text-green-600"
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    {/* Section Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Why Choose Us</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Everything You Need to{" "}
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Excel
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        We don&apos;t just teach subjects; we build confidence and lasting academic skills.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-transparent overflow-hidden hover:-translate-y-2"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient Border Effect on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>

                            {/* Icon Container */}
                            <div className="relative mb-6">
                                <div className={`inline-flex p-4 ${feature.bgColor} rounded-2xl ${feature.iconColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative`}>
                                    <feature.icon className="w-8 h-8" />
                                    {/* Icon Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500`}></div>
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-primary transition-all duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <p className="text-slate-600 mb-4">Ready to experience the difference?</p>
                    <Link href="/register">
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                            <span className="relative z-10">Get Started Today</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
