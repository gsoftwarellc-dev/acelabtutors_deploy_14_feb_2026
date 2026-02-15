"use client"

import { useState, useEffect } from "react"
import { BookOpen, Users, TrendingUp, ArrowRight, Loader2, MoreVertical, Trash2, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

export default function TutorCoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentFilter, setCurrentFilter] = useState("active")
    const [courseToDelete, setCourseToDelete] = useState<number | null>(null)

    useEffect(() => {
        fetchCourses()
    }, [currentFilter])

    const fetchCourses = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const query = currentFilter === 'trash' ? '?filter=trash' : ''
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/api/courses${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
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

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const isTrash = currentFilter === 'trash'
            const url = isTrash
                ? `${apiUrl}/api/courses/${courseToDelete}/force`
                : `${apiUrl}/api/courses/${courseToDelete}`

            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            // Refresh list by removing the deleted course locally
            setCourses(courses.filter(c => c.id !== courseToDelete))
            setCourseToDelete(null)
        } catch (error) {
            console.error("Failed to delete course", error)
        }
    }

    const handleRestoreCourse = async (courseId: number) => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            await fetch(`${apiUrl}/api/courses/${courseId}/restore`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            // Refresh list by removing the restored course from trash view
            setCourses(courses.filter(c => c.id !== courseId))
        } catch (error) {
            console.error("Failed to restore course", error)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Courses</h1>
                    <p className="text-slate-600">Manage your courses and view student enrollments</p>
                </div>
                {/* Only show Create button in Active view */}
                {currentFilter === 'active' && (
                    <Link href="/tutor/courses/new">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">
                            + Create a New Course
                        </Button>
                    </Link>
                )}
            </div>

            <Tabs defaultValue="active" value={currentFilter} onValueChange={setCurrentFilter} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="active">Active Courses</TabsTrigger>
                    <TabsTrigger value="trash">Trash</TabsTrigger>
                </TabsList>

                <TabsContent value={currentFilter} className="mt-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-slate-400" size={32} />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                {currentFilter === 'active' ? 'No active courses' : 'Trash is empty'}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {currentFilter === 'active' ? 'Create your first course to get started.' : 'Deleted courses will appear here.'}
                            </p>
                            {currentFilter === 'active' && (
                                <Link href="/tutor/courses/new">
                                    <Button variant="outline">+ Create Course</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map((course) => (
                                <div key={course.id} className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col relative">
                                    {/* Card Content Link - Disable link if in trash */}
                                    {currentFilter === 'active' ? (
                                        <Link href={`/tutor/courses/${course.id}`} className="flex-1">
                                            <div className="p-6 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors mb-1 pr-8">
                                                            {course.name}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10 mb-2">
                                                            {course.description}
                                                        </p>
                                                        {(course.type_of_school || course.year) && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                {course.type_of_school && (
                                                                    <span className="px-2 py-1 bg-slate-100 rounded-md font-medium">
                                                                        {course.type_of_school}
                                                                    </span>
                                                                )}
                                                                {course.year && (
                                                                    <span className="px-2 py-1 bg-slate-100 rounded-md font-medium">
                                                                        {course.year}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                                    <div className="flex items-center text-slate-600">
                                                        <Users size={16} className="mr-2" />
                                                        <span className="text-sm font-medium">{course.enrollments_count || 0} Students</span>
                                                    </div>
                                                    <div className={`px-3 py-1 bg-gradient-to-r ${course.status === 'published' ? 'from-green-500 to-emerald-600' : 'from-slate-400 to-slate-500'} text-white rounded-full text-xs font-bold uppercase`}>
                                                        {course.status || 'Draft'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="p-6 flex flex-col h-full opacity-75">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg mb-1 pr-8">
                                                        {course.name}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
                                                        {course.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                                <div className="text-xs font-medium text-red-500 uppercase bg-red-50 px-2 py-1 rounded">
                                                    Deleted
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Menu - Enabled for both Active and Trash */}
                                    <div className="absolute top-4 right-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {currentFilter === 'trash' && (
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRestoreCourse(course.id)
                                                        }}
                                                        className="text-slate-600 focus:text-slate-900"
                                                    >
                                                        <RotateCcw size={16} className="mr-2" />
                                                        Restore Course
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation() // Prevent navigation
                                                        setCourseToDelete(course.id)
                                                    }}
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                >
                                                    <Trash2 size={16} className="mr-2" />
                                                    {currentFilter === 'trash' ? 'Delete Forever' : 'Delete Course'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
