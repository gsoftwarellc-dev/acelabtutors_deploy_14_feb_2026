"use client"

import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import api from "@/lib/api"
import { Lock, Unlock, Loader2, Mail, ArrowRight } from "lucide-react"

const CLASS_LINKS = [
    {
        year: "YEAR 8",
        borderColor: "border-[#3b82f6]",
        topBarColor: "bg-[#3b82f6]",
        accentColor: "text-[#3b82f6]",
        meetUrl: "https://meet.google.com/rug-uoun-gbn"
    },
    {
        year: "YEAR 9",
        borderColor: "border-[#10b981]",
        topBarColor: "bg-[#10b981]",
        accentColor: "text-[#10b981]",
        meetUrl: "https://meet.google.com/oww-fcxz-ytq"
    },
    {
        year: "YEAR 10",
        borderColor: "border-[#f59e0b]",
        topBarColor: "bg-[#f59e0b]",
        accentColor: "text-[#f59e0b]",
        meetUrl: "https://meet.google.com/txp-okmt-tao"
    },
    {
        year: "YEAR 11",
        borderColor: "border-[#ef4444]",
        topBarColor: "bg-[#ef4444]",
        accentColor: "text-[#ef4444]",
        meetUrl: "https://meet.google.com/iuf-zvvr-myv"
    }
]

export default function FreeClassPage() {
    const [email, setEmail] = useState("")
    const [checking, setChecking] = useState(false)
    const [checked, setChecked] = useState(false)
    const [status, setStatus] = useState<string | null>(null)
    const [assignedYear, setAssignedYear] = useState<string | null>(null)
    const [studentName, setStudentName] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleCheckStatus = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setChecking(true)
        setErrorMsg(null)
        try {
            const { data } = await api.get(`/student-registrations/check-status?email=${encodeURIComponent(email)}`)
            setChecked(true)
            if (data.found) {
                setStatus(data.status)
                setAssignedYear(data.assigned_year)
                setStudentName(data.student_name)
            } else {
                setStatus(null)
                setAssignedYear(null)
                setStudentName(null)
                setErrorMsg("No registration found for this email. Please register first.")
            }
        } catch (error) {
            console.error("Failed to check status", error)
            setErrorMsg("Failed to check status. Please try again.")
        } finally {
            setChecking(false)
        }
    }

    const isYearUnlocked = (year: string) => {
        if (!checked || status !== "approved" || !assignedYear) return false
        return assignedYear.toUpperCase() === year.toUpperCase()
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex-1 py-16 px-4">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Winners Kingdom Children</h1>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-800">Free Classes (Year 8-11)</h2>
                            <p className="text-slate-600 text-sm font-medium">Join your scheduled online classes using the links below.</p>
                            <p className="text-slate-900 text-sm font-black uppercase tracking-widest pt-2">Free Classes - SATURDAYS ONLY</p>
                        </div>
                    </div>

                    {/* Email Lookup Section */}
                    <div className="max-w-lg mx-auto mb-12">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                            <div className="text-center space-y-1">
                                <h3 className="text-sm font-bold text-slate-900">Check your status</h3>
                                <p className="text-xs text-slate-500">Input the email address you used for the registration form.</p>
                            </div>
                            <form onSubmit={handleCheckStatus} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="pl-10 h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={checking}
                                    className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                                >
                                    {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                                </Button>
                            </form>

                            {/* Status Messages */}
                            {checked && status === "approved" && assignedYear && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-1">
                                    <p className="text-sm font-bold text-green-800">✅ Access Approved!</p>
                                    <p className="text-xs text-green-700">
                                        Welcome back{studentName ? `, ${studentName}` : ""}! You have been assigned to <span className="font-black">{assignedYear}</span>.
                                    </p>
                                </div>
                            )}
                            {checked && status === "pending" && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-1">
                                    <p className="text-sm font-bold text-amber-800">⏳ Registration Under Review</p>
                                    <p className="text-xs text-amber-700">Your registration is currently being reviewed. Please check back later.</p>
                                </div>
                            )}
                            {checked && status === "rejected" && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-1">
                                    <p className="text-sm font-bold text-red-800">Registration Not Approved</p>
                                    <p className="text-xs text-red-700">Unfortunately your registration was not approved. Please contact us for more information.</p>
                                </div>
                            )}
                            {errorMsg && (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
                                    <p className="text-xs text-slate-600">{errorMsg}</p>
                                    <Link href="/register-free">
                                        <Button size="sm" className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold">
                                            Register Now <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Year Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {CLASS_LINKS.map((item) => {
                            const unlocked = isYearUnlocked(item.year)
                            return (
                                <Card key={item.year} className={`overflow-hidden border-2 ${item.borderColor} shadow-lg bg-white rounded-xl transition-all duration-300 ${unlocked ? 'ring-2 ring-green-400 ring-offset-2' : 'opacity-80'}`}>
                                    <div className={`h-12 flex items-center justify-center bg-slate-50 border-b border-slate-100`}>
                                        <h3 className="text-xl font-black text-slate-900 tracking-wide">{item.year}</h3>
                                    </div>
                                    <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                        {unlocked ? (
                                            <>
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Unlock className="w-6 h-6 text-green-600" />
                                                </div>
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
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <Lock className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 font-medium text-sm">Registration required to access this class</p>
                                                <div className="w-full">
                                                    <Link href="/register-free">
                                                        <Button className="w-full py-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-transform active:scale-95 shadow-md">
                                                            <Lock className="w-4 h-4 mr-2" />
                                                            Register to Access
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
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
