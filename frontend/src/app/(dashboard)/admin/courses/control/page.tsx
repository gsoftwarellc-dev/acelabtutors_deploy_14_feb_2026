"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Search, Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { PriceEditor } from "@/components/admin/PriceEditor"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Course {
    id: number
    name: string
    status: string
    is_platform_visible: boolean
    is_approved: boolean
    price: number
    registration_fee: number
    subject: string
    type_of_school: string
    year: string
    tutor: {
        id: number
        name: string
        email: string
    }
    updated_at: string
}

export default function CourseControlPage() {
    const [courses, setYear] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Create course state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [filterOptions, setFilterOptions] = useState<{
        subjects: string[],
        years: string[],
        types_of_school: string[]
    }>({ subjects: [], years: [], types_of_school: [] })
    const [newCourse, setNewCourse] = useState({
        name: "",
        price: 0,
        registration_fee: 0,
        type_of_school: "",
        year: "",
        subjects: [] as string[]
    })

    // Edit course state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editingCourse, setEditingCourse] = useState<{
        id: number,
        name: string,
        price: number,
        registration_fee: number,
        type_of_school: string,
        year: string,
        subjects: string[]
    } | null>(null)

    // Delete course state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState<number | null>(null)

    const fetchFilterOptions = async () => {
        try {
            const { data } = await api.get('/course-options')
            setFilterOptions(data)
        } catch (error) {
            console.error("Failed to fetch filter options", error)
        }
    }

    const fetchApprovedYear = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/courses/approved')
            setYear(data)
        } catch (error) {
            console.error("Failed to fetch courses", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApprovedYear()
        fetchFilterOptions()
    }, [])

    const handleCreateCourse = async () => {
        if (!newCourse.name) return
        setIsCreating(true)
        try {
            const payload = {
                ...newCourse,
                subject: newCourse.subjects.join(', ')
            }
            await api.post('/admin/courses', payload)
            await fetchApprovedYear()
            setIsCreateDialogOpen(false)
            setNewCourse({
                name: "",
                price: 0,
                registration_fee: 0,
                type_of_school: "",
                year: "",
                subjects: []
            })
        } catch (error) {
            console.error("Failed to create course", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleUpdateCourse = async () => {
        if (!editingCourse || !editingCourse.name) return
        setIsUpdating(true)
        try {
            const payload = {
                ...editingCourse,
                subject: editingCourse.subjects.join(', ')
            }
            await api.put(`/admin/courses/${editingCourse.id}`, payload)
            await fetchApprovedYear()
            setIsEditDialogOpen(false)
            setEditingCourse(null)
        } catch (error) {
            console.error("Failed to update course", error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return
        setIsDeleting(true)
        try {
            await api.delete(`/admin/courses/${courseToDelete}`)
            await fetchApprovedYear()
            setIsDeleteDialogOpen(false)
            setCourseToDelete(null)
        } catch (error) {
            console.error("Failed to delete course", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
        setActionLoading(id)
        try {
            const { data } = await api.put(`/admin/courses/${id}/visibility`)
            setYear(courses.map(course =>
                course.id === id
                    ? { ...course, is_platform_visible: data.is_platform_visible }
                    : course
            ))
        } catch (error) {
            console.error("Failed to toggle visibility", error)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredYear = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tutor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Control Year</h1>
                    <p className="text-slate-500">Manage platform visibility, edit details, or delete courses</p>
                </div>
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search courses or tutors..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                        {filteredYear.length} Approved Year
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Course Name</th>
                                <th className="px-6 py-4">Tutor</th>
                                <th className="px-6 py-4">Current Status</th>
                                <th className="px-6 py-4">Price & Fees</th>
                                <th className="px-6 py-4">Marketplace Visibility</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading courses...
                                    </td>
                                </tr>
                            ) : filteredYear.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No approved courses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredYear.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/tutor/courses/${course.id}`} target="_blank" className="group">
                                                <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors max-w-md break-words">{course.name}</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(course.subject || "General").split(',').map((sub, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-[10px] py-0">{sub.trim()}</Badge>
                                                    ))}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-1">ID: {course.id}</div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{course.tutor?.name || "N/A"}</div>
                                            <div className="text-xs text-slate-500">{course.tutor?.email || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.status === 'published' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    {course.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <PriceEditor
                                                courseId={course.id}
                                                initialPrice={course.price}
                                                initialRegistrationFee={course.registration_fee}
                                                onUpdate={(newPrice, newRegFee) => {
                                                    setYear(courses.map(c => c.id === course.id ? { ...c, price: newPrice, registration_fee: newRegFee } : c))
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={course.is_platform_visible}
                                                    onCheckedChange={() => handleToggleVisibility(course.id, course.is_platform_visible)}
                                                    disabled={actionLoading === course.id}
                                                />
                                                <span className={`text-xs font-medium ${course.is_platform_visible ? 'text-blue-600' : 'text-slate-500'}`}>
                                                    {course.is_platform_visible ? 'Visible' : 'Hidden'}
                                                </span>
                                                {actionLoading === course.id && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingCourse({
                                                            id: course.id,
                                                            name: course.name,
                                                            price: course.price,
                                                            registration_fee: course.registration_fee,
                                                            type_of_school: course.type_of_school || "",
                                                            year: course.year || "",
                                                            subjects: course.subject?.split(',').map(s => s.trim()) || []
                                                        })
                                                        setIsEditDialogOpen(true)
                                                    }}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCourseToDelete(course.id)
                                                        setIsDeleteDialogOpen(true)
                                                    }}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Course Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Course</DialogTitle>
                        <DialogDescription>
                            Enter details for the new course. It will be published immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Package / Course Name</Label>
                            <Textarea
                                id="name"
                                value={newCourse.name}
                                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                placeholder="e.g., Year 12 Intensive Package - Maths & Physics"
                                className="h-24"
                            />
                        </div>
                        <div className="grid gap-2 flex-row">
                            <div className="flex-1 grid gap-2">
                                <Label htmlFor="price">Price (£)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={newCourse.price}
                                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex-1 grid gap-2">
                                <Label htmlFor="registration_fee">Reg. Fee (£)</Label>
                                <Input
                                    id="registration_fee"
                                    type="number"
                                    value={newCourse.registration_fee}
                                    onChange={(e) => setNewCourse({ ...newCourse, registration_fee: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center mt-[-8px]">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Sale Price</span>
                            <span className="text-lg font-bold text-blue-600">£{(newCourse.price + newCourse.registration_fee).toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>School Type</Label>
                                <Select
                                    value={newCourse.type_of_school}
                                    onValueChange={(val) => setNewCourse({ ...newCourse, type_of_school: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.types_of_school.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Year Group</Label>
                                <Select
                                    value={newCourse.year}
                                    onValueChange={(val) => setNewCourse({ ...newCourse, year: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filterOptions.years.map((year) => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Included Subjects</Label>
                            <ScrollArea className="h-32 border border-slate-200 rounded-lg p-3">
                                <div className="grid grid-cols-2 gap-3">
                                    {filterOptions.subjects.map((sub) => (
                                        <div key={sub} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`sub-${sub}`}
                                                checked={newCourse.subjects.includes(sub)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setNewCourse({ ...newCourse, subjects: [...newCourse.subjects, sub] })
                                                    } else {
                                                        setNewCourse({ ...newCourse, subjects: newCourse.subjects.filter(s => s !== sub) })
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`sub-${sub}`} className="text-xs font-medium leading-none cursor-pointer">
                                                {sub}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCourse} disabled={isCreating || !newCourse.name} className="bg-blue-600 hover:bg-blue-700">
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Course Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Course</DialogTitle>
                        <DialogDescription>
                            Update course details. These changes will be reflected immediately on the marketplace.
                        </DialogDescription>
                    </DialogHeader>
                    {editingCourse && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Package / Course Name</Label>
                                <Textarea
                                    id="edit-name"
                                    value={editingCourse.name}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                    placeholder="e.g., Year 12 Intensive Package"
                                    className="h-24"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-price">Price (£)</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        value={editingCourse.price}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-reg-fee">Reg. Fee (£)</Label>
                                    <Input
                                        id="edit-reg-fee"
                                        type="number"
                                        value={editingCourse.registration_fee}
                                        onChange={(e) => setEditingCourse({ ...editingCourse, registration_fee: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center mt-[-8px]">
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Sale Price</span>
                                <span className="text-lg font-bold text-blue-600">£{(editingCourse.price + editingCourse.registration_fee).toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>School Type</Label>
                                    <Select
                                        value={editingCourse.type_of_school}
                                        onValueChange={(val) => setEditingCourse({ ...editingCourse, type_of_school: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.types_of_school.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Year Group</Label>
                                    <Select
                                        value={editingCourse.year}
                                        onValueChange={(val) => setEditingCourse({ ...editingCourse, year: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filterOptions.years.map((year) => (
                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Included Subjects</Label>
                                <ScrollArea className="h-32 border border-slate-200 rounded-lg p-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        {filterOptions.subjects.map((sub) => (
                                            <div key={sub} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`edit-sub-${sub}`}
                                                    checked={editingCourse.subjects.includes(sub)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setEditingCourse({ ...editingCourse, subjects: [...editingCourse.subjects, sub] })
                                                        } else {
                                                            setEditingCourse({ ...editingCourse, subjects: editingCourse.subjects.filter(s => s !== sub) })
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`edit-sub-${sub}`} className="text-xs font-medium leading-none cursor-pointer">
                                                    {sub}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateCourse} disabled={isUpdating || !editingCourse?.name} className="bg-blue-600 hover:bg-blue-700">
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course and all its associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourse}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete Course
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
