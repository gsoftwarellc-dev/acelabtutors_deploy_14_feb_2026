"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Edit, Eye, Loader2, Settings } from "lucide-react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"

interface Registration {
    id: number
    type: 'free' | 'paid'
    parent_name: string
    relationship: string
    parent_email: string
    parent_phone: string
    student_name: string
    student_dob: string
    student_email: string | null
    selections: Record<string, string[]>
    specific_needs: string | null
    requested_year: string | null
    assigned_year: string | null
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")

    // View/Edit state
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Form state for edit
    const [editData, setEditData] = useState<{ status?: string; assigned_year?: string }>({})

    useEffect(() => {
        fetchRegistrations()
    }, [])

    const fetchRegistrations = async () => {
        setLoading(true)
        try {
            const { data } = await api.get(`/admin/registrations?type=${typeFilter}&search=${searchQuery}`)
            setRegistrations(data)
        } catch (error) {
            console.error("Failed to fetch registrations", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateRegistration = async () => {
        if (!selectedRegistration) return
        try {
            await api.put(`/admin/registrations/${selectedRegistration.id}`, editData)
            setIsEditOpen(false)
            fetchRegistrations()
        } catch (error) {
            console.error("Failed to update registration", error)
            alert("Failed to update registration")
        }
    }

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch = reg.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.parent_email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType = typeFilter === "all" || reg.type === typeFilter

        return matchesSearch && matchesType
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
            case 'rejected': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
            default: return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Registrations</h1>
                    <p className="text-slate-400 text-xs font-medium">Manage and review student registration submissions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/admin/registrations/config">
                        <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 hover:text-slate-900">
                            <Settings className="w-4 h-4 mr-2" />
                            Form Settings
                        </Button>
                    </Link>
                    <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="paid">Paid</TabsTrigger>
                            <TabsTrigger value="free">Free</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search registrations..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Parent Email</TableHead>
                            <TableHead>Parent Phone</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Requested Year</TableHead>
                            <TableHead>Assigned Year</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    <p className="text-slate-500 mt-2 text-sm">Loading registrations...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredRegistrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-12 text-slate-500">
                                    No registrations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRegistrations.map((reg) => (
                                <TableRow key={reg.id}>
                                    <TableCell className="font-medium text-slate-900">{reg.student_name}</TableCell>
                                    <TableCell className="text-slate-600">{reg.parent_name}</TableCell>
                                    <TableCell className="text-slate-500 text-xs">{reg.parent_email}</TableCell>
                                    <TableCell className="text-slate-500 text-xs">{reg.parent_phone}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "capitalize font-semibold",
                                            reg.type === 'paid' ? "border-blue-200 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-700 bg-slate-50"
                                        )}>
                                            {reg.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {reg.type === 'free' && reg.requested_year ? (
                                            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 font-semibold">
                                                {reg.requested_year}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {reg.type === 'free' && reg.assigned_year ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-semibold">
                                                {reg.assigned_year}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(reg.status)}</TableCell>
                                    <TableCell className="text-slate-500">{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => {
                                                    setSelectedRegistration(reg)
                                                    setIsViewOpen(true)
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-slate-100"
                                                onClick={() => {
                                                    setSelectedRegistration(reg)
                                                    setEditData({
                                                        status: reg.status,
                                                        assigned_year: reg.assigned_year || ''
                                                    })
                                                    setIsEditOpen(true)
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl border-none shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Registration Submission</p>
                            <DialogTitle className="text-2xl font-bold">{selectedRegistration?.student_name}</DialogTitle>
                        </div>
                        <Badge className={cn(
                            "px-3 py-1 text-xs font-bold uppercase tracking-tight",
                            selectedRegistration?.type === 'paid' ? "bg-blue-600 hover:bg-blue-600" : "bg-slate-600 hover:bg-slate-600"
                        )}>
                            {selectedRegistration?.type} Form
                        </Badge>
                    </div>

                    <div className="p-8">
                        {selectedRegistration && (
                            <ScrollArea className="max-h-[70vh] pr-4">
                                <div className="space-y-10">
                                    {/* Personal Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Student Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Full Name</p>
                                                    <p className="text-sm font-semibold text-slate-900">{selectedRegistration.student_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Date of Birth</p>
                                                    <p className="text-sm font-semibold text-slate-900">{new Date(selectedRegistration.student_dob).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                                </div>
                                                {selectedRegistration.student_email && (
                                                    <div>
                                                        <p className="text-[11px] font-medium text-slate-500 mb-0.5">Student Email</p>
                                                        <p className="text-sm font-semibold text-slate-900">{selectedRegistration.student_email}</p>
                                                    </div>
                                                )}
                                                {selectedRegistration.type === 'free' && selectedRegistration.requested_year && (
                                                    <div>
                                                        <p className="text-[11px] font-medium text-slate-500 mb-0.5">Requested Year</p>
                                                        <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 font-semibold">
                                                            {selectedRegistration.requested_year}
                                                        </Badge>
                                                    </div>
                                                )}
                                                {selectedRegistration.type === 'free' && selectedRegistration.assigned_year && (
                                                    <div>
                                                        <p className="text-[11px] font-medium text-slate-500 mb-0.5">Assigned Year</p>
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-semibold">
                                                            {selectedRegistration.assigned_year}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Parent / Guardian</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Contact Name</p>
                                                    <p className="text-sm font-semibold text-slate-900">{selectedRegistration.parent_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedRegistration.relationship}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Parent Email</p>
                                                    <p className="text-sm font-semibold text-slate-900">{selectedRegistration.parent_email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-slate-500 mb-0.5">Phone Number</p>
                                                    <p className="text-sm font-semibold text-slate-900">{selectedRegistration.parent_phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject Selections */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Course & Subject Selections</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {Object.entries(selectedRegistration.selections).map(([category, subjects]) => (
                                                <div key={category} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter mb-3">{category}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {subjects.map(s => (
                                                            <Badge key={s} className="bg-white text-slate-700 border-slate-200 hover:bg-white text-[10px] px-3 py-1">
                                                                {s}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Special Needs */}
                                    {selectedRegistration.specific_needs && (
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Specific Needs or Medical History</h3>
                                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                                                    {selectedRegistration.specific_needs}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submission Meta */}
                                    <div className="pt-6 mt-6 border-t flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Submitted on: {new Date(selectedRegistration.created_at).toLocaleString()}</span>
                                        <span className="flex items-center gap-2">
                                            Current Status:
                                            {selectedRegistration.status === 'approved' ? (
                                                <span className="text-green-600">Approved</span>
                                            ) : selectedRegistration.status === 'rejected' ? (
                                                <span className="text-red-600">Rejected</span>
                                            ) : (
                                                <span className="text-yellow-600">Pending Review</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog (Status + Year Assignment) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Registration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedRegistration && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                                <p className="text-xs text-slate-500">Student: <span className="font-bold text-slate-900">{selectedRegistration.student_name}</span></p>
                                {selectedRegistration.type === 'free' && selectedRegistration.requested_year && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Requested Year: <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 font-semibold text-[10px] ml-1">{selectedRegistration.requested_year}</Badge>
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-200 p-2 text-sm"
                                value={editData.status}
                                onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Show year assignment when approving a free registration */}
                        {selectedRegistration?.type === 'free' && editData.status === 'approved' && (
                            <div className="space-y-2">
                                <Label>Assign Year Group *</Label>
                                <p className="text-[10px] text-slate-500">Select the year group this student should be assigned to for free classes.</p>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-200 p-2 text-sm"
                                    value={editData.assigned_year || ''}
                                    onChange={(e) => setEditData({ ...editData, assigned_year: e.target.value })}
                                    required
                                >
                                    <option value="">Select a year</option>
                                    <option value="YEAR 8">Year 8</option>
                                    <option value="YEAR 9">Year 9</option>
                                    <option value="YEAR 10">Year 10</option>
                                    <option value="YEAR 11">Year 11</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdateRegistration}
                            disabled={selectedRegistration?.type === 'free' && editData.status === 'approved' && !editData.assigned_year}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
