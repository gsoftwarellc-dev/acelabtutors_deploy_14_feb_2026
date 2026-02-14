"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Search, Filter, BookOpen, Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Course {
    id: number
    name: string
    description: string
    tutor: {
        id: number
        name: string
    }
    level: string
    lessons_count: number
    enrollment_status: 'active' | 'completed' | 'dropped'
    progress: number
    enrollment_date: string
    type_of_school?: string
    year?: string
    subject?: string
}

export default function MyCoursesPage() {
    const { user } = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'enrolled' | 'completed'>('enrolled')
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const response = await fetch(`${apiUrl}/api/student/courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setCourses(data)
                }
            } catch (error) {
                console.error("Failed to fetch courses", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCourses()
    }, [])

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tutor.name.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'enrolled') {
            return matchesSearch && course.enrollment_status === 'active'
        } else {
            return matchesSearch && (course.enrollment_status === 'completed' || course.progress === 100)
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Courses</h1>
                    <p className="text-slate-600">Manage and track your learning progress</p>
                </div>
                <Link href="/courses">
                    <Button>
                        <BookOpen className="mr-2 h-4 w-4" /> Browse More Courses
                    </Button>
                </Link>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'enrolled'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Active Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'completed'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Completed
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                {/* Badge removed */}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                        {course.subject || 'General'}
                                    </span>
                                    <div className="flex items-center text-xs text-slate-500">
                                        <BookOpen size={12} className="mr-1" />
                                        {course.lessons_count} Lessons
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{course.name}</h3>
                                <p className="text-sm text-slate-500 mb-4">Instructor: {course.tutor.name}</p>

                                <div className="mt-auto space-y-4">
                                    <Link href={`/student/courses/${course.id}`} className="block">
                                        <Button className="w-full" variant={activeTab === 'completed' ? "outline" : "default"}>
                                            {activeTab === 'completed' ? 'Review Course' : 'Continue Learning'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                        <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-1">No courses found</h3>
                    <p className="text-slate-500 mb-6">
                        {activeTab === 'enrolled'
                            ? "You haven't enrolled in any courses yet."
                            : "You haven't completed any courses yet."}
                    </p>
                    {activeTab === 'enrolled' && (
                        <Link href="/courses">
                            <Button>Browse Courses</Button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
