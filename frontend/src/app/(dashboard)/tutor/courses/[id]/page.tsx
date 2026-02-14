"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Users, FileText, MoreVertical, Check, EyeOff, Trash2, Edit2, Save, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CustomSelect } from "@/components/ui/custom-select"
import CurriculumManager from "@/components/dashboard/CurriculumManager"
import AttendanceView from "@/components/dashboard/AttendanceView"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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

export default function TutorCourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [activeTab, setActiveTab] = useState("curriculum")
    const [courseStatus, setCourseStatus] = useState<"published" | "hidden" | "draft" | "submitted">("published")
    const [course, setCourse] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])

    // Confirmation State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState<{ type: 'status' | 'delete', value?: "published" | "hidden" } | null>(null)

    // Editing State
    const [isEditingDetails, setIsEditingDetails] = useState(false)
    const [isSavingDetails, setIsSavingDetails] = useState(false)
    const [editedCourse, setEditedCourse] = useState({
        name: "",
        description: "",
        type_of_school: "",
        year: "",
        subject: ""
    })

    // Filter Options State
    const [filterOptions, setFilterOptions] = useState<{
        subjects: string[],
        years: string[],
        types_of_school: string[]
    }>({
        subjects: [],
        years: [],
        types_of_school: []
    })

    // Fetch Filter Options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/api/course-options`)
                if (res.ok) {
                    const data = await res.json()
                    setFilterOptions({
                        subjects: data.subjects || [],
                        years: data.years || [],
                        types_of_school: data.types_of_school || []
                    })
                }
            } catch (error) {
                console.error("Failed to fetch filter options", error)
            }
        }
        fetchOptions()
    }, [])

    // Fetch Course Details
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`http://localhost:8000/api/courses/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setCourse(data)
                    setCourseStatus(data.status || 'draft')
                    setEditedCourse({
                        name: data.name || "",
                        description: data.description || "",
                        type_of_school: data.type_of_school || "",
                        year: data.year || "",
                        subject: data.subject || ""
                    })
                }
            } catch (error) {
                console.error("Failed to fetch course", error)
            }
        }
        fetchCourse()
    }, [id])

    // Fetch Enrolled Students
    useEffect(() => {
        if (activeTab === 'students' && id) {
            const fetchStudents = async () => {
                try {
                    const token = localStorage.getItem('token')
                    const response = await fetch(`http://localhost:8000/api/courses/${id}/students`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    })
                    if (response.ok) {
                        const data = await response.json()
                        setStudents(data)
                    }
                } catch (error) {
                    console.error("Failed to fetch students", error)
                }
            }
            fetchStudents()
        }
    }, [activeTab, id])

    const initiateAction = (type: 'status' | 'delete', value?: "published" | "hidden") => {
        setPendingAction({ type, value })
        setIsConfirmOpen(true)
    }

    const handleConfirm = async () => {
        if (!pendingAction) return

        if (pendingAction.type === 'status' && pendingAction.value) {
            await updateStatus(pendingAction.value)
        } else if (pendingAction.type === 'delete') {
            await deleteCourse()
        }

        setIsConfirmOpen(false)
        setPendingAction(null)
    }

    const updateStatus = async (status: "published" | "hidden") => {
        // Optimistic update for immediate feedback, but will be corrected by API response
        // setCourseStatus(status) // REVERT: Don't optimistic update status as it might change to 'submitted'

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:8000/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status }),
            })

            if (res.ok) {
                const updatedCourse = await res.json()
                setCourseStatus(updatedCourse.status)
                setCourse((prev: any) => ({ ...prev, status: updatedCourse.status }))

                if (updatedCourse.status === 'submitted') {
                    alert("Course submitted for admin approval.")
                }
            }
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const deleteCourse = async () => {
        try {
            const token = localStorage.getItem('token')
            await fetch(`http://localhost:8000/api/courses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            })
            router.push('/tutor/courses')
        } catch (error) {
            console.error("Failed to delete course", error)
        }
    }

    const handleMessageStudent = (studentId: number) => {
        router.push('/tutor/messages')
    }

    const getConfirmationMessage = () => {
        if (pendingAction?.type === 'delete') {
            return "Are you sure you want to delete this course? This action cannot be undone."
        }
        if (pendingAction?.value === 'published') {
            return "Are you sure you want to publish this course? It will be visible on the marketplace."
        }
        return "Are you sure you want to hide this course? It will no longer be visible on the marketplace."
    }

    const handleSaveDetails = async () => {
        setIsSavingDetails(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:8000/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedCourse),
            })

            if (res.ok) {
                const updatedCourse = await res.json()
                setCourse(updatedCourse)
                setIsEditingDetails(false)
            } else {
                alert("Failed to update course details")
            }
        } catch (error) {
            console.error("Failed to save details", error)
        } finally {
            setIsSavingDetails(false)
        }
    }



    if (!course) {
        return <div className="p-8 text-center text-slate-500">Loading course details...</div>
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/tutor/courses">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Details</h1>
                    <p className="text-slate-500">Managing Course ID: {id}</p>
                </div>
            </div>

            {/* Course Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            {isEditingDetails ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            value={editedCourse.name}
                                            onChange={(e) => setEditedCourse({ ...editedCourse, name: e.target.value })}
                                            className="text-2xl font-bold text-slate-900 h-10"
                                            placeholder="Course Name"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleSaveDetails}
                                                disabled={isSavingDetails}
                                                className="bg-green-600 hover:bg-green-700 h-9"
                                            >
                                                {isSavingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setIsEditingDetails(false)
                                                    setEditedCourse({
                                                        name: course.name || "",
                                                        description: course.description || "",
                                                        type_of_school: course.type_of_school || "",
                                                        year: course.year || "",
                                                        subject: course.subject || ""
                                                    })
                                                }}
                                                className="h-9"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                    <Textarea
                                        value={editedCourse.description}
                                        onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
                                        className="text-slate-500 max-w-xl h-24"
                                        placeholder="Course Description"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">Subject</label>
                                            <CustomSelect
                                                options={filterOptions.subjects}
                                                value={editedCourse.subject}
                                                onChange={(val) => setEditedCourse({ ...editedCourse, subject: val })}
                                                placeholder="Subject"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">School Type</label>
                                            <CustomSelect
                                                options={filterOptions.types_of_school}
                                                value={editedCourse.type_of_school}
                                                onChange={(val) => setEditedCourse({ ...editedCourse, type_of_school: val })}
                                                placeholder="Type"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400">Year</label>
                                            <CustomSelect
                                                options={filterOptions.years}
                                                value={editedCourse.year}
                                                onChange={(val) => setEditedCourse({ ...editedCourse, year: val })}
                                                placeholder="Year"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-slate-900">{course.name}</h2>
                                        {courseStatus === 'published' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 text-xs font-bold rounded-full border uppercase bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                                                    <Check size={12} strokeWidth={3} />
                                                    Active & Approved
                                                </span>
                                            </div>
                                        ) : courseStatus === 'submitted' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 text-xs font-bold rounded-full border uppercase bg-yellow-100 text-yellow-700 border-yellow-200">
                                                    Waiting Approval
                                                </span>
                                                <Link href="/tutor/messages">
                                                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                                        Message Admin
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <span className="px-3 py-1 text-xs font-bold rounded-full border uppercase bg-slate-100 text-slate-600 border-slate-200">
                                                {courseStatus || 'DRAFT'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 max-w-xl">{course.description}</p>

                                    {(course.type_of_school || course.year || course.subject) && (
                                        <div className="flex items-center gap-3 mt-4">
                                            {course.subject && (
                                                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                                    <span className="font-semibold mr-1">Subject:</span> {course.subject}
                                                </div>
                                            )}
                                            {course.type_of_school && (
                                                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                                    <span className="font-semibold mr-1">School:</span> {course.type_of_school}
                                                </div>
                                            )}
                                            {course.year && (
                                                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                                    <span className="font-semibold mr-1">Year:</span> {course.year}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex items-center gap-6 mt-4 text-sm font-medium text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-slate-400" />
                                    <span>{course.enrollments_count || 0} Students Enrolled</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                                <MoreVertical size={20} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditingDetails(true)}>
                                <Edit2 size={16} className="mr-2" />
                                Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => initiateAction("status", "published")}>
                                <Check size={16} className="mr-2" />
                                Publish Course
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => initiateAction("status", "hidden")}>
                                <EyeOff size={16} className="mr-2" />
                                Hide from Marketplace
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => initiateAction("delete")} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash2 size={16} className="mr-2" />
                                Delete Course
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getConfirmationMessage()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} className={pendingAction?.type === 'delete' ? "bg-red-600 hover:bg-red-700" : ""}>
                            Yes, {pendingAction?.type === 'delete' ? 'Delete' : (pendingAction?.value === 'published' ? 'Publish' : 'Hide')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Main Content Tabs */}
            <Tabs defaultValue="curriculum" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-[450px] mb-8 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="curriculum" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Curriculum</TabsTrigger>
                    <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Students</TabsTrigger>
                    <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum" className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                        <CurriculumManager courseId={id} />
                    </div>
                </TabsContent>

                <TabsContent value="students">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">Enrolled Students</h3>
                        </div>

                        {students.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No students enrolled in this course yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <div key={student.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{student.name}</h4>
                                                <p className="text-sm text-slate-500">{student.email}</p>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="attendance">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Attendance Tracker</h3>
                        <AttendanceView courseId={parseInt(id)} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
