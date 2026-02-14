"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"

import { CustomSelect } from "@/components/ui/custom-select"

export default function CreateCoursePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error('Failed to create course')

            const course = await response.json()
            router.push(`/tutor/courses/${course.id}`)
        } catch (error) {
            console.error("Error creating course:", error)
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/tutor/courses">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Course</h1>
                    <p className="text-slate-500">Start building your next curriculum</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700">Course Name</label>
                        <Input
                            id="name"
                            placeholder="e.g. Advanced Calculus"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Subject</label>
                            <CustomSelect
                                options={filterOptions.subjects}
                                value={formData.subject}
                                onChange={(value) => setFormData({ ...formData, subject: value })}
                                placeholder="Select subject"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Type of School</label>
                            <CustomSelect
                                options={filterOptions.types_of_school}
                                value={formData.type_of_school}
                                onChange={(value) => setFormData({ ...formData, type_of_school: value })}
                                placeholder="Select type"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Year</label>
                            <CustomSelect
                                options={filterOptions.years}
                                value={formData.year}
                                onChange={(value) => setFormData({ ...formData, year: value })}
                                placeholder="Select year"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
                        <Textarea
                            id="description"
                            placeholder="Briefly describe what students will learn..."
                            className="h-32"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <p className="text-xs text-slate-400">Write a short and clear description to attract students.</p>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Link href="/tutor/courses">
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Course"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
