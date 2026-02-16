"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Check, Loader2, ChevronLeft } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface FormOption {
    id: number
    category: string
    group_name: string
    subjects: string[]
}

export default function RegisterFreePage() {
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [options, setOptions] = useState<FormOption[]>([])
    const [loadingOptions, setLoadingOptions] = useState(true)
    const [formData, setFormData] = useState({
        parentName: "",
        relationship: "",
        parentEmail: "",
        parentPhone: "",
        studentName: "",
        dob: "",
        studentEmail: "",
        requestedYear: "",
        selections: {} as Record<string, string[]>,
        specificNeeds: "",
        confirm: false
    })

    const [settings, setSettings] = useState({
        title: "",
        subtitle: "",
        alert_text: "",
        helper_text: ""
    })
    const [loadingSettings, setLoadingSettings] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoadingOptions(true)
            setLoadingSettings(true)
            try {
                const [optionsRes, settingsRes] = await Promise.all([
                    api.get('/registration-form-options?form_type=free'),
                    api.get('/registration-form-settings/free')
                ])
                setOptions(optionsRes.data)
                setSettings(settingsRes.data)
            } catch (error) {
                console.error("Failed to load data", error)
            } finally {
                setLoadingOptions(false)
                setLoadingSettings(false)
            }
        }
        fetchData()
    }, [])

    const handleCheckboxChange = (category: string, subject: string, checked: boolean) => {
        const currentSelections = formData.selections[category] || []

        let newSelections
        if (checked) {
            newSelections = [...currentSelections, subject]
        } else {
            newSelections = currentSelections.filter(s => s !== subject)
        }

        const updatedSelections = { ...formData.selections }
        if (newSelections.length > 0) {
            updatedSelections[category] = newSelections
        } else {
            delete updatedSelections[category]
        }

        setFormData({ ...formData, selections: updatedSelections })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.confirm) return

        setSubmitting(true)
        try {
            await api.post('/student-registrations', {
                type: 'free',
                parent_name: formData.parentName,
                relationship: formData.relationship,
                parent_email: formData.parentEmail,
                parent_phone: formData.parentPhone,
                student_name: formData.studentName,
                student_dob: formData.dob,
                student_email: formData.studentEmail,
                requested_year: formData.requestedYear,
                selections: formData.selections,
                specific_needs: formData.specificNeeds
            })
            setSubmitted(true)
        } catch (error) {
            console.error("Failed to submit registration", error)
            alert("Failed to submit registration. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col min-h-screen bg-white">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="text-blue-600 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Registration Received!</h1>
                        <p className="text-slate-600">Your registration has been submitted successfully. Our team will review your application and contact you shortly.</p>
                        <Link href="/">
                            <Button className="w-full bg-[#ef4444] hover:bg-[#dc2626]">
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                </main>
            </div>
        )
    }
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-1 py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="mb-8 flex justify-start">
                        <Link href="/register-free" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-medium transition-colors">
                            <ChevronLeft size={14} /> Back
                        </Link>
                    </div>

                    <div className="text-center mb-12">
                        {loadingSettings ? (
                            <div className="h-10 w-48 bg-slate-100 animate-pulse mx-auto rounded" />
                        ) : (
                            <>
                                <div className="flex flex-col items-center justify-center space-y-2 mb-6">
                                    {settings.title && <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{settings.title}</h1>}
                                    {settings.subtitle && <h2 className="text-xl font-bold text-slate-700">{settings.subtitle}</h2>}
                                    {settings.alert_text && <p className="text-xs font-black text-red-500 uppercase tracking-widest pt-2">{settings.alert_text}</p>}
                                </div>
                                <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">{settings.helper_text || "Please complete the form below to register your student."}</p>
                            </>
                        )}
                    </div>

                    <form className="space-y-12" onSubmit={handleSubmit}>
                        <p className="text-[#ef4444] text-xs font-medium italic">* Required fields</p>

                        {/* Parent/Guardian Section */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Parent/Guardian</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="parentName" className="text-xs font-bold text-slate-700">Parent/Guardian Name *</Label>
                                    <Input
                                        id="parentName"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        required
                                        value={formData.parentName}
                                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="relationship" className="text-xs font-bold text-slate-700">Relationship to student</Label>
                                    <Input
                                        id="relationship"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        value={formData.relationship}
                                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parentEmail" className="text-xs font-bold text-slate-700">Parent/Guardian Email *</Label>
                                    <Input
                                        id="parentEmail"
                                        type="email"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        required
                                        value={formData.parentEmail}
                                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parentPhone" className="text-xs font-bold text-slate-700">Parent/Guardian Phone Number *</Label>
                                    <Input
                                        id="parentPhone"
                                        type="tel"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        required
                                        value={formData.parentPhone}
                                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Student Section */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Student</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="studentName" className="text-xs font-bold text-slate-700">Student Name *</Label>
                                    <Input
                                        id="studentName"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        required
                                        value={formData.studentName}
                                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-xs font-bold text-slate-700">Student Date of Birth *</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        required
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="studentEmail" className="text-xs font-bold text-slate-700">Student Email</Label>
                                    <Input
                                        id="studentEmail"
                                        type="email"
                                        className="border-slate-200 focus:border-red-500 focus:ring-red-500 h-10"
                                        value={formData.studentEmail}
                                        onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="requestedYear" className="text-xs font-bold text-slate-700">Preferred Course *</Label>
                                    <select
                                        id="requestedYear"
                                        className="w-full h-10 rounded-md border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 px-3 text-sm bg-white"
                                        required
                                        value={formData.requestedYear}
                                        onChange={(e) => setFormData({ ...formData, requestedYear: e.target.value })}
                                    >
                                        <option value="">Select a course</option>
                                        <option value="YEAR 8">Year 8</option>
                                        <option value="YEAR 9">Year 9</option>
                                        <option value="YEAR 10">Year 10</option>
                                        <option value="YEAR 11">Year 11</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Class & Subject Selection Section */}
                        <section className="space-y-8">
                            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Class & Subject Selection (Saturdays Only) *</h2>

                            {loadingOptions ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                                    <p className="text-xs text-slate-400 mt-2">Loading options...</p>
                                </div>
                            ) : options.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No subject options available at the moment. Please check back later.</p>
                            ) : (
                                <div className="space-y-12">
                                    {/* Group by category */}
                                    {Array.from(new Set(options.map(o => o.category))).map(category => (
                                        <div key={category} className="space-y-6">
                                            <div className="space-y-1">
                                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{category}</h3>
                                                <p className="text-[10px] text-slate-500 italic">Winners Kingdom Children free classes are available for Maths and Sciences only.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {options.filter(o => o.category === category).map((option) => (
                                                    <div key={option.id} className="space-y-3">
                                                        <h4 className="text-[11px] font-bold text-slate-800 uppercase">{option.group_name}</h4>
                                                        <div className="space-y-2">
                                                            {option.subjects.map(subject => (
                                                                <div key={subject} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`opt-${option.id}-${subject}`}
                                                                        checked={formData.selections[option.group_name]?.includes(subject)}
                                                                        onCheckedChange={(checked) => handleCheckboxChange(option.group_name, subject, !!checked)}
                                                                    /><label htmlFor={`opt-${option.id}-${subject}`} className="text-xs font-medium text-slate-600">{subject}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Additional Information Section */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Additional Information</h2>
                            <div className="space-y-4">
                                <p className="text-[10px] text-slate-500 leading-relaxed">Does your child have any specific needs that our teachers may need to know about? If not, please write 'No' or leave the box blank. If yes, please specify in the box below:</p>
                                <div className="space-y-2">
                                    <Label htmlFor="specificNeeds" className="text-xs font-bold text-slate-700">Specific needs</Label>
                                    <textarea
                                        id="specificNeeds"
                                        className="w-full min-h-[120px] rounded-md border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 p-3 text-sm"
                                        value={formData.specificNeeds}
                                        onChange={(e) => setFormData({ ...formData, specificNeeds: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* Confirmation Section */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Confirmation</h2>
                            <div className="flex items-start space-x-3 bg-slate-50 p-6 rounded-lg">
                                <Checkbox
                                    id="confirm"
                                    className="mt-1"
                                    required
                                    checked={formData.confirm}
                                    onCheckedChange={(checked) => setFormData({ ...formData, confirm: !!checked })}
                                />
                                <Label htmlFor="confirm" className="text-xs font-medium text-slate-700 leading-relaxed">
                                    I confirm the information is correct. *
                                </Label>
                            </div>
                        </section>

                        <div className="pt-8">
                            <Button
                                type="submit"
                                disabled={submitting || !formData.confirm}
                                className="w-full py-7 bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-sm tracking-wide rounded-lg uppercase"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Submit Registration
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            <footer className="py-8 border-t bg-white">
                <div className="container mx-auto px-4 text-center text-sm text-slate-400 font-medium">
                    © {new Date().getFullYear()} Acelab Tutors. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
