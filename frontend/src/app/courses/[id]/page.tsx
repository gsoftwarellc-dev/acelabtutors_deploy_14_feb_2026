"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, FileText, Lock, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PublicCourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    interface Course {
        id: number
        name: string
        description: string
        status: string
        type_of_school?: string
        year?: string
        subject?: string
        tutor: {
            id: number
            name: string
            email: string
        }
        is_enrolled?: boolean
    }

    interface Lesson {
        id: number
        title: string
        type: string
        is_free: boolean
        duration?: string
    }

    interface Chapter {
        id: number
        title: string
        lessons: Lesson[]
    }

    const [course, setCourse] = useState<Course | null>(null)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)
    const [openChapters, setOpenChapters] = useState<number[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'

                // Fetch Course Details
                const courseRes = await fetch(`${apiUrl}/api/courses/${id}`)

                if (courseRes.ok) {
                    const courseData = await courseRes.json()
                    setCourse(courseData)
                }

                // Fetch enrollment status separately if user is logged in? 
                // Actually the backend showCourse now returns is_enrolled if authenticated.
                // We need to pass the token in the fetch to get that info.
                const token = localStorage.getItem('token')
                const headers: HeadersInit = {}
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                const courseResAuth = await fetch(`${apiUrl}/api/courses/${id}`, { headers })
                if (courseResAuth.ok) {
                    const courseData = await courseResAuth.json()
                    setCourse(courseData)
                }

                // Fetch Curriculum
                const curriculumRes = await fetch(`${apiUrl}/api/courses/${id}/curriculum`)
                if (curriculumRes.ok) {
                    const curriculumData = await curriculumRes.json()
                    setChapters(curriculumData)
                    if (curriculumData.length > 0) {
                        setOpenChapters([curriculumData[0].id])
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const toggleChapter = (chapterId: number) => {
        setOpenChapters(prev =>
            prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        )
    }

    const [enrollLoading, setEnrollLoading] = useState(false)

    const handleEnroll = async () => {
        setEnrollLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/courses/${course?.id}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                // Update local state to show "Go to Course"
                setCourse(prev => prev ? ({ ...prev, is_enrolled: true }) : null)
                // Optionally show success toast
            } else {
                const data = await res.json()
                if (res.status === 409) {
                    // Already enrolled
                    setCourse(prev => prev ? ({ ...prev, is_enrolled: true }) : null)
                } else {
                    console.error("Enrollment failed", data)
                }
            }
        } catch (error) {
            console.error("Error enrolling", error)
        } finally {
            setEnrollLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Course Not Found</h1>
                <Link href="/courses">
                    <Button>Browse All Year</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Back Button */}
                {/* Back Button */}
                <Link href="/courses">
                    <Button className="mb-6 gap-2 bg-black text-white hover:bg-slate-800 hover:text-white transition-all shadow-md">
                        <ArrowLeft size={16} />
                        Back to Year
                    </Button>
                </Link>

                {/* Header Section */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {course.subject && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                {course.subject}
                            </Badge>
                        )}
                        {course.type_of_school && (
                            <Badge variant="outline" className="bg-white border-slate-300 text-slate-700">
                                {course.type_of_school}
                            </Badge>
                        )}
                        {course.year && (
                            <Badge variant="outline" className="bg-white border-slate-300 text-slate-700">
                                {course.year}
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {course.name}
                    </h1>

                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                        {course.description}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Curriculum */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900">Curriculum</h2>
                                <span className="text-sm text-slate-500 font-medium">
                                    {chapters.length} Sections • {chapters.reduce((acc, c) => acc + c.lessons.length, 0)} Lessons
                                </span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {chapters.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        No curriculum content available yet.
                                    </div>
                                ) : (
                                    chapters.map((chapter) => (
                                        <div key={chapter.id} className="bg-slate-50/50">
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {openChapters.includes(chapter.id) ? (
                                                        <ChevronUp size={20} className="text-slate-400" />
                                                    ) : (
                                                        <ChevronDown size={20} className="text-slate-400" />
                                                    )}
                                                    <h3 className="font-semibold text-slate-900">{chapter.title}</h3>
                                                </div>
                                            </button>

                                            {openChapters.includes(chapter.id) && (
                                                <div className="bg-white border-t border-slate-100">
                                                    {chapter.lessons.map((lesson) => (
                                                        <div key={lesson.id} className="p-3 pl-11 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                {lesson.type === 'video' ? (
                                                                    <PlayCircle size={16} className="text-blue-500 shrink-0" />
                                                                ) : (
                                                                    <FileText size={16} className="text-slate-400 shrink-0" />
                                                                )}
                                                                <span className="text-slate-600 text-sm truncate">{lesson.title}</span>
                                                            </div>
                                                            <div className="shrink-0">
                                                                {lesson.is_free ? (
                                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Preview</span>
                                                                ) : (
                                                                    <Lock size={14} className="text-slate-300" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Enrollment */}
                    <div className="relative">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-slate-900">Free</span>
                                    <p className="text-sm text-slate-500 mt-1">Enroll now to get started.</p>
                                </div>

                                {course?.is_enrolled ? (
                                    <Link href={`/student/courses/${id}`}>
                                        <Button className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 transition-all">
                                            Go to Course
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        onClick={handleEnroll}
                                        disabled={enrollLoading}
                                        className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all"
                                    >
                                        {enrollLoading ? "Enrolling..." : "Enroll in Course"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
