"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, BookOpen, X, CheckCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
    id: number
    name: string
    email: string
    phone: string | null
    role: string
    status: 'active' | 'suspended'
    created_at: string
}

interface Course {
    id: number
    name: string
    level: string
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [showEnrollModal, setShowEnrollModal] = useState(false)

    // Selection state
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "student"
    })

    const [enrollData, setEnrollData] = useState({
        course_id: "",
        grade: ""
    })

    // -- Hooks --
    const router = useRouter()

    // -- Fetch --
    useEffect(() => {
        fetchUsers()
        fetchCourses()
    }, [])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCourses(data)
            }
        } catch (error) {
            console.error("Failed to fetch courses", error)
        }
    }

    // -- Handlers --

    const handleRowClick = (user: User) => {
        router.push(`/admin/users/${user.id}`)
    }

    const handleOpenCreate = () => {
        setFormData({ name: "", email: "", phone: "", password: "", role: "student" })
        setIsEditing(false)
        setShowCreateModal(true)
    }

    const handleEditFromProfile = () => {
        if (!selectedUser) return
        setFormData({
            name: selectedUser.name,
            email: selectedUser.email,
            phone: selectedUser.phone || "",
            password: "",
            role: selectedUser.role
        })
        setIsEditing(true)
        setShowProfileModal(false) // Close profile, open create/edit modal
        setShowCreateModal(true)
    }

    const handleFormSubmit = async () => {
        const token = localStorage.getItem('token')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const url = isEditing && selectedUser
            ? `${apiUrl}/api/admin/users/${selectedUser.id}`
            : `${apiUrl}/api/admin/users`

        const method = isEditing ? 'PUT' : 'POST'

        const body: Record<string, string | null> = { ...formData }
        if (isEditing && !body.password) delete body.password

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                setShowCreateModal(false)
                fetchUsers()
                // Re-open profile if editing
                if (isEditing && selectedUser) {
                    const updatedUser = await res.json()
                    setSelectedUser(updatedUser.user) // existing endpoint returns { message, user }
                    setShowProfileModal(true)
                }
            } else {
                alert("Operation failed.")
            }
        } catch (error) {
            console.error("Error submitting form", error)
        }
    }

    const handleToggleSuspend = async () => {
        if (!selectedUser) return
        if (!confirm(`Are you sure you want to ${selectedUser.status === 'active' ? 'suspend' : 'activate'} this user?`)) return

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users/${selectedUser.id}/toggle-suspend`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUsers(users.map(u => u.id === selectedUser.id ? data.user : u))
                setSelectedUser(data.user)
            }
        } catch (error) {
            console.error("Failed to toggle status", error)
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser || !confirm("Are you sure you want to delete this user? This cannot be undone.")) return

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                setUsers(users.filter(user => user.id !== selectedUser.id))
                setShowProfileModal(false)
                setSelectedUser(null)
            }
        } catch (error) {
            console.error("Failed to delete user", error)
        }
    }

    const handleEnrollSubmit = async () => {
        if (!selectedUser) return
        if (!enrollData.course_id) return alert("Please select a course")

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/admin/users/${selectedUser.id}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(enrollData)
            })

            if (res.ok) {
                alert("Student successfully enrolled!")
                setShowEnrollModal(false)
                setEnrollData({ course_id: "", grade: "" })
            } else {
                const err = await res.json()
                alert(err.message || "Enrollment failed")
            }
        } catch (error) {
            console.error("Failed to enroll", error)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
                    <p className="text-slate-600">Overview of all system users</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                    <Plus size={18} className="mr-2" /> Create User
                </Button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-left">User</th>
                                <th className="px-6 py-3 font-medium text-left">Role</th>
                                <th className="px-6 py-3 font-medium text-left">Status</th>
                                <th className="px-6 py-3 font-medium text-left">Joined</th>
                                <th className="px-6 py-3 font-medium text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Loading users...</td></tr>
                            ) : users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                    onClick={() => handleRowClick(user)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{user.name}</div>
                                                <div className="text-slate-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.role === "student" ? "bg-blue-100 text-blue-700" :
                                            user.role === "tutor" ? "bg-purple-100 text-purple-700" :
                                                user.role === "admin" ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium capitalize ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-green-600" : "bg-red-600"}`} />
                                            {user.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100">
                                            View More
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedUser.name}</h2>
                                    <p className="text-slate-500">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${selectedUser.role === "student" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"
                                            }`}>{selectedUser.role}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${selectedUser.status === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                                            }`}>{selectedUser.status || 'active'}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} className="bg-white p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 transaction-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Contact Info</h4>
                                    <div className="space-y-1">
                                        <div className="text-slate-900">{selectedUser.phone || "No phone number"}</div>
                                        <div className="text-slate-900">{selectedUser.email}</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Account Details</h4>
                                    <div className="space-y-1">
                                        <div className="text-slate-900">Member since {new Date(selectedUser.created_at).toLocaleDateString()}</div>
                                        <div className="text-slate-900">User ID: #{selectedUser.id}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="pt-8 border-t border-slate-100">
                                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Management Actions</h4>
                                <div className="flex flex-wrap gap-3">
                                    <Button onClick={handleEditFromProfile} variant="outline" className="border-slate-300">
                                        Edit Profile
                                    </Button>

                                    <Button
                                        onClick={handleToggleSuspend}
                                        variant="outline"
                                        className={selectedUser.status === 'active'
                                            ? "border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                            : "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                        }
                                    >
                                        {selectedUser.status === 'active' ? (
                                            <>
                                                <Ban size={16} className="mr-2" /> Suspend User
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} className="mr-2" /> Activate User
                                            </>
                                        )}
                                    </Button>

                                    {selectedUser.role === 'student' && (
                                        <Button
                                            onClick={() => setShowEnrollModal(true)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <BookOpen size={16} className="mr-2" /> Enroll in Course
                                        </Button>
                                    )}

                                    <div className="flex-1"></div>

                                    <Button onClick={handleDeleteUser} variant="destructive">
                                        Delete User
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-6">{isEditing ? 'Edit User' : 'Create New User'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    placeholder="+1 234..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{isEditing ? 'New Password (Optional)' : 'Password'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg capitalize"
                                >
                                    <option value="student">Student</option>
                                    <option value="tutor">Tutor</option>
                                    <option value="parent">Parent</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleFormSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">Save</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enroll Modal (Nested or separate) */}
            {showEnrollModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Enroll Student</h3>
                        <p className="text-sm text-slate-500 mb-6">Select a course to enroll <strong>{selectedUser?.name}</strong>.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                    value={enrollData.course_id}
                                    onChange={(e) => setEnrollData({ ...enrollData, course_id: e.target.value })}
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowEnrollModal(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleEnrollSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700">Enroll</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
