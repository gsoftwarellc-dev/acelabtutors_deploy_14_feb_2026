"use client"

import { useState, useEffect } from "react"
import { BookOpen, Calendar, MessageSquare, ArrowLeft, TrendingUp, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

interface EnrollmentDetail {
    id: number;
    name: string;
    level: string;
    enrollmentDate: string;
    progress: number;
    grade: string;
    attendance: string;
    status: string;
}

interface StudentDetail {
    id: number;
    name: string;
    email: string;
    joinDate: string;
    stats: {
        totalClasses: number;
        avgAttendance: string;
        nextClass: string;
    };
    enrollments: EnrollmentDetail[];
}

export default function TutorStudentDetailPage() {
    const params = useParams()
    const studentId = params.id as string

    const [student, setStudent] = useState<StudentDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/tutor/students/${studentId}`)
                if (!res.ok) {
                    throw new Error("Student not found or not enrolled with you.")
                }
                const data = await res.json()
                setStudent(data)
            } catch (err) {
                console.error(err)
                setError("Failed to load student profile.")
            } finally {
                setLoading(false)
            }
        }

        if (studentId) fetchStudent()
    }, [studentId])

    if (loading) return <div className="p-12 text-center text-slate-500">Loading profile...</div>
    if (error || !student) return <div className="p-12 text-center text-red-500">{error || "Student not found"}</div>

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/tutor/students">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
                    <p className="text-slate-500">View performance and manage courses (Live Data)</p>
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                        <div className="h-24 w-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-primary/10">
                            {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
                            <p className="text-slate-500 mb-2">Student ID: #{student.id}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                    {student.enrollments.length} Active Year
                                </span>
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                                    Active since {student.joinDate}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-3">

                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-slate-500 font-medium">Classes Taken</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{student.stats.totalClasses}</p>
                    <p className="text-sm text-slate-400 mt-1">With you</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-slate-500 font-medium">Attendance Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{student.stats.avgAttendance}</p>
                    <p className="text-sm text-slate-400 mt-1">Very Consistent</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Calendar size={20} />
                        </div>
                        <span className="text-slate-500 font-medium">Next Session</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 truncate text-lg mt-1">{student.stats.nextClass}</p>
                    <p className="text-sm text-slate-400 mt-1">Mathematics (GCSE)</p>
                </div>
            </div>

            {/* Year & Performance */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Enrolled Year & Performance</h3>
                <div className="grid grid-cols-1 gap-6">
                    {student.enrollments.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h4 className="text-lg font-bold text-slate-900">{course.name}</h4>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                            {course.level}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span>Enrolled: {course.enrollmentDate}</span>
                                        <span className="flex items-center">
                                            <TrendingUp size={14} className="mr-1 text-primary" />
                                            Grade: {course.grade}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 max-w-sm">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-slate-700">Course Progress</span>
                                        <span className="font-bold text-primary">{course.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {student.enrollments.length === 0 && (
                        <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                            No active enrollments found for this student with you.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
