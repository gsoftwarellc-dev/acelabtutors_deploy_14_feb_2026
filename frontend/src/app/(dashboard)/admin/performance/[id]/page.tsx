"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Mail, Phone, Calendar, GraduationCap, BookOpen, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AttendanceStats {
    present: number
    absent: number
    late: number
    excused: number
    total: number
}

interface AttendanceRecord {
    date: string
    status: string
    visits: number
}

interface Enrollment {
    course_id: number
    course_name: string
    course_level: string
    enrollment_date: string
    status: string
    attendance_stats: AttendanceStats
    attendance_records: AttendanceRecord[]
}

interface UserData {
    id: number
    name: string
    email: string
    phone?: string
    role: string
    avatar?: string
    created_at: string
}

interface DailyVisit {
    date: string
    visits: number
}

interface PerformanceData {
    user: UserData
    enrollments: Enrollment[]
    daily_visits: DailyVisit[]
}

export default function UserPerformancePage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const [data, setData] = useState<PerformanceData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPerformance()
    }, [userId])

    const fetchPerformance = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(
                `${apiUrl}/api/admin/users/${userId}/performance`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )
            if (response.ok) {
                const result = await response.json()
                setData(result)
            } else {
                console.error("Failed to fetch performance data")
            }
        } catch (error) {
            console.error("Error fetching performance:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getAttendanceRate = (stats: AttendanceStats) => {
        if (stats.total === 0) return 0
        return Math.round((stats.present / stats.total) * 100)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-slate-600">User not found</p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Performance</h1>
                    <p className="text-slate-600">Detailed view of student activity and attendance</p>
                </div>
            </div>

            {/* User Profile Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        <Avatar className="w-24 h-24 border-2">
                            <AvatarImage src={data.user.avatar} />
                            <AvatarFallback className="text-2xl">
                                {data.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-slate-900">{data.user.name}</h2>
                                <Badge variant="outline" className="capitalize">{data.user.role}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Mail size={16} />
                                    <span>{data.user.email}</span>
                                </div>
                                {data.user.phone && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone size={16} />
                                        <span>{data.user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar size={16} />
                                    <span>Joined {formatDate(data.user.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="font-mono font-semibold">ID: {data.user.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enrolled Courses & Attendance */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Enrolled Courses ({data.enrollments.length})
                </h3>

                {data.enrollments.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-slate-500">
                            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p>No course enrollments found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.enrollments.map((enrollment) => {
                            const attendanceRate = getAttendanceRate(enrollment.attendance_stats)
                            return (
                                <Card key={enrollment.course_id}>
                                    <CardHeader className="border-b bg-slate-50">
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            <span>{enrollment.course_name}</span>
                                            <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                                                {enrollment.status}
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {enrollment.course_level} • Enrolled {formatDate(enrollment.enrollment_date)}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {/* Attendance Rate */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Attendance Rate
                                                    </span>
                                                    <span className={`text-lg font-bold ${attendanceRate >= 80 ? 'text-green-600' :
                                                        attendanceRate >= 60 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {attendanceRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${attendanceRate >= 80 ? 'bg-green-600' :
                                                            attendanceRate >= 60 ? 'bg-yellow-600' :
                                                                'bg-red-600'
                                                            }`}
                                                        style={{ width: `${attendanceRate}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Attendance Stats */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-slate-600">Present:</span>
                                                    <span className="font-semibold">{enrollment.attendance_stats.present}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <XCircle className="w-4 h-4 text-red-600" />
                                                    <span className="text-slate-600">Absent:</span>
                                                    <span className="font-semibold">{enrollment.attendance_stats.absent}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-slate-600">Late:</span>
                                                    <span className="font-semibold">{enrollment.attendance_stats.late}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                    <span className="text-slate-600">Total:</span>
                                                    <span className="font-semibold">{enrollment.attendance_stats.total}</span>
                                                </div>
                                            </div>

                                            {/* Attendance History */}
                                            {enrollment.attendance_records.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                                        Attendance History
                                                    </h4>
                                                    <div className="border rounded-md max-h-60 overflow-y-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Date</TableHead>
                                                                    <TableHead>Status</TableHead>
                                                                    <TableHead>Visits</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {enrollment.attendance_records.map((record, idx) => (
                                                                    <TableRow key={idx}>
                                                                        <TableCell className="font-medium">
                                                                            {formatDate(record.date)}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                variant={
                                                                                    record.status === 'present' ? 'default' :
                                                                                        record.status === 'absent' ? 'destructive' :
                                                                                            record.status === 'late' ? 'outline' :
                                                                                                'secondary'
                                                                                }
                                                                                className={
                                                                                    record.status === 'present' ? 'bg-green-600' :
                                                                                        record.status === 'late' ? 'border-yellow-600 text-yellow-700' :
                                                                                            ''
                                                                                }
                                                                            >
                                                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <span className="text-sm font-medium text-slate-700">
                                                                                {record.visits} {record.visits === 1 ? 'time' : 'times'}
                                                                            </span>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Daily Visits */}
            {data.daily_visits && data.daily_visits.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Daily Visits
                    </h3>
                    <Card>
                        <CardContent className="p-0">
                            <div className="border rounded-md max-h-80 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Visits</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.daily_visits.map((visit, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">
                                                    {formatDate(visit.date)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {visit.visits} {visit.visits === 1 ? 'time' : 'times'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
