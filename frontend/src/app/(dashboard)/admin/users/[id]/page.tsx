"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Shield, BookOpen, Ban, CheckCircle, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

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
    courses: Course[]
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

interface Course {
    id: number
    name: string
    level: string
}

export default function UserProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params

    const [user, setUser] = useState<User | null>(null)
    const [courses, setYear] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showEnrollModal, setShowEnrollModal] = useState(false)
    const [enrollData, setEnrollData] = useState({
        course_id: "",
        grade: ""
    })

    // Delete Course Modal State
    const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState<number | null>(null)

    useEffect(() => {
        const fetchUserStable = async () => {
            try {
                const res = await api.get(`/admin/users/${id}`)
                setUser(res.data)

                // Fetch courses for enrollment dropdown
                const coursesRes = await api.get('/admin/courses')
                setYear(coursesRes.data)
            } catch (error) {
                console.error(error)
                router.push('/admin/users')
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchUserStable()
    }, [id, router])

    const fetchUser = async () => {
        try {
            const res = await api.get(`/admin/users/${id}`)
            setUser(res.data)
        } catch (error) {
            console.error(error)
            router.push('/admin/users')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleSuspend = async () => {
        if (!user) return
        if (!confirm(`Are you sure you want to ${user.status === 'active' ? 'suspend' : 'activate'} this user?`)) return

        try {
            const res = await api.post(`/admin/users/${user.id}/toggle-suspend`, {})
            setUser(res.data.user)
            fetchUser() // Refresh to be safe
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async () => {
        if (!user || !confirm("Are you sure you want to delete this user? This cannot be undone.")) return
        try {
            await api.delete(`/admin/users/${user.id}`)
            router.push('/admin/users')
        } catch (error) {
            console.error("Failed to delete user", error)
            alert("Failed to delete user. Please try again.")
        }
    }

    const handleEnrollSubmit = async () => {
        if (!user) return
        if (!enrollData.course_id) return alert("Please select a course")

        try {
            await api.post(`/admin/users/${user.id}/enroll`, enrollData)
            alert("Student successfully enrolled!")
            setShowEnrollModal(false)
            setEnrollData({ course_id: "", grade: "" })
            fetchUser() // Refresh user data to show new enrollment
        } catch (error: any) {
            const message = error?.response?.data?.message || "Enrollment failed"
            alert(message)
            console.error("Failed to enroll", error)
        }
    }

    const handleDeleteCourseClick = (courseId: number) => {
        setCourseToDelete(courseId)
        setShowDeleteCourseModal(true)
    }

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return
        try {
            await api.delete(`/admin/courses/${courseToDelete}`)
            fetchUser()
            setShowDeleteCourseModal(false)
            setCourseToDelete(null)
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
                        <Button
                            variant="outline"
                            className="justify-start gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                            onClick={() => router.push(`/admin/messages?userId=${user.id}`)}
                        >
                            <Mail size={16} /> Message User
                        </Button>
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
                                <Button onClick={() => setShowEnrollModal(true)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                                    <BookOpen size={16} className="mr-2" /> Enroll Student
                                </Button>
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

                {/* Tutor Year Section */}
                {user.role === 'tutor' && (
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <BookOpen size={20} className="text-slate-400" />
                                    Year Offered
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Course Name</th>
                                            <th className="px-6 py-3">Level</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {user.courses && user.courses.length > 0 ? user.courses.map(course => (
                                            <tr key={course.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">{course.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{course.level}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteCourseClick(course.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No active courses.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Purchase/Payout History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Shield size={20} className="text-slate-400" />
                                {user.role === 'tutor' ? 'Payout History' : 'Purchase History'}
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

            {/* Enroll Modal */}
            {showEnrollModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                        <button onClick={() => setShowEnrollModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Enroll Student</h3>
                        <p className="text-sm text-slate-500 mb-6">Select a course to enroll <strong>{user.name}</strong>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    value={enrollData.course_id}
                                    onChange={(e) => setEnrollData({ ...enrollData, course_id: e.target.value })}
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowEnrollModal(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleEnrollSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700">Enroll</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Course Confirmation Modal */}
            {showDeleteCourseModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                        <button onClick={() => setShowDeleteCourseModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Course?</h3>
                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove this course? This action cannot be undone.</p>

                            <div className="flex gap-3 w-full">
                                <Button variant="outline" onClick={() => setShowDeleteCourseModal(false)} className="flex-1">No, Cancel</Button>
                                <Button onClick={confirmDeleteCourse} variant="destructive" className="flex-1">Yes, Delete</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
