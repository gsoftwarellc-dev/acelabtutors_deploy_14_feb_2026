"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, FileText, Lock, ChevronDown, ChevronUp, CheckCircle, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function StudentCourseDetailPage() {
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
        lessons_count?: number
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
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
                const token = localStorage.getItem('token')
                const headers: HeadersInit = {}
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                // Fetch Course Details
                const courseRes = await fetch(`${apiUrl}/api/courses/${id}`, { headers })
                if (courseRes.ok) {
                    const courseData = await courseRes.json()
                    setCourse(courseData)
                }

                // Fetch Curriculum
                const curriculumRes = await fetch(`${apiUrl}/api/courses/${id}/content`, { headers })
                if (curriculumRes.ok) {
                    const curriculumData = await curriculumRes.json()
                    setChapters(curriculumData)
                    if (curriculumData.length > 0) {
                        setOpenChapters([curriculumData[0].id])
                        // Auto-select first lesson if available
                        if (curriculumData[0].lessons && curriculumData[0].lessons.length > 0) {
                            setActiveLesson(curriculumData[0].lessons[0])
                        }
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
                <Link href="/student/courses">
                    <Button>Back to My Year</Button>
                </Link>
            </div>
        )
    }

    const renderLessonContent = () => {
        if (!activeLesson) return null

        // Handle live_class (Google Meet) lessons
        if (activeLesson.type === 'live_class') {
            const meetingLink = (activeLesson as any).meeting_link
            const startTime = (activeLesson as any).start_time
            const duration = (activeLesson as any).duration

            const formatDateTime = (dateTime: string) => {
                if (!dateTime) return null
                const date = new Date(dateTime)
                return {
                    date: date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    time: date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                }
            }

            const meetingTime = startTime ? formatDateTime(startTime) : null

            return (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge className="bg-green-500 hover:bg-green-600">Live Class</Badge>
                                {meetingLink && <Badge variant="outline" className="border-blue-300 text-blue-700">Google Meet</Badge>}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeLesson.title}</h3>

                            {meetingTime && (
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Clock size={16} className="text-blue-600" />
                                        <span className="font-medium">{meetingTime.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Clock size={16} className="text-blue-600" />
                                        <span className="font-medium">{meetingTime.time}</span>
                                    </div>
                                    {duration && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="text-sm">Duration: {duration} minutes</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!meetingLink && !startTime && (
                                <p className="text-slate-600 mb-4">
                                    This is a live class session. Meeting details will be available soon.
                                </p>
                            )}
                        </div>
                    </div>

                    {meetingLink && (
                        <div className="flex gap-3">
                            <a
                                href={meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <Button
                                    size="lg"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                                >
                                    <ExternalLink size={20} className="mr-2" />
                                    Join Google Meet
                                </Button>
                            </a>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(meetingLink)}
                                title="Copy meeting link"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </Button>
                        </div>
                    )}
                </div>
            )
        }

        // If file_path exists, it's an uploaded file. Construct full URL.
        // Assuming file_path is like "course_materials/xyz.mp4" and we serve from public root or storage route
        // For this demo, let's assume direct storage access via API URL is set up or we need to fix it.
        // Backend stores in 'public' disk -> storage/app/public.
        // Needs `php artisan storage:link` to be accessible at /storage.
        // So URL should be API_URL + '/storage/' + activeLesson.file_path

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk';
        // Note: In typical Laravel setup, it's /storage, but let's check if file_path already has /storage?
        // Lesson controller stores as 'course_materials/...'
        const fileUrl = (activeLesson as any).file_path
            ? `${apiUrl}/storage/${(activeLesson as any).file_path}`
            : activeLesson.type === 'video' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : null; // Fallback demo video

        // Use Mock video if real one isn't working/present for the "make as if" request
        const videoSrc = fileUrl

        if (activeLesson.type === 'video') {
            // Check if it is a YouTube URL
            const youtubeUrl = (activeLesson as any).content;
            let youtubeEmbedUrl = null;

            if (youtubeUrl && (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be'))) {
                const videoId = youtubeUrl.split('v=')[1]?.split('&')[0] || youtubeUrl.split('/').pop();
                // modestbranding=1: Minimal branding
                // rel=0: Related videos from same channel only
                // showinfo=0: (Deprecated but good to have)
                // controls=1: Show controls (user asked for this)
                youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0`;
            }

            return (
                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {youtubeEmbedUrl ? (
                        <>
                            <iframe
                                src={youtubeEmbedUrl}
                                className="w-full h-full"
                                title={activeLesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                // Sandbox: Block popups and top-navigation to prevent "Watch on YouTube"
                                // Note: We need allow-scripts and allow-same-origin for the player to work
                                sandbox="allow-scripts allow-same-origin allow-presentation"
                            />
                            {/* Click Shields to prevent external navigation */}
                            {/* Top Title Bar Shield */}
                            <div className="absolute top-0 left-0 w-full h-[15%] z-10" />

                            {/* Bottom Right Logo Shield */}
                            <div className="absolute bottom-0 right-0 w-[15%] h-[15%] z-10" />

                            {/* Top Right Share/Watch Later Shield */}
                            <div className="absolute top-0 right-0 w-[20%] h-[15%] z-10" />
                        </>
                    ) : (
                        <video
                            controls
                            className="w-full h-full"
                            src={videoSrc || ""}
                            poster="/course-placeholder.jpg"
                        >
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
            )
        }

        if (activeLesson.type === 'pdf' || (fileUrl && fileUrl.endsWith('.pdf'))) {
            return (
                <div className="flex flex-col gap-4">
                    <div className="w-full h-[800px] bg-slate-100 rounded-xl border overflow-hidden shadow-sm">
                        {fileUrl ? (
                            <iframe
                                src={`${fileUrl}#toolbar=0`}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <FileText size={48} className="mb-4" />
                                <p>PDF file not available</p>
                            </div>
                        )}
                    </div>

                    {fileUrl && (
                        <div className="flex justify-end">
                            <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                                <Button className="gap-2">
                                    <ExternalLink size={18} />
                                    Download PDF
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">{activeLesson.title}</h3>
                <p className="text-slate-500 mb-4">This lesson content is text or a file download.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {(activeLesson as any).file_path && (
                    <a href={`${apiUrl}/storage/${(activeLesson as any).file_path}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">Download Material</Button>
                    </a>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8 font-sans">
            {/* Player / Header Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                {activeLesson ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{activeLesson.title}</h2>
                                <p className="text-sm text-slate-500">Lesson {activeLesson.id}</p>
                            </div>
                            <Badge variant={activeLesson.type === 'video' ? 'default' : 'secondary'}>
                                {activeLesson.type}
                            </Badge>
                        </div>
                        {renderLessonContent()}
                    </div>
                ) : (
                    <div className="bg-slate-900 text-white rounded-xl p-8 md:p-12 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <PlayCircle size={200} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-0">
                                    Enrolled
                                </Badge>
                                <span className="text-slate-400 text-sm">{course.lessons_count || 0} Lessons</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                                {course.name}
                            </h1>
                            <p className="text-slate-400 text-lg mb-8 line-clamp-2">
                                {course.description || "Start learning today by selecting a lesson from the curriculum below."}
                            </p>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white border-0">
                                Start Learning
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Curriculum */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Course Content</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {chapters.map((chapter) => (
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
                                            <span className="text-xs font-semibold text-slate-400 bg-slate-200/50 px-2 py-1 rounded">
                                                {chapter.lessons ? chapter.lessons.length : 0} Lectures
                                            </span>
                                        </button>

                                        {openChapters.includes(chapter.id) && (
                                            <div className="bg-white border-t border-slate-100">
                                                {chapter.lessons && chapter.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        onClick={() => setActiveLesson(lesson)}
                                                        className={`p-3 pl-11 flex items-center justify-between hover:bg-blue-50 transition-all border-b border-slate-50 last:border-0 cursor-pointer group border-l-4 ${activeLesson?.id === lesson.id ? 'border-l-blue-600 bg-blue-50' : 'border-l-transparent'}`}
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'}`}>
                                                                {lesson.type === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />}
                                                            </div>
                                                            <span className={`text-sm font-medium truncate ${activeLesson?.id === lesson.id ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-700'}`}>{lesson.title}</span>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-3">
                                                            <span className="text-xs text-slate-400">10 min</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Q&A or Assignments? */}
                <div className="space-y-6">
                    {/* Progress removed as requested */}
                </div>
            </div>
        </div>
    )
}
