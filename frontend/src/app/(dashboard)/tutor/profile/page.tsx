"use client"

import { useState } from "react"
import { Camera, Mail, Lock, Save } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import GoogleConnectButton from "@/components/GoogleConnectButton"

export default function TutorProfile() {
    const { user, updateUser } = useAuth()
    const [profileImage, setProfileImage] = useState(user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}`) : "/default-avatar.png")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState({ type: "", text: "" })
    const [isLoading, setIsLoading] = useState(false)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImage(reader.result as string)
                setMessage({ type: "success", text: "Image uploaded successfully! Click Save to update." })
            }
            reader.readAsDataURL(file)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match!" })
            return
        }

        if (newPassword.length < 8) {
            setMessage({ type: "error", text: "Password must be at least 8 characters long!" })
            return
        }

        setIsLoading(true)

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/user/password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword
                })
            })

            if (res.ok) {
                setMessage({ type: "success", text: "Password changed successfully!" })
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                const data = await res.json()
                setMessage({ type: "error", text: data.message || "Failed to change password" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "Failed to change password" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        if (!profileImage.startsWith('data:image')) {
            setMessage({ type: "error", text: "Please select a new image first" })
            return
        }

        setIsLoading(true)

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${apiUrl}/api/user/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    avatar: profileImage
                })
            })

            if (res.ok) {
                const data = await res.json()
                setMessage({ type: "success", text: "Profile picture updated successfully!" })

                // Update global user state
                if (data.user) {
                    updateUser(data.user)
                }
            } else {
                const data = await res.json()
                setMessage({ type: "error", text: data.message || "Failed to update profile picture" })
            }
        } catch (error) {
            console.error(error)
            setMessage({ type: "error", text: "An error occurred while saving profile" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Image Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile Picture</h2>
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                            <Camera size={20} />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-slate-900">{user?.name || "Tutor Name"}</h3>
                        <p className="text-slate-500 text-sm mt-1">Upload a professional photo for your profile</p>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                        >
                            <Save size={16} />
                            <span>{isLoading ? "Saving..." : "Save Profile Image"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Email Address</h2>
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <Mail className="text-slate-400" size={20} />
                    <div>
                        <p className="text-sm text-slate-500">Your registered email</p>
                        <p className="text-lg font-medium text-slate-900">{user?.email || "tutor@example.com"}</p>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                    Contact support to change your email address
                </p>
            </div>

            {/* Google Account Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Connected Accounts</h2>
                <p className="text-sm text-slate-500 mb-6">Connect your external accounts to enable advanced features like Google Meet hosting.</p>
                <div className="space-y-4">
                    <GoogleConnectButton />
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <h3 className="font-medium text-blue-900 mb-2">Security Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use a strong password with at least 8 characters</li>
                    <li>• Include numbers, uppercase, lowercase, and special characters</li>
                    <li>• Don&apos;t share your password with anyone</li>
                    <li>• Change your password regularly</li>
                </ul>
            </div>
        </div>
    )
}
