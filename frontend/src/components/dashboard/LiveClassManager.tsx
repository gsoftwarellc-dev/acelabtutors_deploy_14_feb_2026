"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, Plus, FileText, Youtube, Upload, ExternalLink, MoreVertical } from "lucide-react"

interface LiveClass {
    id: number
    topic: string
    start_time: string
    duration: number
    meeting_link: string
    recording_url?: string
    materials_path?: string
    status: 'scheduled' | 'completed' | 'cancelled'
}

export default function LiveClassManager({ courseId }: { courseId: string }) {
    const [classes, setClasses] = useState<LiveClass[]>([])
    const [loading, setLoading] = useState(true)
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [showManageModal, setShowManageModal] = useState<LiveClass | null>(null)

    // Schedule Form
    const [scheduleData, setScheduleData] = useState({ topic: "", date: "", time: "", duration: "60" })

    // Manage Form (Uploads)
    const [manageData, setManageData] = useState({ recording_url: "", file: null as File | null })

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/courses/${courseId}/live-classes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setClasses(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [courseId])

    const handleSchedule = async () => {
        if (!scheduleData.topic || !scheduleData.date || !scheduleData.time) return

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const startDateTime = `${scheduleData.date}T${scheduleData.time}:00`

            const res = await fetch(`${apiUrl}/api/courses/${courseId}/live-classes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: scheduleData.topic,
                    start_time: startDateTime,
                    duration: parseInt(scheduleData.duration)
                })
            })

            if (res.ok) {
                setScheduleData({ topic: "", date: "", time: "", duration: "60" })
                setShowScheduleModal(false)
                fetchClasses()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleUpdateClass = async () => {
        if (!showManageModal) return

        const formData = new FormData()
        if (manageData.recording_url) formData.append('recording_url', manageData.recording_url)
        if (manageData.file) formData.append('file', manageData.file)

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'

            const res = await fetch(`${apiUrl}/api/live-classes/${showManageModal.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            })

            if (res.ok) {
                setManageData({ recording_url: "", file: null })
                setShowManageModal(null)
                fetchClasses()
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Live Classes</h2>
                <Button onClick={() => setShowScheduleModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Video size={16} className="mr-2" /> Schedule Class
                </Button>
            </div>

            <div className="space-y-4">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cls.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                <Video size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{cls.topic}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(cls.start_time).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.duration} min)</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    {cls.recording_url && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                                            <Youtube size={12} /> Recording Available
                                        </span>
                                    )}
                                    {cls.materials_path && (
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1">
                                            <FileText size={12} /> Materials Added
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                            {cls.status !== 'completed' && (
                                <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                    onClick={() => window.open(cls.meeting_link, '_blank')}>
                                    <ExternalLink size={14} className="mr-1" /> Join Zoom
                                </Button>
                            )}
                            <Button size="sm" variant="secondary" onClick={() => setShowManageModal(cls)}>
                                <Upload size={14} className="mr-1" /> {cls.status === 'completed' ? 'Edit Resources' : 'Upload Resources'}
                            </Button>
                        </div>
                    </div>
                ))}

                {classes.length === 0 && !loading && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-500 mb-2">No classes scheduled yet.</p>
                        <Button variant="outline" onClick={() => setShowScheduleModal(true)}>Schedule First Session</Button>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[50] p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Video size={20} className="text-purple-600" /> Schedule Live Class
                        </h3>
                        {/* Form Inputs (Same as before) */}
                        <div className="space-y-4">
                            <input className="w-full border border-slate-200 rounded-lg px-4 py-2" placeholder="Topic" value={scheduleData.topic} onChange={(e) => setScheduleData({ ...scheduleData, topic: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" className="w-full border border-slate-200 rounded-lg px-4 py-2" value={scheduleData.date} onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })} />
                                <input type="time" className="w-full border border-slate-200 rounded-lg px-4 py-2" value={scheduleData.time} onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })} />
                            </div>
                            <select className="w-full border border-slate-200 rounded-lg px-4 py-2" value={scheduleData.duration} onChange={(e) => setScheduleData({ ...scheduleData, duration: e.target.value })}>
                                <option value="30">30 Minutes</option>
                                <option value="60">1 Hour</option>
                                <option value="90">1.5 Hours</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                            <Button onClick={handleSchedule} className="bg-purple-600 hover:bg-purple-700 text-white">Schedule Class</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage/Upload Modal */}
            {showManageModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[50] p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="font-bold text-lg mb-4">Class Resources</h3>
                        <p className="text-sm text-slate-500 mb-4">Upload recording link or materials for <b>{showManageModal.topic}</b>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">YouTube Recording URL</label>
                                <input
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2"
                                    placeholder="https://youtube.com/..."
                                    value={manageData.recording_url}
                                    onChange={(e) => setManageData({ ...manageData, recording_url: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Class Materials (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
                                    onChange={(e) => setManageData({ ...manageData, file: e.target.files ? e.target.files[0] : null })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowManageModal(null)}>Cancel</Button>
                            <Button onClick={handleUpdateClass}>Save Resources</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
