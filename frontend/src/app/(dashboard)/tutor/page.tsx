"use client"
import { useState, useEffect } from "react"
import { StatCard } from "@/components/shared/stat-card"
import { Calendar, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpcomingClass {
    id: number
    title: string
    time: string
    courseName: string
    meetingLink?: string
    startTime: string
    duration?: number
}

export default function TutorDashboard() {
    const [stats, setStats] = useState<Array<{
        label: string
        value: string
        change?: string
        trend: "up" | "down" | "neutral"
    }>>([
        { label: "Active Students", value: "0", trend: "neutral" },
        { label: "Total Enrollments", value: "0", trend: "neutral" },
        { label: "Number of Year", value: "0", trend: "neutral" },
    ])

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            try {
                const res = await fetch(`${apiUrl}/api/tutor/dashboard-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats([
                        { label: "Active Students", value: data.active_students.toString(), trend: "up" as const },
                        { label: "Total Enrollments", value: data.total_enrollments.toString(), trend: "up" as const },
                        { label: "Number of Year", value: data.course_count.toString(), trend: "neutral" as const },
                    ])
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            }
        }
        fetchStats()
    }, [])

    const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])

    useEffect(() => {
        const fetchUpcomingClasses = async () => {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            try {
                const res = await fetch(`${apiUrl}/api/tutor/upcoming-classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUpcomingClasses(data.map((cls: any) => ({
                        id: cls.id,
                        title: cls.title,
                        time: cls.time,
                        courseName: cls.course_name,
                        meetingLink: cls.meeting_link,
                        startTime: cls.start_time,
                        duration: cls.duration,
                    })))
                }
            } catch (error) {
                console.error("Failed to fetch upcoming classes", error)
            }
        }
        fetchUpcomingClasses()
    }, [])

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

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-8">
                    {/* Upcoming Schedule */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                <Calendar size={20} className="mr-2 text-primary" /> Upcoming Classes
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingClasses.map((cls) => {
                                const { month, day, time } = formatDateTime(cls.startTime)
                                return (
                                    <div key={cls.id} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-purple-100">
                                                <span className="text-xs font-bold uppercase">{month}</span>
                                                <span className="text-lg font-bold leading-none">{day}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900">{cls.title}</h4>
                                                <p className="text-sm text-slate-500">{cls.courseName}</p>
                                                <div className="flex items-center text-sm font-medium text-slate-600 mt-1">
                                                    <Clock size={14} className="mr-1 text-slate-400" /> {time} (UK)
                                                    {cls.duration && (
                                                        <span className="ml-3 text-xs text-slate-400">• {cls.duration} min</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {cls.meetingLink ? (
                                                <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                        <ExternalLink size={14} className="mr-1" /> Join Class
                                                    </Button>
                                                </a>
                                            ) : (
                                                <Button size="sm" disabled>No Link</Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {upcomingClasses.length === 0 && (
                                <div className="p-8 text-center text-slate-500">No upcoming classes scheduled.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
