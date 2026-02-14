"use client"

import { useState, useEffect } from "react"
import { Users, GraduationCap, Search, Mail, Phone, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface User {
    id: number
    name: string
    email: string
    role: string
    phone?: string
    created_at: string
    avatar?: string
}

export default function PerformancePage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setLoading(false)
        }
    }

    const students = users.filter(user => user.role === 'student' &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toString().includes(searchTerm)))

    const teachers = users.filter(user => user.role === 'tutor' &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toString().includes(searchTerm)))

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const UserList = ({ title, users, icon: Icon, colorClass }: { title: string, users: User[], icon: any, colorClass: string }) => (
        <Card className="h-full">
            <CardHeader className={`border-b ${colorClass} bg-opacity-10`}>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                    {title}
                    <span className="ml-auto text-sm font-normal text-slate-500 bg-white px-2 py-1 rounded-full border">
                        {users.length} Total
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y max-h-[600px] overflow-y-auto">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No users found
                        </div>
                    ) : (
                        users.map(user => (
                            <Link
                                key={user.id}
                                href={`/admin/performance/${user.id}`}
                                className="block p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-10 h-10 border">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 truncate">{user.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Mail size={12} />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <span className="font-mono">ID: {user.id}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <Phone size={12} />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                                            <Calendar size={12} />
                                            <span>Joined {formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Performance & Users</h1>
                    <p className="text-slate-600">Overview of all students and teachers</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search users..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-96 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UserList
                        title="Students"
                        users={students}
                        icon={Users}
                        colorClass="bg-blue-500"
                    />
                    <UserList
                        title="Teachers"
                        users={teachers}
                        icon={GraduationCap}
                        colorClass="bg-purple-500"
                    />
                </div>
            )}
        </div>
    )
}
