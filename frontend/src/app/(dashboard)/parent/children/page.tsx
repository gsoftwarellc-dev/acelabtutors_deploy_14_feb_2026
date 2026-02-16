"use client"

import { BookOpen, Calendar, GraduationCap } from "lucide-react"
import { MOCK_USERS } from "@/lib/mock-data"

export default function ChildrenPage() {
    // In a real app we'd filter by parentId from the current session
    // For now we hardcode looking for children of "p1"
    const children = Object.values(MOCK_USERS).filter(
        (user) => user.role === "student" && user.parentId === "p1"
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">My Children</h1>
                <p className="text-slate-600">View profiles and manage settings for your children</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                    <div key={child.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-24 bg-gradient-to-r from-primary/80 to-secondary/80"></div>
                        <div className="px-6 pb-6 mt-[-40px]">
                            <div className="flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo.png" // using logo as default avatar for now
                                    alt={child.name}
                                    className="w-20 h-20 rounded-full border-4 border-white bg-white object-contain"
                                />
                            </div>
                            <div className="text-center mt-3">
                                <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
                                <div className="flex items-center justify-center space-x-2 text-slate-500 mt-1">
                                    <GraduationCap size={16} />
                                    <span>{child.grade}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="flex items-center justify-center text-slate-400 mb-1">
                                        <BookOpen size={16} className="mr-1" />
                                        <span className="text-xs uppercase font-medium">Year</span>
                                    </div>
                                    <span className="font-bold text-slate-900">3</span>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center text-slate-400 mb-1">
                                        <Calendar size={16} className="mr-1" />
                                        <span className="text-xs uppercase font-medium">Sessions</span>
                                    </div>
                                    <span className="font-bold text-slate-900">12</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
