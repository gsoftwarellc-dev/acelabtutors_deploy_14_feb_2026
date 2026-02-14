"use client"
import { useState, useEffect } from "react"
// import { MOCK_STATS, MOCK_SESSIONS } from "@/lib/mock-data"
import { StatCard } from "@/components/shared/stat-card"
import { Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TutorDashboard() {
    const [stats, setStats] = useState<Array<{
        label: string
        value: string
        change?: string
        trend: "up" | "down" | "neutral"
    }>>([
        { label: "Active Students", value: "0", trend: "neutral" },
        { label: "Total Enrollments", value: "0", trend: "neutral" },
        { label: "Number of Courses", value: "0", trend: "neutral" },
    ])

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            try {
                const res = await fetch(`${apiUrl}/api/tutor/dashboard-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats([
                        { label: "Active Students", value: data.active_students.toString(), trend: "up" as const },
                        { label: "Total Enrollments", value: data.total_enrollments.toString(), trend: "up" as const },
                        { label: "Number of Courses", value: data.course_count.toString(), trend: "neutral" as const },
                    ])
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            }
        }
        fetchStats()
    }, [])

    const [upcomingClasses, setUpcomingClasses] = useState<Array<{
        id: number
        time: string
        courseName: string
        meetingLink?: string
    }>>([])

    useEffect(() => {
        const fetchUpcomingClasses = async () => {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            try {
                const res = await fetch(`${apiUrl}/api/tutor/upcoming-classes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUpcomingClasses(data.map((cls: any) => ({
                        id: cls.id,
                        time: cls.time,
                        courseName: cls.course_name,
                        meetingLink: cls.meeting_link
                    })))
                }
            } catch (error) {
                console.error("Failed to fetch upcoming classes", error)
            }
        }
        fetchUpcomingClasses()
    }, [])

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Main Content: Schedule & Tasks */}
                <div className="space-y-8">
                    {/* Upcoming Schedule */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                <Calendar size={20} className="mr-2 text-primary" /> Upcoming Classes
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingClasses.map((cls) => (
                                <div key={cls.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center space-x-6">
                                        <span className="text-lg font-bold text-slate-700 w-24">{cls.time}</span>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{cls.courseName}</h4>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">Reschedule</Button>
                                        {cls.meetingLink ? (
                                            <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm">Join Class</Button>
                                            </a>
                                        ) : (
                                            <Button size="sm" disabled>No Link</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {upcomingClasses.length === 0 && (
                                <div className="p-8 text-center text-slate-500">No upcoming classes scheduled.</div>
                            )}
                        </div>
                    </div>

                    {/* Class History / Recent */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">Recent Sessions</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-500 text-sm italic">Showing last 5 completed sessions...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
