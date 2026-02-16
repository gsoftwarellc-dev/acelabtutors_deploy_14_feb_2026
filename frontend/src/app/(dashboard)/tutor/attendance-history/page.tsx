"use client"

import { useState } from "react"
import { Search, ArrowLeft, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
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

interface PerformanceData {
    user: UserData
    enrollments: Enrollment[]
}

export default function AttendanceHistoryPage() {
    const [searchId, setSearchId] = useState("")
    const [searchedId, setSearchedId] = useState("")
    const [data, setData] = useState<PerformanceData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSearch = async () => {
        if (!searchId.trim()) {
            setError("Please enter a student ID")
            return
        }

        setLoading(true)
        setError("")
        setData(null)

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const response = await fetch(
                `${apiUrl}/api/admin/users/${searchId}/performance`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.ok) {
                const result = await response.json()
                setData(result)
                setSearchedId(searchId)
            } else if (response.status === 404) {
                setError(`Student with ID ${searchId} not found`)
            } else {
                setError("Failed to fetch student data")
            }
        } catch (err) {
            console.error("Error fetching attendance:", err)
            setError("An error occurred while fetching data")
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



    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Attendance History</h1>
                <p className="text-slate-600">Search for a student by ID to view their attendance records</p>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Enter Student ID (e.g., 7)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </div>
                    {error && (
                        <p className="mt-3 text-sm text-red-600">{error}</p>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            {loading && (
                <div className="space-y-4">
                    <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            )}

            {!loading && data && (
                <div className="space-y-6">
                    {/* Student Info Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-16 h-16 border-2">
                                    <AvatarImage src={data.user.avatar} />
                                    <AvatarFallback className="text-lg">
                                        {data.user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-slate-900">{data.user.name}</h2>
                                        <Badge variant="outline" className="capitalize">{data.user.role}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">{data.user.email}</p>
                                    <p className="text-xs text-slate-500 mt-1">ID: {data.user.id}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Records by Course */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            Attendance Records ({data.enrollments.length} course{data.enrollments.length !== 1 ? 's' : ''})
                        </h3>

                        {data.enrollments.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center text-slate-500">
                                    <p className="text-lg font-medium">No course enrollments found</p>
                                    <p className="text-sm mt-2">This student is not enrolled in any courses yet.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {data.enrollments.map((enrollment) => {

                                    return (
                                        <Card key={enrollment.course_id}>
                                            <CardHeader className="border-b bg-slate-50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{enrollment.course_name}</CardTitle>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {enrollment.course_level} • Enrolled {formatDate(enrollment.enrollment_date)}
                                                        </p>
                                                    </div>
                                                    <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                                                        {enrollment.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                {/* Attendance Summary */}


                                                {/* Attendance History Table */}
                                                {enrollment.attendance_records.length > 0 ? (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                                            Detailed History
                                                        </h4>
                                                        <div className="border rounded-md max-h-80 overflow-y-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Date</TableHead>
                                                                        <TableHead>Status</TableHead>
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
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic text-center py-4">
                                                        No attendance records for this course yet
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
