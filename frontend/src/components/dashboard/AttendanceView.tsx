"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Save, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StudentAttendance {
    student_id: number
    name: string
    email: string
    avatar?: string
    status: 'present' | 'absent' | 'late' | 'excused' | null
}

interface AttendanceViewProps {
    courseId: number
}

export default function AttendanceView({ courseId }: AttendanceViewProps) {
    const [date, setDate] = useState<Date>(new Date())
    const [students, setStudents] = useState<StudentAttendance[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchAttendance()
    }, [date, courseId])

    const fetchAttendance = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const dateStr = format(date, 'yyyy-MM-dd')

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/courses/${courseId}/attendance?date=${dateStr}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setStudents(data)
            }
        } catch (error) {
            console.error("Failed to fetch attendance", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = (studentId: number, isPresent: boolean) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id === studentId) {
                return { ...s, status: isPresent ? 'present' : 'absent' }
            }
            return s
        }))
    }

    const saveAttendance = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem('token')
            const dateStr = format(date, 'yyyy-MM-dd')

            const attendanceData = students.map(s => ({
                student_id: s.student_id,
                status: s.status || 'absent'
            }))

            console.log("Saving attendance Payload:", { date: dateStr, attendance: attendanceData })

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'}/api/courses/${courseId}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: dateStr,
                    attendance: attendanceData
                })
            })

            if (res.ok) {
                console.log("Attendance saved successfully")
                alert("Attendance saved successfully")
            } else {
                const errorText = await res.text()
                console.error("Save failed response:", errorText)
                try {
                    const errorJson = JSON.parse(errorText)
                    alert(`Failed to save attendance: ${errorJson.message || 'Unknown error'}`)
                } catch (e) {
                    alert(`Failed to save attendance: ${errorText}`)
                }
            }
        } catch (error) {
            console.error("Failed to save network/logic error", error)
            alert("Error saving attendance")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <span className="text-sm text-slate-500">
                        Select a date to view or take attendance
                    </span>
                </div>

                <Button onClick={saveAttendance} disabled={saving || loading}>
                    {saving ? "Saving..." : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Attendance
                        </>
                    )}
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No students enrolled in this course.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => {
                                const isPresent = student.status === 'present'
                                return (
                                    <TableRow key={student.student_id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.avatar} />
                                                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold">{student.name}</div>
                                                    <div className="text-xs text-slate-500">ID: {student.student_id}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPresent
                                                ? 'bg-green-100 text-green-800'
                                                : student.status === null
                                                    ? 'bg-slate-100 text-slate-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {student.status ? (student.status.charAt(0).toUpperCase() + student.status.slice(1)) : 'Not Recorded'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant={isPresent ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleStatusChange(student.student_id, true)}
                                                    className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    <Check className="mr-1 h-3 w-3" />
                                                    Present
                                                </Button>
                                                <Button
                                                    variant={!isPresent && student.status !== null ? "destructive" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleStatusChange(student.student_id, false)}
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Absent
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
