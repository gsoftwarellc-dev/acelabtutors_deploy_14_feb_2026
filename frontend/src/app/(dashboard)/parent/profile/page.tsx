"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Camera, Calendar, Edit2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ParentProfilePage() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
        bio: user?.bio || "",
        avatar: user?.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}` : "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    useEffect(() => {
        if (user) {
            setProfileData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "",
                bio: user.bio || "",
                avatar: user.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.avatar}` : ""
            }))
        }
    }, [user])

    const handleSave = () => {
        setIsEditing(false)
        console.log("Profile saved:", profileData)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const formData = new FormData()
            formData.append('avatar', file)

            try {
                const token = localStorage.getItem('token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const response = await fetch(`${apiUrl}/api/user/avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                })

                if (response.ok) {
                    const data = await response.json()
                    const avatarUrl = `${apiUrl}${data.avatar_url}`
                    setProfileData({ ...profileData, avatar: avatarUrl })
                } else {
                    console.error("Failed to upload avatar")
                }
            } catch (error) {
                console.error("Error uploading avatar:", error)
            }
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
                    <p className="text-slate-600">Manage your personal information and preferences</p>
                </div>
                <Button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
                >
                    {isEditing ? (
                        <>
                            <Save size={16} className="mr-2" /> Save Changes
                        </>
                    ) : (
                        <>
                            <Edit2 size={16} className="mr-2" /> Edit Profile
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                {profileData.avatar && profileData.avatar !== "/logo.png" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={profileData.avatar}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-100"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-slate-100 text-primary text-3xl font-bold">
                                        {getInitials(profileData.name)}
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                                        <Camera size={18} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mt-4">{profileData.name}</h2>
                            <p className="text-sm text-slate-500 capitalize">{user?.role || 'Parent'}</p>
                            <div className="mt-4 w-full space-y-3">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Calendar size={16} className="mr-2 text-slate-400" />
                                    Joined {profileData.joinDate}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profileData.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profileData.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                ) : (
                                    <p className="text-slate-900">{profileData.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
