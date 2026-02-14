"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, User, Calendar, Plus, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Student {
    id: number
    name: string
    email: string
    role: string
    created_at: string
    avatar?: string
    enrollments?: Enrollment[]
    courses?: Course[] // Handle both possible structures
}

interface Enrollment {
    id: number
    course_id: number
    course: Course
    status: string
    created_at: string
}

interface Course {
    id: number
    name: string
    level: string
}

export default function CourseEnrollmentPage() {
    // Search State
    const [searchId, setSearchId] = useState("")
    const [student, setStudent] = useState<Student | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState("")
    const [enrolling, setEnrolling] = useState(false)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/admin/courses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setCourses(data)
            }
        } catch (error) {
            console.error("Failed to fetch courses", error)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchId.trim()) return

        setLoading(true)
        setError(null)
        setStudent(null)

        try {
            const token = localStorage.getItem('token')
            // Fetch user detail using existing endpoint
            const response = await fetch(`http://localhost:8000/api/admin/users/${searchId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.role !== 'student') {
                    setError(`User #${data.id} is a ${data.role}, not a student.`)
                } else {
                    setStudent(data)
                }
            } else {
                setError("Student not found")
            }
        } catch (error) {
            setError("Failed to search student")
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async () => {
        if (!student || !selectedCourseId) return

        setEnrolling(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8000/api/admin/users/${student.id}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    course_id: selectedCourseId
                })
            })

            if (response.ok) {
                alert("Student successfully enrolled!")
                // Refresh student data to show new enrollment
                const refreshRes = await fetch(`http://localhost:8000/api/admin/users/${student.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (refreshRes.ok) {
                    setStudent(await refreshRes.json())
                }
                setSelectedCourseId("")
            } else {
                const data = await response.json()
                alert(data.message || "Enrollment failed")
            }
        } catch (error) {
            console.error("Enrollment error", error)
            alert("Failed to enroll student")
        } finally {
            setEnrolling(false)
        }
    }



    const handleUnenroll = async (courseId: number, courseName: string) => {
        if (!student) return

        if (!confirm(`Are you sure that you want to remove the course "${courseName}"?`)) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8000/api/admin/users/${student.id}/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                // Refresh student data
                const refreshRes = await fetch(`http://localhost:8000/api/admin/users/${student.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (refreshRes.ok) {
                    setStudent(await refreshRes.json())
                }
                alert("Course removed successfully")
            } else {
                alert("Failed to remove course")
            }
        } catch (error) {
            console.error("Unenroll error", error)
            alert("Error removing course")
        }
    }

    const getInitials = (name: string) => name.substring(0, 2).toUpperCase()

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Course Enrollment</h1>
                <p className="text-slate-500">Search for a student by ID to manage their enrollments.</p>
            </div>

            {/* Search Section */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-1 max-w-xs">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Enter ID (e.g., 5)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="pl-10 text-lg"
                                autoFocus
                            />
                        </div>
                    </div>
                    <Button type="button" onClick={handleSearch} disabled={loading} size="lg" className="bg-blue-600 hover:bg-blue-700">
                        {loading ? "Searching..." : "Search Student"}
                    </Button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}
            </div>

            {/* Student Details Section */}
            {student && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-1 h-fit">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24 border-4 border-slate-50">
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-600">
                                    {getInitials(student.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                                <p className="text-slate-500 text-sm">{student.email}</p>
                                <div className="mt-2 flex justify-center gap-2">
                                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">student</Badge>
                                    <Badge variant="outline" className="border-slate-200 bg-slate-50">ID: {student.id}</Badge>
                                </div>
                            </div>

                            <div className="w-full pt-6 border-t mt-2 text-left space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Joined</span>
                                    <span className="font-medium text-slate-900">
                                        {new Date(student.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Active</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrollment Manager */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Add Course Card */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Plus className="text-blue-600" size={20} />
                                Add New Course
                            </h3>
                            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="flex-1">
                                    <select
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                    >
                                        <option value="">Select a course to enroll...</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.name} ({course.level})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    onClick={handleEnroll}
                                    disabled={!selectedCourseId || enrolling}
                                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                                >
                                    {enrolling ? "Adding..." : "Add Course"}
                                </Button>
                            </div>
                        </div>

                        {/* Current Enrollments */}
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <BookOpen className="text-slate-500" size={20} />
                                    Current Enrollments
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Course Name</th>
                                            <th className="px-6 py-3">Level</th>
                                            <th className="px-6 py-3">Enrolled Date</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {student.enrollments && student.enrollments.length > 0 ? (
                                            student.enrollments.map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {enrollment.course?.name || "Unknown Course"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {enrollment.course?.level || "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {new Date(enrollment.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">
                                                            {enrollment.status || 'Active'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleUnenroll(enrollment.course.id, enrollment.course.name)}
                                                        >
                                                            <Trash2 size={16} className="mr-2" /> Remove
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                    No courses enrolled yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
