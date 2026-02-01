"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Shield, BookOpen, Ban, CheckCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
    id: number
    name: string
    email: string
    phone: string | null
    role: string
    status: 'active' | 'suspended'
    created_at: string
    enrollments: Enrollment[]
    payments: Payment[]
}

interface Enrollment {
    id: number
    course: {
        id: number
        name: string
        level: string
    }
    status: string
    grade: string | null
    enrollment_date: string
}

interface Payment {
    id: number
    amount: string
    description: string
    status: 'paid' | 'pending' | 'refunded'
    payment_date: string
}

export default function UserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserStable = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                } else {
                    router.push('/admin/users')
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchUserStable()
    }, [id, router])

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data)
            } else {
                router.push('/admin/users')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleSuspend = async () => {
        if (!user) return
        if (!confirm(`Are you sure you want to ${user.status === 'active' ? 'suspend' : 'activate'} this user?`)) return

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users/${user.id}/toggle-suspend`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user) // existing endpoint returns { message, user: ... } but check if structure matches
                fetchUser() // Refresh to be safe
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async () => {
        if (!user || !confirm("Are you sure you want to delete this user?")) return
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                router.push('/admin/users')
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading user profile...</div>
    if (!user) return <div className="p-8 text-center text-slate-500">User not found</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push('/admin/users')}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Users
                </Button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon size={48} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium border capitalize ${user.role === 'student' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                user.role === 'tutor' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    'bg-slate-50 text-slate-700 border-slate-200'
                                }`}>
                                {user.role}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium border capitalize ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {user.status || 'Active'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-6 text-slate-600 mt-4">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-slate-400" />
                                {user.phone || 'No phone'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                Joined {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[150px]">
                        <Button variant="outline" className="justify-start gap-2" onClick={handleToggleSuspend}>
                            {user.status === 'active' ? <><Ban size={16} /> Suspend User</> : <><CheckCircle size={16} /> Activate User</>}
                        </Button>
                        <Button variant="destructive" className="justify-start gap-2" onClick={handleDelete}>
                            <Trash2 size={16} /> Delete User
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Enrollments Section (Only for students) */}
                {user.role === 'student' && (
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <BookOpen size={20} className="text-slate-400" />
                                    Enrollment History
                                </h3>
                                {/* Could add 'Enroll' button here that opens modal - logic would need to be moved/duplicated */}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Course</th>
                                            <th className="px-6 py-3">Level</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {user.enrollments && user.enrollments.length > 0 ? user.enrollments.map(enr => (
                                            <tr key={enr.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{enr.course.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{enr.course.level}</td>
                                                <td className="px-6 py-4 text-slate-600">{new Date(enr.enrollment_date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${enr.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        enr.status === 'dropped' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {enr.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{enr.grade || '-'}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No enrollments found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Purchase History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Shield size={20} className="text-slate-400" />
                                Purchase History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {user.payments && user.payments.length > 0 ? user.payments.map(pay => (
                                        <tr key={pay.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{pay.description || 'Payment'}</td>
                                            <td className="px-6 py-4 text-slate-600">{new Date(pay.payment_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">${parseFloat(pay.amount).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${pay.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    pay.status === 'refunded' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {pay.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No payment history available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
