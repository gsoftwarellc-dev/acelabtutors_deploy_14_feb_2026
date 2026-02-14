"use client"

import { useState, useEffect } from "react"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ClassHistory {
    id: number
    title: string
    course_name: string
    tutor_name: string
    start_time: string
    duration: number
    status: string
}

export default function ClassHistoryPage() {
    const [classHistory, setClassHistory] = useState<ClassHistory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClassHistory()
    }, [])

    const fetchClassHistory = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/student/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setClassHistory(data.class_history || [])
            }
        } catch (error) {
            console.error('Failed to fetch class history:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (dateTime: string) => {
        const date = new Date(dateTime)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-400">Loading class history...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/student">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Class History</h1>
                <p className="text-slate-600">Complete record of all your attended classes</p>
            </div>

            {/* Class History Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tutor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {classHistory.length > 0 ? (
                                classHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">{item.course_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.tutor_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(item.start_time)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{formatTime(item.start_time)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.duration} min</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle size={12} className="mr-1" />
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No class history yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            {classHistory.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-900">
                            <span className="font-semibold">{classHistory.length}</span> total classes completed
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
