"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Video, Youtube, Clock, Calendar, ExternalLink } from "lucide-react"

interface Lesson {
    id: number
    title: string
    type: 'video' | 'pdf' | 'text' | 'quiz' | 'live_class'
    content?: string
    file_path?: string
    is_free: boolean
    meeting_link?: string
    start_time?: string
    duration?: number
}

export default function TutorLessonPreviewPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.id as string
    const lessonId = params.lessonId as string
    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const token = localStorage.getItem('token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
                // Reusing the same endpoint, assuming public/tutor access or creating a specific one if needed.
                // Since this is a "preview", we might need a specific endpoint if the public one is restricted.
                // However, tutors usually have broad access. Let's try the public or generic one first.
                // Actually, specific lesson details often come from the curriculum list. 
                // Let's fetch the specific lesson by ID directly.
                const res = await fetch(`${apiUrl}/api/lessons/${lessonId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    setLesson(data)
                } else {
                    console.error("Failed to fetch lesson")
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchLesson()
    }, [lessonId])

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                <Link href={`/tutor/courses/${courseId}`}>
                    <Button variant="ghost" size="icon" className="mb-4">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="p-8 text-center">Loading lesson preview...</div>
            </div>
        )
    }

    if (!lesson) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                <Link href={`/tutor/courses/${courseId}`}>
                    <Button variant="ghost" size="icon" className="mb-4">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="p-8 text-center text-red-500">Lesson not found or access denied.</div>
            </div>
        )
    }

    const renderContent = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
        let fileUrl: string | null = null;

        if (lesson.type === 'video') {
            if (lesson.content && lesson.content.startsWith('http')) {
                fileUrl = lesson.content;
            } else if (lesson.file_path) {
                fileUrl = `${apiUrl}/storage/${lesson.file_path}`;
            }
        } else if (lesson.file_path) {
            fileUrl = `${apiUrl}/storage/${lesson.file_path}`;
        }

        switch (lesson.type) {
            case 'video':
                const isYouTube = fileUrl && (fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be'));

                if (isYouTube) {
                    let embedUrl = fileUrl;
                    if (fileUrl.includes('watch?v=')) {
                        embedUrl = fileUrl.replace('watch?v=', 'embed/');
                    } else if (fileUrl.includes('youtu.be/')) {
                        embedUrl = fileUrl.replace('youtu.be/', 'youtube.com/embed/');
                    }
                    return (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                title="Video Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )
                }

                return (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                        {fileUrl ? (
                            <video
                                controls
                                className="w-full h-full"
                                src={fileUrl}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <p className="text-white">Video content not available.</p>
                        )}
                    </div>
                )
            case 'pdf':
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

            case 'text':
                return (
                    <div className="prose max-w-none p-8 bg-white rounded-xl border shadow-sm min-h-[400px] whitespace-pre-wrap">
                        {lesson.content}
                    </div>
                )
            case 'live_class':
                return (
                    <div className="p-12 text-center bg-purple-50 rounded-xl border border-purple-100">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Video size={40} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-2xl text-purple-900 mb-2">Live Google Meet</h3>
                        <p className="text-purple-700 mb-8 max-w-lg mx-auto">
                            This lesson is a scheduled live session. Students can join using the link below at the scheduled time.
                        </p>

                        <div className="flex justify-center gap-8 mb-8 text-sm font-medium">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar size={18} className="text-purple-500" />
                                <span>{lesson.start_time && new Date(lesson.start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock size={18} className="text-purple-500" />
                                <span>{lesson.start_time && new Date(lesson.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        {lesson.meeting_link && (
                            <Button onClick={() => window.open(lesson.meeting_link, '_blank')} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                                <Video size={18} />
                                Launch Meeting
                            </Button>
                        )}
                    </div>
                )
            default:
                return <p className="text-center p-8 bg-slate-50 rounded-lg">Preview not available for this content type.</p>
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/tutor/courses/${courseId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
                        <p className="text-sm text-slate-500">Lesson Preview Mode</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-1 rounded-2xl">
                {renderContent()}
            </div>
        </div>
    )
}
