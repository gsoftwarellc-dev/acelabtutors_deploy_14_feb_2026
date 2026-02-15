"use client"

import { useState, useEffect, Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, MapPin, BookOpen, Clock, Star, Filter, ChevronDown, ChevronUp, ShoppingCart, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/context/cart-context"

const SCHOOL_TYPES = ["Primary", "Secondary", "College", "University"]
const YEARS = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"]
const SUBJECTS = ["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology", "History", "Geography", "Computer Science"]

function CoursesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { addItem, isInCart, setIsCartOpen } = useCart()

    // Filter States
    const [selectedSchools, setSelectedSchools] = useState<string[]>([])
    const [selectedYears, setSelectedYears] = useState<string[]>([])
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    // Sync from URL on load
    useEffect(() => {
        const schools = searchParams.get('school_type')?.split(',') || []
        const years = searchParams.get('year')?.split(',') || []
        const subjects = searchParams.get('subject')?.split(',') || []

        if (schools.length && schools[0] !== "") setSelectedSchools(schools)
        if (years.length && years[0] !== "") setSelectedYears(years)
        if (subjects.length && subjects[0] !== "") setSelectedSubjects(subjects)
    }, [searchParams])

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

    // Fetch Courses
    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (selectedSchools.length) params.append('school_type', selectedSchools.join(','))
                if (selectedYears.length) params.append('year', selectedYears.join(','))
                if (selectedSubjects.length) params.append('subject', selectedSubjects.join(','))

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/api/public/courses?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    setCourses(data.data) // Assuming paginated response
                }
            } catch (error) {
                console.error("Failed to fetch courses", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [selectedSchools, selectedYears, selectedSubjects])

    // Update URL when filters change
    const updateFilters = (type: 'school' | 'year' | 'subject', value: string) => {
        let newSelection = []
        if (type === 'school') {
            newSelection = selectedSchools.includes(value)
                ? selectedSchools.filter(items => items !== value)
                : [...selectedSchools, value]
            setSelectedSchools(newSelection)
        } else if (type === 'year') {
            newSelection = selectedYears.includes(value)
                ? selectedYears.filter(items => items !== value)
                : [...selectedYears, value]
            setSelectedYears(newSelection)
        } else if (type === 'subject') {
            newSelection = selectedSubjects.includes(value)
                ? selectedSubjects.filter(items => items !== value)
                : [...selectedSubjects, value]
            setSelectedSubjects(newSelection)
        }

        // Sync to URL
        // Note: Actual URL sync logic is ideally done via useEffect dependent on state, 
        // asking router to push only when state settles or debounced. 
        // For simplicity, we are fetching based on state, but let's push to URL too.
    }

    // Effect to push URL updates
    useEffect(() => {
        const params = new URLSearchParams()
        if (selectedSchools.length) params.set('school_type', selectedSchools.join(','))
        if (selectedYears.length) params.set('year', selectedYears.join(','))
        if (selectedSubjects.length) params.set('subject', selectedSubjects.join(','))

        router.push(`/courses?${params.toString()}`, { scroll: false })
    }, [selectedSchools, selectedYears, selectedSubjects, router])


    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 shrink-0 space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Filter size={18} /> Filters
                            </h3>

                            {/* School Type */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Type of School</h4>
                                <div className="space-y-2">
                                    {filterOptions.types_of_school.map((type: string) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`school-${type}`}
                                                checked={selectedSchools.includes(type)}
                                                onCheckedChange={() => updateFilters('school', type)}
                                            />
                                            <Label htmlFor={`school-${type}`} className="text-sm font-normal text-slate-600 cursor-pointer">{type}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Year */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Year Group</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {filterOptions.years.map(year => (
                                        <div key={year} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`year-${year}`}
                                                checked={selectedYears.includes(year)}
                                                onCheckedChange={() => updateFilters('year', year)}
                                            />
                                            <Label htmlFor={`year-${year}`} className="text-sm font-normal text-slate-600 cursor-pointer">{year}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-sm text-slate-700 mb-3">Subjects</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {filterOptions.subjects.map(subject => (
                                        <div key={subject} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`subject-${subject}`}
                                                checked={selectedSubjects.includes(subject)}
                                                onCheckedChange={() => updateFilters('subject', subject)}
                                            />
                                            <Label htmlFor={`subject-${subject}`} className="text-sm font-normal text-slate-600 cursor-pointer">{subject}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
                            <p className="text-slate-500 mt-1">Found {courses.length} courses matching your criteria</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900">No courses found</h3>
                                <p className="text-slate-500">Try adjusting your filters to see more results.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSelectedSchools([])
                                        setSelectedYears([])
                                        setSelectedSubjects([])
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <div key={course.id} className="block h-full cursor-default">
                                        <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
                                            {/* Colorful Top Accent */}
                                            <div className={`h-1.5 w-full bg-gradient-to-r ${['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-yellow-500', 'from-emerald-500 to-teal-500'][course.id % 4]
                                                }`} />

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-start justify-between mb-4 gap-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(course.subject || "General").split(',').map((sub: string, idx: number) => (
                                                            <span key={idx} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${['bg-blue-50 text-blue-700', 'bg-purple-50 text-purple-700', 'bg-orange-50 text-orange-700', 'bg-emerald-50 text-emerald-700'][(course.id + idx) % 4]
                                                                }`}>
                                                                {sub.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <div className="text-lg font-bold text-slate-900 leading-none">
                                                            {(Number(course.price || 0) + Number(course.registration_fee || 0)) > 0 ? (
                                                                <>
                                                                    £{(Number(course.price || 0) + Number(course.registration_fee || 0)).toFixed(2)}
                                                                    {Number(course.registration_fee) > 0 && (
                                                                        <span className="block text-[8px] text-slate-400 font-medium">Includes £{Number(course.registration_fee).toFixed(2)} Reg. Fee</span>
                                                                    )}
                                                                </>
                                                            ) : 'Free'}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                                                            <Star size={10} fill="currentColor" />
                                                            <span>4.9</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2">
                                                    {course.name}
                                                </h3>

                                                <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                                                    {course.description}
                                                </p>

                                                <div className="flex items-center gap-2 mb-6 text-xs font-medium text-slate-500">
                                                    {course.type_of_school && (
                                                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                            <MapPin size={12} />
                                                            {course.type_of_school}
                                                        </span>
                                                    )}
                                                    {course.year && (
                                                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                            <Clock size={12} />
                                                            {course.year}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-auto">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500'][course.id % 4]
                                                            }`}>
                                                            {course.tutor?.name?.charAt(0) || "T"}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900 leading-none">
                                                                {course.tutor?.name || "Tutor"}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
                                                                Instructor
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                if (isInCart(course.id)) {
                                                                    setIsCartOpen(true)
                                                                } else {
                                                                    addItem({
                                                                        id: course.id,
                                                                        name: course.name,
                                                                        price: Number(course.price) || 0,
                                                                        registrationFee: Number(course.registration_fee) || 0,
                                                                        tutorName: course.tutor?.name || "Tutor",
                                                                    })
                                                                }
                                                            }}
                                                            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all hover:shadow-md hover:scale-105 flex items-center gap-2 ${isInCart(course.id)
                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-600'
                                                                }`}
                                                        >
                                                            {isInCart(course.id) ? (
                                                                <>
                                                                    <Check size={14} /> In Cart
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShoppingCart size={14} /> Add
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <footer className="py-8 border-t bg-slate-50">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Acelab Tutors. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

export default function CoursesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CoursesContent />
        </Suspense>
    )
}
