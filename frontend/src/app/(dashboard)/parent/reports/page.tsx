"use client"

import { useState } from "react"
import { BookOpen, TrendingUp, Award, Clock } from "lucide-react"
import { MOCK_USERS, MOCK_ENROLLMENTS, MOCK_COURSES } from "@/lib/mock-data"

export default function ParentReportsPage() {
    // Hardcoded for "p1" parent
    const children = Object.values(MOCK_USERS).filter(
        (user) => user.role === "student" && user.parentId === "p1"
    )

    // Default to first child if available
    const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || "")

    const selectedChild = children.find(c => c.id === selectedChildId)

    // Get enrollments for selected child
    const childEnrollments = MOCK_ENROLLMENTS.filter(e => e.studentId === selectedChildId)

    // Merge enrollment data with course data
    const enrollmentDetails = childEnrollments.map(enrollment => {
        const course = MOCK_COURSES.find(c => c.id === enrollment.courseId)
        return {
            ...enrollment,
            courseName: course?.name || "Unknown Course",
            level: course?.level || "N/A"
        }
    })

    if (!selectedChild) {
        return <div>No children found associated with this account.</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Progress Reports</h1>
                    <p className="text-slate-600">Track academic performance and course activities</p>
                </div>

                {children.length > 1 && (
                    <select
                        className="px-4 py-2 border rounded-lg bg-white min-w-[200px]"
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                    >
                        {children.map(child => (
                            <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">Overall GPA</span>
                        <Award className="text-yellow-500" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">3.8</div>
                    <div className="text-xs text-green-600 font-medium mt-1">+0.2 from last term</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">Attendance</span>
                        <Clock className="text-blue-500" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">96%</div>
                    <div className="text-xs text-slate-500 mt-1">Total sessions: 24</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">Assignments</span>
                        <BookOpen className="text-purple-500" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">18/20</div>
                    <div className="text-xs text-slate-500 mt-1">Completed on time</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500">Active Year</span>
                        <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{childEnrollments.filter(e => e.status === 'active').length}</div>
                    <div className="text-xs text-slate-500 mt-1">Currently enrolled</div>
                </div>
            </div>

            {/* Detailed Course Performance */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Course Performance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enrollmentDetails.map((details) => (
                                <tr key={details.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">{details.courseName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {details.level}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${details.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {details.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                        {/* Mock grade logic */}
                                        A-
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap w-48">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 text-right">75% Complete</div>
                                    </td>
                                </tr>
                            ))}
                            {enrollmentDetails.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No course enrollments found for this student.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
