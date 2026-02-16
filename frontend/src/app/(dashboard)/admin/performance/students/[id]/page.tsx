import { ArrowLeft, BookOpen, Calendar, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StudentDetailPage({ params }: { params: { id: string } }) {
    // Mock data - in real app, fetch based on params.id
    const student = {
        id: params.id,
        name: "Alex Johnson",
        email: "alex@example.com",
        phone: "+1 (555) 123-4567",
        enrolledYear: [
            { name: "Mathematics - Calculus", tutor: "Dr. Emily Chen", hours: 28 },
            { name: "Physics - Quantum Mechanics", tutor: "James Wilson", hours: 20 }
        ],
        attendance: "98%",
        totalHours: 48,
        averageScore: "91.7%",
        recentActivity: [
            { date: "Mar 18, 2026", subject: "Mathematics", duration: "1h", status: "Completed" },
            { date: "Mar 18, 2026", subject: "Physics", duration: "1.5h", status: "Completed" },
            { date: "Mar 15, 2026", subject: "Mathematics", duration: "1h", status: "Completed" },
        ]
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/performance/students">
                    <Button variant="outline" size="sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Students
                    </Button>
                </Link>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{student.name}</h1>
                <p className="text-slate-600">{student.email} • {student.phone}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Attendance</h3>
                        <Calendar size={20} />
                    </div>
                    <p className="text-3xl font-bold">{student.attendance}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Year</h3>
                        <BookOpen size={20} />
                    </div>
                    <p className="text-3xl font-bold">{student.enrolledYear.length}</p>
                </div>
            </div>

            {/* Enrolled Year */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Enrolled Year</h2>
                <div className="space-y-4">
                    {student.enrolledYear.map((course, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <h4 className="font-semibold text-slate-900">{course.name}</h4>
                                <p className="text-sm text-slate-500">Tutor: {course.tutor}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900">{course.hours}h</p>
                                <p className="text-xs text-slate-500">completed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-left">Date</th>
                                <th className="px-6 py-3 font-medium text-left">Subject</th>
                                <th className="px-6 py-3 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {student.recentActivity.map((activity, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-900">{activity.date}</td>
                                    <td className="px-6 py-4 text-slate-600">{activity.subject}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            {activity.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
