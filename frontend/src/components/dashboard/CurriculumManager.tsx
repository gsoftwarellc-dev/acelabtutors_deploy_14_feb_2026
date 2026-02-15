"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Plus, Video, FileText, Type, MoreVertical, Trash, GripVertical,
    Calendar, Clock, Youtube, ExternalLink, X, Check, File, Edit, Pencil,
    ChevronRight, ArrowLeft
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { cn } from "@/lib/utils"

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
    status?: 'scheduled' | 'completed' | 'cancelled'
}

interface Chapter {
    id: number
    title: string
    lessons: Lesson[]
}

type LessonCreationStep = 'title' | 'type' | 'details'

export default function CurriculumManager({ courseId }: { courseId: string }) {
    const router = useRouter()
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [loading, setLoading] = useState(true)

    // Chapter Modal State (now inline)
    const [showChapterModal, setShowChapterModal] = useState(false)
    const [chapterTitle, setChapterTitle] = useState("")

    // Inline Lesson Creation State
    const [activeChapterId, setActiveChapterId] = useState<number | null>(null)
    const [lessonCreationStep, setLessonCreationStep] = useState<LessonCreationStep>('title')
    const [lessonType, setLessonType] = useState<'video' | 'pdf' | 'text' | 'live_class'>('video')

    // Editing State
    const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
    const [editTitle, setEditTitle] = useState("")

    // Lesson Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [editLessonData, setEditLessonData] = useState({
        title: "",
        content: "",
        is_free: false,
        file: null as File | null,
    })

    // Delete Confirmation State
    const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'chapter' | 'lesson', title?: string, chapterId?: number } | null>(null)



    // Lesson Form Data
    const [lessonData, setLessonData] = useState({
        title: "",
        content: "", // YouTube URL or Text Body
        file: null as File | null,
        is_free: false,
        // Live Class fields
        date: "",
        time: "",
        duration: "60",
        meeting_link: ""
    })



    const fetchCurriculum = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/courses/${courseId}/curriculum`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setChapters(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCurriculum()
    }, [courseId])

    const handleCreateChapter = async () => {
        if (!chapterTitle) return
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/courses/${courseId}/chapters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: chapterTitle })
            })
            if (res.ok) {
                setChapterTitle("")
                setShowChapterModal(false)
                fetchCurriculum()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const startEditChapter = (chapter: Chapter) => {
        setEditingChapterId(chapter.id)
        setEditTitle(chapter.title)
    }

    const handleUpdateChapter = async (chapterId: number) => {
        if (!editTitle.trim()) return
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/chapters/${chapterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: editTitle })
            })

            if (res.ok) {
                setEditingChapterId(null)
                setEditTitle("")
                fetchCurriculum()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const startEditLesson = (lesson: Lesson) => {
        setEditingLesson(lesson)
        setEditLessonData({
            title: lesson.title,
            content: lesson.content || "",
            is_free: lesson.is_free,
            file: null,
        })
        setEditModalOpen(true)
    }

    const handleUpdateLesson = async () => {
        if (!editingLesson || !editLessonData.title.trim()) return
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const formData = new FormData()
            formData.append('title', editLessonData.title)
            formData.append('type', editingLesson.type)
            formData.append('is_free', editLessonData.is_free ? '1' : '0')

            if (editingLesson.type === 'video') {
                formData.append('content', editLessonData.content)
                if (editLessonData.file) {
                    formData.append('file', editLessonData.file)
                }
            } else if (editingLesson.type === 'text') {
                formData.append('content', editLessonData.content)
            } else if (editingLesson.type === 'pdf' && editLessonData.file) {
                formData.append('file', editLessonData.file)
            }

            // Use POST with _method=PUT for FormData
            formData.append('_method', 'PUT')

            const res = await fetch(`${apiUrl}/api/lessons/${editingLesson.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (res.ok) {
                setEditModalOpen(false)
                setEditingLesson(null)
                fetchCurriculum()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const startAddLesson = (chapterId: number) => {
        setActiveChapterId(chapterId)
        setLessonCreationStep('title') // Start at title step
        setLessonType('video') // Default to video, but user will choose
        setLessonData({
            title: "", content: "", file: null, is_free: false,
            date: "", time: "", duration: "60", meeting_link: ""
        })
    }

    const cancelAddLesson = () => {
        setActiveChapterId(null)
        setLessonCreationStep('title')
    }

    const goToTypeSelection = () => {
        if (!lessonData.title.trim()) return
        setLessonCreationStep('type')
    }

    const goToDetails = (type: 'video' | 'pdf' | 'text' | 'live_class') => {
        setLessonType(type)
        setLessonCreationStep('details')
    }

    const goBack = () => {
        if (lessonCreationStep === 'details') setLessonCreationStep('type')
        else if (lessonCreationStep === 'type') setLessonCreationStep('title')
    }

    const handleAddLesson = async () => {
        if (!activeChapterId || !lessonData.title) return

        const formData = new FormData()
        formData.append('title', lessonData.title)
        formData.append('type', lessonType)
        formData.append('is_free', lessonData.is_free ? '1' : '0')

        if (lessonType === 'video') {
            formData.append('content', lessonData.content)
            if (lessonData.file) {
                formData.append('file', lessonData.file)
            }
        } else if (lessonType === 'text') {
            formData.append('content', lessonData.content)
        } else if (lessonType === 'pdf' && lessonData.file) {
            formData.append('file', lessonData.file)
        } else if (lessonType === 'live_class') {
            // For scheduled meetings, add date/time
            const startDateTime = `${lessonData.date}T${lessonData.time}:00`
            formData.append('start_time', startDateTime)
            formData.append('duration', lessonData.duration)
            formData.append('meeting_link', lessonData.meeting_link)
        }

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/chapters/${activeChapterId}/lessons`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Failed to create lesson' }))
                alert(`Error: ${errorData.message || 'Failed to create lesson'}`)
                return
            }

            const createdLesson = await res.json()

            // If it's a live class and Google is connected, create real Google Meet link
            // REMOVED GOOGLE MEET AUTO GENERATION


            setActiveChapterId(null)
            fetchCurriculum()
        } catch (error) {
            console.error('Error creating lesson:', error)
            alert('Failed to create lesson. Please check your connection and try again.')
        }
    }



    const confirmDeleteLesson = (lessonId: number, chapterId: number) => {
        setItemToDelete({ id: lessonId, type: 'lesson', chapterId })
    }

    const confirmDeleteChapter = (chapterId: number, title: string) => {
        setItemToDelete({ id: chapterId, type: 'chapter', title })
    }

    const handleDeleteItem = async () => {
        if (!itemToDelete) return

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            let endpoint = ''
            if (itemToDelete.type === 'lesson') {
                endpoint = `${apiUrl}/api/lessons/${itemToDelete.id}`
            } else {
                endpoint = `${apiUrl}/api/chapters/${itemToDelete.id}`
            }

            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                fetchCurriculum()
            } else {
                console.error("Failed to delete item")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setItemToDelete(null)
        }
    }

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return <Youtube size={16} className="text-red-500" />
            case 'pdf': return <FileText size={16} className="text-orange-500" />
            case 'text': return <Type size={16} className="text-blue-500" />
            case 'live_class': return <Video size={16} className="text-purple-500" />
            default: return <FileText size={16} />
        }
    }



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Course Curriculum</h2>
                <div className="flex items-center gap-2">
                    {showChapterModal ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300">
                            <Input
                                placeholder="Chapter Title"
                                value={chapterTitle}
                                onChange={e => setChapterTitle(e.target.value)}
                                className="w-64"
                                autoFocus
                            />
                            <Button size="sm" onClick={handleCreateChapter}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowChapterModal(false)}><X size={16} /></Button>
                        </div>
                    ) : (
                        <Button onClick={() => setShowChapterModal(true)}>
                            <Plus size={16} className="mr-2" /> Add Chapter
                        </Button>
                    )}
                </div>
            </div>

            {loading ? <p>Loading curriculum...</p> : (
                <div className="space-y-4">
                    {chapters.length === 0 && !showChapterModal && (
                        <div className="text-center py-10 border-2 border-dashed rounded-xl ">
                            <p className="text-muted-foreground mb-4">No content yet. Start by adding a chapter!</p>
                            <Button variant="outline" onClick={() => setShowChapterModal(true)}>Create First Chapter</Button>
                        </div>
                    )}

                    {chapters.map(chapter => (
                        <div key={chapter.id} className="border rounded-xl bg-card overflow-hidden">
                            <div className="bg-muted/50 p-4 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3 w-full">
                                    <GripVertical className="text-muted-foreground cursor-grab" size={20} />
                                    {editingChapterId === chapter.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <Input
                                                value={editTitle}
                                                onChange={e => setEditTitle(e.target.value)}
                                                className="h-8 w-64"
                                                autoFocus
                                            />
                                            <Button size="sm" onClick={() => handleUpdateChapter(chapter.id)}><Check size={14} /></Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingChapterId(null)}><X size={14} /></Button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-semibold">{chapter.title}</h3>
                                            <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full bg-white">
                                                {chapter.lessons.length} Lessons
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all hover:shadow-md"
                                        onClick={() => startAddLesson(chapter.id)}
                                    >
                                        <Plus size={16} /> New Lesson
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost"><MoreVertical size={16} /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => startEditChapter(chapter)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => confirmDeleteChapter(chapter.id, chapter.title)}>
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="divide-y relative">
                                {chapter.lessons.map(lesson => (
                                    <div
                                        key={lesson.id}
                                        className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors duration-200"
                                        onClick={() => router.push(`/tutor/courses/${courseId}/lessons/${lesson.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-white transition-colors">
                                                {getLessonIcon(lesson.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">{lesson.title}</p>
                                                    {lesson.is_free && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Free</Badge>}
                                                    {lesson.type === 'live_class' && (
                                                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-purple-100 text-purple-700">Live</Badge>
                                                    )}
                                                </div>

                                                {/* Live Class Specific Details */}
                                                {lesson.type === 'live_class' && lesson.start_time && (
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(lesson.start_time).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(lesson.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                                {lesson.type !== 'live_class' && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{lesson.type} Lesson</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {lesson.type === 'live_class' && (
                                                <div className="flex items-center gap-2">
                                                    {lesson.meeting_link && lesson.meeting_link.includes('google.com') && !lesson.meeting_link.includes('random') ? (
                                                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                            Hosted by you
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                                                            Mock Link
                                                        </Badge>
                                                    )}

                                                    {lesson.meeting_link && (
                                                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                                                            onClick={() => window.open(lesson.meeting_link, '_blank')}>
                                                            <ExternalLink size={12} /> Join
                                                        </Button>
                                                    )}


                                                </div>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical size={16} /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/tutor/courses/${courseId}/lessons/${lesson.id}`)}>
                                                        <ExternalLink className="mr-2 h-4 w-4" /> Preview
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => startEditLesson(lesson)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => confirmDeleteLesson(lesson.id, chapter.id)}>
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}

                                {/* Inline Add Lesson Wizard */}
                                {activeChapterId === chapter.id && (
                                    <div className="p-4 bg-slate-50 border-t animate-in slide-in-from-top-2 duration-200">

                                        {/* Step Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                                {lessonCreationStep !== 'title' && (
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 -ml-1 mr-1" onClick={goBack}>
                                                        <ArrowLeft size={14} />
                                                    </Button>
                                                )}
                                                {lessonCreationStep === 'title' && "New Lesson"}
                                                {lessonCreationStep === 'type' && "Select Type"}
                                                {lessonCreationStep === 'details' && `New ${lessonType === 'live_class' ? 'Google Meet' : lessonType.toUpperCase() + ' Lesson'}`}
                                            </h4>
                                            <Button size="sm" variant="ghost" onClick={cancelAddLesson}><X size={16} /></Button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* STEP 1: TITLE */}
                                            {lessonCreationStep === 'title' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="mb-2 block">Lesson details</Label>
                                                        <Input
                                                            value={lessonData.title}
                                                            onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                                                            placeholder="Enter lesson name..."
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') goToTypeSelection()
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Button onClick={goToTypeSelection} disabled={!lessonData.title.trim()}>
                                                            Next <ChevronRight size={16} className="ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 2: CONTENT TYPE */}
                                            {lessonCreationStep === 'type' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div onClick={() => goToDetails('video')}
                                                        className="cursor-pointer border rounded-lg p-3 hover:bg-white hover:border-red-200 hover:shadow-md transition-all group flex items-start gap-3 bg-white/50">
                                                        <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                            <Youtube size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-sm">Video</h5>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Embed content from YouTube</p>
                                                        </div>
                                                    </div>

                                                    <div onClick={() => goToDetails('pdf')}
                                                        className="cursor-pointer border rounded-lg p-3 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group flex items-start gap-3 bg-white/50">
                                                        <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-sm">PDF File</h5>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Upload a document file</p>
                                                        </div>
                                                    </div>

                                                    <div onClick={() => goToDetails('text')}
                                                        className="cursor-pointer border rounded-lg p-3 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group flex items-start gap-3 bg-white/50">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                            <Type size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-sm">Article</h5>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Write text based content</p>
                                                        </div>
                                                    </div>

                                                    <div onClick={() => goToDetails('live_class')}
                                                        className="cursor-pointer border rounded-lg p-3 hover:bg-white hover:border-purple-200 hover:shadow-md transition-all group flex items-start gap-3 bg-white/50">
                                                        <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                            <Video size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-sm">Google Meet</h5>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Schedule a live session</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* STEP 3: DETAILS */}
                                            {lessonCreationStep === 'details' && (
                                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                                    {lessonType === 'video' && (
                                                        <div className="grid gap-4">
                                                            <div className="grid gap-2">
                                                                <Label>YouTube URL</Label>
                                                                <Input value={lessonData.content} onChange={e => setLessonData({ ...lessonData, content: e.target.value })} placeholder="https://..." autoFocus />
                                                            </div>
                                                            <div className="relative">
                                                                <div className="absolute inset-0 flex items-center">
                                                                    <span className="w-full border-t" />
                                                                </div>
                                                                <div className="relative flex justify-center text-xs uppercase">
                                                                    <span className="bg-background px-2 text-muted-foreground">Or Upload Video</span>
                                                                </div>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Video File (MP4, MOV)</Label>
                                                                <Input type="file" accept="video/mp4,video/quicktime,video/x-msvideo" onChange={e => setLessonData({ ...lessonData, file: e.target.files?.[0] || null })} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {lessonType === 'text' && (
                                                        <div className="grid gap-2">
                                                            <Label>Content</Label>
                                                            <Textarea value={lessonData.content} onChange={e => setLessonData({ ...lessonData, content: e.target.value })} placeholder="Lesson content..." rows={5} autoFocus />
                                                        </div>
                                                    )}

                                                    {lessonType === 'pdf' && (
                                                        <div className="grid gap-2">
                                                            <Label>PDF File</Label>
                                                            <Input type="file" accept=".pdf" onChange={e => setLessonData({ ...lessonData, file: e.target.files?.[0] || null })} />
                                                        </div>
                                                    )}

                                                    {/* Live Class Fields */}
                                                    {lessonType === 'live_class' && (
                                                        <div className="space-y-4">
                                                            <div className="grid gap-2">
                                                                <Label>Google Meet Link</Label>
                                                                <Input
                                                                    value={lessonData.meeting_link}
                                                                    onChange={e => setLessonData({ ...lessonData, meeting_link: e.target.value })}
                                                                    placeholder="https://meet.google.com/..."
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="grid gap-2">
                                                                    <Label>Date</Label>
                                                                    <Input type="date" value={lessonData.date} onChange={e => setLessonData({ ...lessonData, date: e.target.value })} />
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    <Label>Time (UK)</Label>

                                                                    <Input type="time" value={lessonData.time} onChange={e => setLessonData({ ...lessonData, time: e.target.value })} />
                                                                </div>
                                                                <div className="grid gap-2 col-span-2">
                                                                    <Label>Duration</Label>
                                                                    <Select value={lessonData.duration} onValueChange={v => setLessonData({ ...lessonData, duration: v })}>
                                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="30">30 Min</SelectItem>
                                                                            <SelectItem value="60">1 Hour</SelectItem>
                                                                            <SelectItem value="90">1.5 Hours</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2 border-t mt-4">
                                                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                                            <input type="checkbox" checked={lessonData.is_free} onChange={e => setLessonData({ ...lessonData, is_free: e.target.checked })} className="rounded border-gray-300" />
                                                            Free Preview
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={cancelAddLesson}>Cancel</Button>
                                                            <Button size="sm" onClick={handleAddLesson}>Add Lesson</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {itemToDelete?.type === 'chapter'
                                ? "This will permanently delete this chapter and all its lessons."
                                : "This will permanently delete this lesson."
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
                            Delete {itemToDelete?.type === 'chapter' ? 'Chapter' : 'Lesson'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Lesson Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={(open) => { if (!open) { setEditModalOpen(false); setEditingLesson(null); } }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Lesson</DialogTitle>
                    </DialogHeader>
                    {editingLesson && (
                        <div className="space-y-4 py-2">
                            {/* Title */}
                            <div className="grid gap-2">
                                <Label>Lesson Title</Label>
                                <Input
                                    value={editLessonData.title}
                                    onChange={e => setEditLessonData({ ...editLessonData, title: e.target.value })}
                                    placeholder="Enter lesson title"
                                    autoFocus
                                />
                            </div>

                            {/* Type-specific content */}
                            {editingLesson.type === 'video' && (
                                <div className="space-y-3">
                                    <div className="grid gap-2">
                                        <Label>YouTube URL</Label>
                                        <Input
                                            value={editLessonData.content}
                                            onChange={e => setEditLessonData({ ...editLessonData, content: e.target.value })}
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Or Upload New Video (MP4, MOV)</Label>
                                        <Input
                                            type="file"
                                            accept="video/mp4,video/quicktime,video/x-msvideo"
                                            onChange={e => setEditLessonData({ ...editLessonData, file: e.target.files?.[0] || null })}
                                        />
                                    </div>
                                </div>
                            )}

                            {editingLesson.type === 'text' && (
                                <div className="grid gap-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        value={editLessonData.content}
                                        onChange={e => setEditLessonData({ ...editLessonData, content: e.target.value })}
                                        placeholder="Lesson content..."
                                        rows={6}
                                    />
                                </div>
                            )}

                            {editingLesson.type === 'pdf' && (
                                <div className="grid gap-2">
                                    <Label>Upload New PDF</Label>
                                    {editingLesson.file_path && (
                                        <p className="text-xs text-muted-foreground">Current file: {editingLesson.file_path.split('/').pop()}</p>
                                    )}
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={e => setEditLessonData({ ...editLessonData, file: e.target.files?.[0] || null })}
                                    />
                                </div>
                            )}

                            {editingLesson.type === 'live_class' && (
                                <div className="grid gap-2">
                                    <Label>Meeting Link</Label>
                                    <Input
                                        value={editLessonData.content}
                                        onChange={e => setEditLessonData({ ...editLessonData, content: e.target.value })}
                                        placeholder="Google Meet link"
                                    />
                                </div>
                            )}

                            {/* Free Preview Toggle */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={editLessonData.is_free}
                                        onChange={e => setEditLessonData({ ...editLessonData, is_free: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    Free Preview
                                </label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setEditModalOpen(false); setEditingLesson(null); }}>Cancel</Button>
                        <Button onClick={handleUpdateLesson}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
