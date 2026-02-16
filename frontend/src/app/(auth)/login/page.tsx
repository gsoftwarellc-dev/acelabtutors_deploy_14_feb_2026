"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, GraduationCap, BookOpen, Users, Shield } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
    const { login } = useAuth()
    const [role, setRole] = useState("student")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(true)
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
        setLoading(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk';
            const res = await fetch(`${apiUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            })

            const data = await res.json()

            if (res.ok) {
                login(data.access_token, data.user)
            } else {
                setError(data.message || 'Login failed')
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Log in to your account</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Role</label>
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

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </div>

                <div className="text-center text-sm text-slate-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}
