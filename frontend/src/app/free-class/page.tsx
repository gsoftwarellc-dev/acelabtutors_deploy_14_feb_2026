"use client"

import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const CLASS_LINKS = [
    {
        year: "YEAR 8",
        borderColor: "border-[#3b82f6]", // Blue
        topBarColor: "bg-[#3b82f6]",
        meetUrl: "https://meet.google.com/rug-uoun-gbn"
    },
    {
        year: "YEAR 9",
        borderColor: "border-[#10b981]", // Green
        topBarColor: "bg-[#10b981]",
        meetUrl: "https://meet.google.com/oww-fcxz-ytq"
    },
    {
        year: "YEAR 10",
        borderColor: "border-[#f59e0b]", // Orange
        topBarColor: "bg-[#f59e0b]",
        meetUrl: "https://meet.google.com/txp-okmt-tao"
    },
    {
        year: "YEAR 11",
        borderColor: "border-[#ef4444]", // Red
        topBarColor: "bg-[#ef4444]",
        meetUrl: "https://meet.google.com/iuf-zvvr-myv"
    }
]

export default function FreeClassPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex-1 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Winners Kingdom Children</h1>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-800">Free Classes (Year 8-11)</h2>
                            <p className="text-slate-600 text-sm font-medium">Join your scheduled online classes using the links below.</p>
                            <p className="text-slate-900 text-sm font-black uppercase tracking-widest pt-2">Free Classes - SATURDAYS ONLY</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CLASS_LINKS.map((item) => (
                            <Card key={item.year} className={`overflow-hidden border-2 ${item.borderColor} shadow-lg bg-white rounded-xl`}>
                                <div className={`h-12 flex items-center justify-center bg-slate-50 border-b border-slate-100`}>
                                    <h3 className="text-xl font-black text-slate-900 tracking-wide">{item.year}</h3>
                                </div>
                                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                    <p className="text-slate-700 font-medium">Google Meet joining info</p>

                                    <div className="w-full">
                                        <Link href={item.meetUrl} target="_blank">
                                            <Button className="w-full py-6 bg-[#ef4444] hover:bg-[#dc2626] text-white font-black rounded-lg transition-transform active:scale-95 shadow-md">
                                                Join Video Call
                                            </Button>
                                        </Link>
                                    </div>

                                    <p className="text-[11px] text-slate-400 font-medium break-all underline decoration-slate-200">
                                        {item.meetUrl}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="py-8 border-t bg-white">
                <div className="container mx-auto px-4 text-center text-sm text-slate-400 font-medium">
                    © {new Date().getFullYear()} Acelab Tutors. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
