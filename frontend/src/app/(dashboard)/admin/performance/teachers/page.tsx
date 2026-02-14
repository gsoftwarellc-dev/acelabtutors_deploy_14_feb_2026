"use client"

import { useState } from "react"
import { Search, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function TeacherPerformancePage() {
    const [searchTerm, setSearchTerm] = useState("")

    const teachers: any[] = []

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Teacher Performance</h1>
                <p className="text-slate-600">Monitor teacher metrics and activity</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search teachers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Teachers List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-left">Teacher</th>
                                <th className="px-6 py-3 font-medium text-left">Email</th>
                                <th className="px-6 py-3 font-medium text-center">Courses</th>
                                <th className="px-6 py-3 font-medium text-center">Students</th>
                                <th className="px-6 py-3 font-medium text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{teacher.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{teacher.email}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{teacher.courses}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{teacher.students}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link href={`/admin/performance/teachers/${teacher.id}`}>
                                            <button className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                                                View Details <ArrowRight size={16} className="ml-1" />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredTeachers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No teachers found matching &quot;{searchTerm}&quot;
                </div>
            )}
        </div>
    )
}
