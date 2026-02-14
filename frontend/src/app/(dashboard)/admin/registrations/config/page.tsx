"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, Loader2, ChevronLeft, GripVertical } from "lucide-react"
import Link from "next/link"

interface FormOption {
    id?: number
    form_type: 'free' | 'paid'
    category: string
    group_name: string
    subjects: string[]
    sort_order: number
}

interface FormSettings {
    form_type: 'free' | 'paid'
    title: string
    subtitle: string
    alert_text: string
    helper_text: string
}

export default function RegistrationConfigPage() {
    const [options, setOptions] = useState<FormOption[]>([])
    const [settings, setSettings] = useState<Record<'free' | 'paid', FormSettings>>({
        free: { form_type: 'free', title: '', subtitle: '', alert_text: '', helper_text: '' },
        paid: { form_type: 'paid', title: '', subtitle: '', alert_text: '', helper_text: '' }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'free' | 'paid'>('paid')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [optionsRes, freeSettingsRes, paidSettingsRes] = await Promise.all([
                api.get('/admin/registration-form-options'),
                api.get('/registration-form-settings/free'),
                api.get('/registration-form-settings/paid')
            ])
            setOptions(optionsRes.data)
            setSettings({
                free: freeSettingsRes.data,
                paid: paidSettingsRes.data
            })
        } catch (error) {
            console.error('Failed to load data:', error)
            alert("Failed to load form configuration")
        } finally {
            setLoading(false)
        }
    }

    const handleAddGroup = (type: 'free' | 'paid') => {
        const newOption: FormOption = {
            form_type: type,
            category: 'NEW CATEGORY',
            group_name: 'Year X',
            subjects: [],
            sort_order: options.length
        }
        setOptions([...options, newOption])
    }

    const handleUpdateOption = (index: number, updates: Partial<FormOption>) => {
        const newOptions = [...options]
        newOptions[index] = { ...newOptions[index], ...updates }
        setOptions(newOptions)
    }

    const handleUpdateSettings = (type: 'free' | 'paid', updates: Partial<FormSettings>) => {
        setSettings(prev => ({
            ...prev,
            [type]: { ...prev[type], ...updates }
        }))
    }

    const handleDeleteOption = async (index: number) => {
        const option = options[index]
        if (option.id) {
            try {
                await api.delete(`/admin/registration-form-options/${option.id}`)
            } catch (error) {
                alert("Failed to delete option")
                return
            }
        }
        const newOptions = options.filter((_, i) => i !== index)
        setOptions(newOptions)
    }

    const handleAddSubject = (index: number) => {
        const newOptions = [...options]
        newOptions[index].subjects.push('')
        setOptions(newOptions)
    }

    const handleUpdateSubject = (optionIndex: number, subjectIndex: number, value: string) => {
        const newOptions = [...options]
        newOptions[optionIndex].subjects[subjectIndex] = value
        setOptions(newOptions)
    }

    const handleRemoveSubject = (optionIndex: number, subjectIndex: number) => {
        const newOptions = [...options]
        newOptions[optionIndex].subjects = newOptions[optionIndex].subjects.filter((_, i) => i !== subjectIndex)
        setOptions(newOptions)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Save settings locally to state first (already done), now push to API
            await api.post('/admin/registration-form-settings', settings.paid)
            await api.post('/admin/registration-form-settings', settings.free)

            // Save options
            for (const option of options) {
                if (option.id) {
                    await api.put(`/admin/registration-form-options/${option.id}`, option)
                } else {
                    await api.post('/admin/registration-form-options', option)
                }
            }
            alert("Configuration saved successfully")
            loadData()
        } catch (error) {
            console.error("Save failed", error)
            alert("Failed to save configuration")
        } finally {
            setSaving(false)
        }
    }

    const filteredOptions = options.filter(o => o.form_type === activeTab)
    const currentSettings = settings[activeTab]

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-12 border-b pb-6">
                <div className="space-y-1">
                    <Link href="/admin/registrations" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-medium transition-colors mb-2">
                        <ChevronLeft size={14} /> Back to Registrations
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Form Configuration</h1>
                    <p className="text-slate-500 text-sm">Edit the form content directly below. It includes headings, helper text, and options.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold rounded-lg transition-all">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Live Changes
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-12">
                <TabsList className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <TabsTrigger value="paid" className="px-6 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Paid Form</TabsTrigger>
                    <TabsTrigger value="free" className="px-6 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Free Form</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" />
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Page Header Settings */}
                            <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Main Title (H1)</Label>
                                        <Input
                                            value={currentSettings.title}
                                            onChange={(e) => handleUpdateSettings(activeTab, { title: e.target.value })}
                                            className="text-xl font-bold text-slate-900 border-slate-200 focus:border-red-500"
                                            placeholder="e.g. Acelab Tutors"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Subtitle (H2)</Label>
                                        <Input
                                            value={currentSettings.subtitle}
                                            onChange={(e) => handleUpdateSettings(activeTab, { subtitle: e.target.value })}
                                            className="text-lg font-bold text-slate-800 border-slate-200 focus:border-red-500"
                                            placeholder="e.g. Student Registration"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Alert / Badge Text (Optional)</Label>
                                        <Input
                                            value={currentSettings.alert_text || ''}
                                            onChange={(e) => handleUpdateSettings(activeTab, { alert_text: e.target.value })}
                                            className="text-xs font-black text-red-500 uppercase tracking-widest border-slate-200 focus:border-red-500"
                                            placeholder="e.g. Free Classes - SATURDAYS ONLY"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Helper / Intro Text</Label>
                                        <Input
                                            value={currentSettings.helper_text || ''}
                                            onChange={(e) => handleUpdateSettings(activeTab, { helper_text: e.target.value })}
                                            className="text-xs text-slate-500 italic border-slate-200 focus:border-red-500"
                                            placeholder="e.g. Please complete the form below..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Options */}
                            {filteredOptions.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                    <p className="text-slate-400 font-medium mb-4 text-sm">No sections configured yet.</p>
                                    <Button onClick={() => handleAddGroup(activeTab)} variant="outline" className="text-xs">
                                        <Plus className="w-3 h-3 mr-2" /> Add First Section
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {options.map((option, idx) => {
                                        if (option.form_type !== activeTab) return null
                                        return (
                                            <div key={idx} className="relative group border-l-2 border-transparent hover:border-slate-200 pl-6 transition-all -ml-6 pr-4 rounded-r-lg hover:bg-slate-50/50 py-4">
                                                {/* Tools - Visible on Hover */}
                                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-400 hover:text-red-600"
                                                        onClick={() => handleDeleteOption(idx)}
                                                        title="Remove this entire section"
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                    <div className="cursor-move text-slate-300 p-1">
                                                        <GripVertical size={12} />
                                                    </div>
                                                </div>

                                                {/* Section Title (Category) */}
                                                <div className="mb-6">
                                                    <Label className="text-[10px] text-slate-400 font-medium mb-1 block uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-5">Section Title</Label>
                                                    <Input
                                                        value={option.category}
                                                        onChange={(e) => handleUpdateOption(idx, { category: e.target.value })}
                                                        className="text-xs font-black text-slate-900 uppercase tracking-widest border-transparent hover:border-slate-300 shadow-none px-0 h-auto py-1 bg-transparent focus:ring-0 focus:border-slate-300 focus:bg-white rounded-sm w-full transition-all placeholder:text-slate-300"
                                                        placeholder="SECTION TITLE..."
                                                    />
                                                </div>

                                                {/* Subsection (Group Name) */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4 w-full">
                                                        <div>
                                                            <Label className="text-[10px] text-slate-400 font-medium mb-1 block uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-5">Subsection / Year Group</Label>
                                                            <Input
                                                                value={option.group_name}
                                                                onChange={(e) => handleUpdateOption(idx, { group_name: e.target.value })}
                                                                className="text-[11px] font-bold text-slate-800 uppercase tracking-tight border-transparent hover:border-slate-300 shadow-none px-0 h-auto py-1 bg-transparent focus:ring-0 focus:border-slate-300 focus:bg-white rounded-sm w-full transition-all placeholder:text-slate-300"
                                                                placeholder="SUBSECTION NAME..."
                                                            />
                                                        </div>

                                                        {/* Options (Subjects) */}
                                                        <div className="space-y-2 pl-1">
                                                            {option.subjects.map((subject, sIdx) => (
                                                                <div key={sIdx} className="flex items-center gap-2 group/subject">
                                                                    <div className="w-4 h-4 rounded border border-slate-300 bg-white flex-shrink-0" />
                                                                    <Input
                                                                        value={subject}
                                                                        onChange={(e) => handleUpdateSubject(idx, sIdx, e.target.value)}
                                                                        className="h-7 py-0 text-xs font-medium text-slate-600 border-transparent hover:border-slate-200 focus:border-slate-300 bg-transparent focus:bg-white shadow-none px-1 w-full rounded-sm placeholder:text-slate-300"
                                                                        placeholder="Option name..."
                                                                    />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-slate-300 hover:text-red-500 opacity-0 group-hover/subject:opacity-100 transition-opacity -ml-2"
                                                                        onClick={() => handleRemoveSubject(idx, sIdx)}
                                                                    >
                                                                        <Trash2 size={10} />
                                                                    </Button>
                                                                </div>
                                                            ))}

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-[10px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 -ml-1 mt-1 font-medium"
                                                                onClick={() => handleAddSubject(idx)}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" /> Add Option
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="pt-8 border-t border-dashed border-slate-200">
                                <Button
                                    onClick={() => handleAddGroup(activeTab)}
                                    variant="ghost"
                                    className="w-full border-2 border-dashed border-slate-200 py-8 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 rounded-xl"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <Plus className="w-5 h-5" />
                                        <span className="font-bold text-xs uppercase tracking-wider">Add New Section</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
