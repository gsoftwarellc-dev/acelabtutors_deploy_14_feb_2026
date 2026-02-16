"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserCheck, BookOpen, User, History as HistoryIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function ParentDashboard() {
    const [searchId, setSearchId] = useState("")
    const [loading, setLoading] = useState(false)
    const [childData, setChildData] = useState<any>(null)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchId.trim()) return

        setLoading(true)
        setSearched(true)
        setChildData(null)

        try {
            const { data } = await api.post('/parent/search-child', { student_id: searchId })
            setChildData(data)
        } catch (error: any) {
            console.error("Search failed:", error)
            if (error.response?.status === 404) {
                toast.error("Student not found with this ID")
            } else {
                toast.error("Failed to search. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-800">Find Your Child's Progress</h1>
                <p className="text-slate-500">Enter your child's Student ID to view their performance and classes.</p>
            </div>

            {/* Search Box */}
            <Card className="max-w-xl mx-auto border-blue-100 shadow-md">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Enter Student ID (e.g., 25)"
                                className="pl-10 h-12 text-lg"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Results Section */}
            {childData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Student Profile Header */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-6">
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <User size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{childData.student.name}</h2>
                            <p className="text-slate-500">Student ID: <span className="font-mono font-medium text-slate-700">{childData.student.id}</span></p>
                            <p className="text-sm text-slate-400">Joined {childData.student.joined_at}</p>
                        </div>
                    </div>

                    {/* Year Grid */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                            <BookOpen className="mr-2 text-primary" size={24} />
                            Enrolled Year
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {childData.enrollments.map((enrollment: any) => (
                                <Card key={enrollment.course_id} className="hover:shadow-md transition-all border-slate-200">
                                    <div className="h-2 bg-primary w-full rounded-t-xl" />
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex justify-between items-start">
                                            <span>{enrollment.course_name}</span>
                                            <span className="text-xs font-normal px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">
                                                {enrollment.status}
                                            </span>
                                        </CardTitle>
                                        <p className="text-sm text-slate-500">Tutor: {enrollment.tutor_name}</p>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Class History */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                                <HistoryIcon className="mr-2 text-primary" size={24} />
                                Class History
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {childData.class_history.length > 0 ? (
                                childData.class_history.map((record: any) => (
                                    <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                                <HistoryIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{record.course_name}</p>
                                                <p className="text-sm text-slate-500">{new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'present'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {record.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <p>No class history recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {searched && !childData && !loading && (
                <div className="text-center py-12 text-slate-500">
                    <UserCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-lg">No student found.</p>
                    <p className="text-sm">Please check the Student ID and try again.</p>
                </div>
            )}
        </div>
    )
}
