"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, BookOpen, Users, Shield } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("student")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const roles = [
        { id: 'student', label: 'Student', icon: GraduationCap },
        { id: 'tutor', label: 'Tutor', icon: BookOpen },
        { id: 'parent', label: 'Parent', icon: Users },
        { id: 'admin', label: 'Admin', icon: Shield },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setLoading(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk';
            const res = await fetch(`${apiUrl}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            })

            const data = await res.json()

            if (res.ok) {
                setMessage(data.message || 'If an account exists, a reset link has been sent.')
            } else {
                setError(data.message || 'Failed to send reset link')
            }
        } catch (err) {
            console.error(err);
            // Fallback for demo if endpoint doesn't exist
            setError('Service not available or connection failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
                    <p className="text-slate-500 mt-2">Select your role and enter your email</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center">
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                        <div className="grid grid-cols-4 gap-2">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${role === r.id
                                        ? 'border-blue-600 bg-blue-50 text-blue-600 ring-1 ring-blue-600'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-600'
                                        }`}
                                    type="button"
                                >
                                    <r.icon size={20} className="mb-1" />
                                    <span className="text-[10px] font-medium">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                </div>

                <div className="text-center text-sm text-slate-500">
                    Remember anything?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
