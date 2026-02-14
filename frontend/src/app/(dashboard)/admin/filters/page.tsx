"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, AlertCircle, Plus, Edit2 } from "lucide-react"
import api from "@/lib/api"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface CourseOptions {
    subjects: string[]
    years: string[]
    types_of_school: string[]
}

type FilterType = 'subject' | 'year' | 'type_of_school'

export default function ManageFiltersPage() {
    const [options, setOptions] = useState<CourseOptions>({
        subjects: [],
        years: [],
        types_of_school: []
    })
    const [loading, setLoading] = useState(true)

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<{ type: FilterType; value: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Add state
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [addType, setAddType] = useState<FilterType>('subject')
    const [addValue, setAddValue] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    // Edit state
    const [editTarget, setEditTarget] = useState<{ type: FilterType; value: string } | null>(null)
    const [editValue, setEditValue] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        fetchOptions()
    }, [])

    const fetchOptions = async () => {
        try {
            const { data } = await api.get('/course-options')
            setOptions(data)
        } catch (error) {
            console.error("Error fetching options:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!addValue.trim()) return

        setIsAdding(true)
        try {
            await api.post('/course-options', {
                type: addType,
                value: addValue.trim()
            })
            await fetchOptions()
            setShowAddDialog(false)
            setAddValue('')
        } catch (error) {
            console.error("Error adding option:", error)
        } finally {
            setIsAdding(false)
        }
    }

    const handleEdit = async () => {
        if (!editTarget || !editValue.trim()) return

        setIsEditing(true)
        try {
            await api.put('/course-options', {
                type: editTarget.type,
                old_value: editTarget.value,
                new_value: editValue.trim()
            })
            await fetchOptions()
            setEditTarget(null)
            setEditValue('')
        } catch (error) {
            console.error("Error editing option:", error)
        } finally {
            setIsEditing(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return

        setIsDeleting(true)
        try {
            await api.delete('/course-options', {
                data: {
                    type: deleteTarget.type,
                    value: deleteTarget.value
                }
            })
            await fetchOptions()
            setDeleteTarget(null)
        } catch (error) {
            console.error("Error deleting option:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    const FilterSection = ({ title, items = [], type }: { title: string; items?: string[]; type: FilterType }) => (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <Button
                    size="sm"
                    onClick={() => {
                        setAddType(type)
                        setShowAddDialog(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>
            {!items || items.length === 0 ? (
                <p className="text-sm text-slate-500">No options available</p>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                            <span className="text-sm font-medium text-slate-700">{item}</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setEditTarget({ type, value: item })
                                        setEditValue(item)
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteTarget({ type, value: item })}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Manage Filter Options</h1>
                <p className="text-slate-500">
                    Add, edit, or remove subjects, years, and school types
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Important</p>
                    <p>Editing or deleting a filter option will update or remove it from all courses that use it.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6">
                    <FilterSection title="Subjects" items={options.subjects} type="subject" />
                </Card>
                <Card className="p-6">
                    <FilterSection title="Years" items={options.years} type="year" />
                </Card>
                <Card className="p-6">
                    <FilterSection title="School Types" items={options.types_of_school} type="type_of_school" />
                </Card>
            </div>

            {/* Add Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Option</DialogTitle>
                        <DialogDescription>
                            Add a new {addType === 'subject' ? 'subject' : addType === 'year' ? 'year' : 'school type'} option
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Value</label>
                            <Input
                                placeholder={`e.g., ${addType === 'subject' ? 'Astronomy' : addType === 'year' ? 'Year 14' : 'College'}`}
                                value={addValue}
                                onChange={(e) => setAddValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isAdding}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={isAdding || !addValue.trim()}>
                            {isAdding ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Option</DialogTitle>
                        <DialogDescription>
                            Rename "{editTarget?.value}". This will update all courses using this option.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Value</label>
                            <Input
                                placeholder="Enter new value"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)} disabled={isEditing}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit} disabled={isEditing || !editValue.trim()}>
                            {isEditing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to delete "<strong>{deleteTarget?.value}</strong>"?
                            This will remove it from all courses that currently use this option. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Yes, Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
