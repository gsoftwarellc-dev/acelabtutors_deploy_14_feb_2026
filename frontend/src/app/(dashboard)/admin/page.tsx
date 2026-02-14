"use client"

import { useState, useEffect } from "react"
// import { MOCK_STATS } from "@/lib/mock-data"
import { StatCard } from "@/components/shared/stat-card"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [statsData, setStatsData] = useState({
        totalRevenue: "£0.00",
        thisMonthRevenue: "£0.00",
        totalPaidToTutors: "£0.00",
        activeTutors: 0,
        totalStudents: 0
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                // Fetch Users
                const usersResponse = await fetch(`${apiUrl}/api/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
                if (usersResponse.ok) {
                    const data = await usersResponse.json()
                    setUsers(data)
                }

                // Fetch Stats
                const statsResponse = await fetch(`${apiUrl}/api/admin/dashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
                if (statsResponse.ok) {
                    const data = await statsResponse.json()
                    setStatsData(data)
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    const filteredUsers = users.filter(user => {
        if (!dateRange.start && !dateRange.end) return true
        const userDate = new Date(user.created_at)
        const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01')
        const end = dateRange.end ? new Date(dateRange.end) : new Date()
        end.setHours(23, 59, 59, 999)
        return userDate >= start && userDate <= end
    })

    const studentsCount = filteredUsers.filter(u => u.role === 'student').length
    const tutorsCount = filteredUsers.filter(u => u.role === 'tutor').length

    const stats = [
        { label: "Total Revenue", value: statsData.totalRevenue, change: "+0% vs last month", trend: "neutral" as const },
        { label: "Total Paid to Tutors", value: statsData.totalPaidToTutors, change: "Last 30 days", trend: "neutral" as const },
        { label: "Active Tutors", value: statsData.activeTutors.toString(), change: "In selected period", trend: "neutral" as const },
        { label: "Total Students", value: statsData.totalStudents.toString(), change: "In selected period", trend: "neutral" as const },
    ]

    return (
        <div className="space-y-8">
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="font-semibold text-lg text-slate-900">Dashboard Overview</h2>
                    <p className="text-slate-500 text-sm">Filter data by date range</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">From:</span>
                        <input
                            type="date"
                            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">To:</span>
                        <input
                            type="date"
                            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    {(dateRange.start || dateRange.end) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDateRange({ start: '', end: '' })}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>
        </div>
    )
}
