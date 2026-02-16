"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Course {
    id: number
    name: string
    description: string
    tutor: {
        id: number
        name: string
        email: string
    }
    updated_at: string
}

export default function CourseApprovalsPage() {
    const router = useRouter()
    const [courses, setYear] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const fetchYear = async () => {
        setLoading(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/admin/courses/submitted`)
            if (res.ok) {
                const data = await res.json()
                setYear(data)
            }
        } catch (error) {
            console.error("Failed to fetch courses", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchYear()
    }, [])

    const handleApprove = async (id: number) => {
        setActionLoading(id)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/admin/courses/${id}/approve`, {
                method: 'POST'
            })
            if (res.ok) {
                setYear(courses.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error("Failed to approve", error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject this course?")) return

        setActionLoading(id)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/admin/courses/${id}/reject`, {
                method: 'POST'
            })
            if (res.ok) {
                setYear(courses.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error("Failed to reject", error)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Course Approvals</h1>
                <p className="text-slate-500">Review and approve courses submitted by tutors</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Course Name</th>
                                <th className="px-6 py-4">Tutor</th>
                                <th className="px-6 py-4">Submitted Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading courses...
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No pending course approvals.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/tutor/courses/${course.id}`} target="_blank" className="group">
                                                <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{course.name}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-xs">{course.description}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{course.tutor.name}</div>
                                            <div className="text-xs text-slate-500">{course.tutor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(course.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                    onClick={() => handleApprove(course.id)}
                                                    disabled={actionLoading === course.id}
                                                >
                                                    {actionLoading === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                                    Approve
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="shadow-sm"
                                                    onClick={() => handleReject(course.id)}
                                                    disabled={actionLoading === course.id}
                                                >
                                                    {actionLoading === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                                                    Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
