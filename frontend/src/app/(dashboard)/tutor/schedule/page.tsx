"use client"

import { useState } from "react"
import { Calendar, Clock, Plus, Video } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TutorSchedulePage() {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newClass, setNewClass] = useState({
        subject: "",
        student: "",
        date: "",
        time: "",
        duration: "1h",
        zoomLink: ""
    })

    const upcomingClasses: Array<{
        id: number
        courseName: string
        date: string
        time: string
        duration: string
        zoomLink: string
    }> = []

    const handleCreateClass = () => {
        console.log("Creating new class:", newClass)
        setShowCreateModal(false)
        // Reset form
        setNewClass({ subject: "", student: "", date: "", time: "", duration: "1h", zoomLink: "" })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Schedule</h1>
                    <p className="text-slate-600">Manage your upcoming classes and create new sessions</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" /> Create New Class
                </Button>
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <Calendar className="mr-2 text-blue-600" size={24} />
                        Upcoming Classes
                    </h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {upcomingClasses.map((classItem) => (
                        <div key={classItem.id} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-start space-x-4 flex-1">
                                <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-blue-100">
                                    <span className="text-xs font-bold uppercase">{new Date(classItem.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-lg font-bold leading-none">{new Date(classItem.date).getDate()}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-lg">{classItem.courseName}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center text-sm font-medium text-slate-600">
                                            <Clock size={14} className="mr-1 text-slate-400" /> {classItem.time}
                                        </span>
                                        <span className="text-sm text-slate-500">{classItem.duration}</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Video size={16} className="mr-2" /> Start Zoom
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Class Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Create New Class</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={newClass.subject}
                                    onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Mathematics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
                                <input
                                    type="text"
                                    value={newClass.student}
                                    onChange={(e) => setNewClass({ ...newClass, student: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Alex Johnson"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={newClass.date}
                                        onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={newClass.time}
                                        onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                <select
                                    value={newClass.duration}
                                    onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="30min">30 minutes</option>
                                    <option value="1h">1 hour</option>
                                    <option value="1.5h">1.5 hours</option>
                                    <option value="2h">2 hours</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Zoom Link</label>
                                <input
                                    type="url"
                                    value={newClass.zoomLink}
                                    onChange={(e) => setNewClass({ ...newClass, zoomLink: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://zoom.us/j/..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleCreateClass} className="flex-1 bg-green-600 hover:bg-green-700">
                                Create Class
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
