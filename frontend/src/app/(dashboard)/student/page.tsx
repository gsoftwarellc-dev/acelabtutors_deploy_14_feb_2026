"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { StatCard } from "@/components/shared/stat-card"
import { Clock, CheckCircle, Calendar, BookOpen, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import GoogleConnectButton from "@/components/GoogleConnectButton"

interface UpcomingClass {
    id: number
    title: string
    course_name: string
    tutor_name: string
    start_time: string
    duration: number
    meeting_link: string | null
}

interface ClassHistory {
    id: number
    title: string
    course_name: string
    tutor_name: string
    start_time: string
    duration: number
    status: string
}

interface DashboardStats {
    enrolled_courses: number
    attendance: number
    upcoming_classes: number
}

export default function StudentDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        enrolled_courses: 0,
        attendance: 0,
        upcoming_classes: 0
    })
    const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
    const [classHistory, setClassHistory] = useState<ClassHistory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/student/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setStats(data.stats)
                setUpcomingClasses(data.upcoming_classes)
                setClassHistory(data.class_history || [])
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime)
        return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            day: date.getDate(),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })
        }
    }

    const statsDisplay = [
        { label: "Enrolled Courses", value: stats.enrolled_courses.toString(), trend: "neutral" as const },
        { label: "Attendance", value: `${stats.attendance}%`, trend: "neutral" as const },
        { label: "Upcoming Classes", value: stats.upcoming_classes.toString(), trend: "neutral" as const },
    ]

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // TODO: Fetch from backend API
    const upcomingExams: any[] = []

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsDisplay.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div>
                {/* Main Content: Classes & History */}
                <div className="space-y-8">
                    {/* Upcoming Classes with Join Now Button */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">Upcoming Classes</h3>
                            </div>
                            <GoogleConnectButton />
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingClasses.map((session) => {
                                const { month, day, time } = formatDateTime(session.start_time)
                                return (
                                    <div key={session.id} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-blue-100">
                                                <span className="text-xs font-bold uppercase">{month}</span>
                                                <span className="text-lg font-bold leading-none">{day}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900">{session.title}</h4>
                                                <p className="text-sm text-slate-500">{session.course_name} • {session.tutor_name}</p>
                                                <div className="flex items-center text-sm font-medium text-slate-600 mt-1">
                                                    <Clock size={14} className="mr-1 text-slate-400" /> {time}
                                                </div>
                                            </div>
                                        </div>
                                        {session.meeting_link && (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => window.open(session.meeting_link!, '_blank')}
                                            >
                                                <ExternalLink size={14} className="mr-1" />
                                                Join Now
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                            {upcomingClasses.length === 0 && !loading && (
                                <div className="p-8 text-center text-slate-500">
                                    No upcoming sessions scheduled.
                                </div>
                            )}
                            {loading && (
                                <div className="p-8 text-center text-slate-500">
                                    Loading...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Class History Table */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">Class History</h3>
                            {classHistory.length > 3 && (
                                <Link href="/student/class-history" className="text-sm text-primary hover:underline">
                                    See More
                                </Link>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Subject</th>
                                        <th className="px-6 py-3 font-medium">Tutor</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classHistory.length > 0 ? (
                                        classHistory.slice(0, 3).map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {item.title}
                                                    <div className="text-xs text-slate-500 mt-1">{item.course_name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{item.tutor_name}</td>
                                                <td className="px-6 py-4 text-slate-600">{formatDate(item.start_time)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle size={12} className="mr-1" /> {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                No class history yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Upcoming Exams Section */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                <FileText size={20} className="mr-2 text-amber-600" /> Upcoming Exams
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingExams.length > 0 ? (
                                upcomingExams.map((exam) => (
                                    <div key={exam.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-100">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{exam.subject}</h4>
                                                <p className="text-sm text-slate-500">{exam.topic}</p>
                                                <p className="text-xs text-slate-400 mt-1">{exam.date} • {exam.duration}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    No upcoming exams scheduled.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
