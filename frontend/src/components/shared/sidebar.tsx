"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    Calendar,
    Users,
    LogOut,
    BookOpen,
    CreditCard,
    FileText,
    User,
    MessageSquare,
    SlidersHorizontal,
    Filter,
    Globe,
    Contact,
    BookCopy,
    BarChart,
    History
} from "lucide-react"

interface SidebarProps {
    role: "student" | "parent" | "tutor" | "admin"
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname()
    const { logout } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchUnreadCount()
        // Poll every 30 seconds for new messages
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch('http://localhost:8000/api/messages/unread-count', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setUnreadCount(data.unread_count)
            }
        } catch (error) {
            console.error('Failed to fetch unread count', error)
        }
    }

    const links = {
        student: [
            { href: "/student", label: "Dashboard", icon: LayoutDashboard },
            { href: "/student/courses", label: "My Courses", icon: BookOpen },
            { href: "/student/exams", label: "Exams & Result", icon: FileText },
            { href: "/student/messages", label: "Messages", icon: MessageSquare },
            { href: "/student/profile", label: "Profile", icon: User },
        ],
        parent: [
            { href: "/parent", label: "Overview", icon: LayoutDashboard },
            { href: "/parent/messages", label: "Messages", icon: MessageSquare },
            { href: "/parent/profile", label: "Profile", icon: User },
        ],
        tutor: [
            { href: "/tutor", label: "Dashboard", icon: LayoutDashboard },
            { href: "/tutor/courses", label: "Courses", icon: BookOpen },
            { href: "/tutor/attendance-history", label: "Attendance History", icon: History },
            { href: "/tutor/messages", label: "Messages", icon: MessageSquare },
            { href: "/tutor/earnings", label: "Earnings", icon: CreditCard },
            { href: "/tutor/profile", label: "Profile", icon: User },
        ],
        admin: [
            { href: "/admin", label: "Overview", icon: LayoutDashboard },
            { href: "/admin/users", label: "User Management", icon: Users },
            { href: "/admin/messages", label: "Messages", icon: MessageSquare },
            { href: "/admin/contacts", label: "Contacts", icon: Contact },
            { href: "/admin/finance", label: "Finance", icon: CreditCard },
            { href: "/admin/approvals", label: "Course Approvals", icon: BookOpen },
            { href: "/admin/courses/control", label: "Control Courses", icon: SlidersHorizontal },
            { href: "/admin/registrations", label: "Registrations", icon: History },
            { href: "/admin/enrollment", label: "Course Enrollment", icon: BookCopy },
            { href: "/admin/filters", label: "Manage Filters", icon: Filter },
            { href: "/admin/performance", label: "Performance", icon: BarChart },
            { href: "/admin/profile", label: "Profile", icon: User },
        ]
    }

    const currentLinks = links[role] || links.student

    return (
        <div className="w-64 bg-white border-r h-screen hidden md:flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center justify-center w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo_main.png" alt="Acelab" className="h-20 w-auto object-contain" />
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {currentLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Icon size={18} />
                            <span>{link.label}</span>
                            {link.label === "Messages" && unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t">
                <button
                    type="button"
                    onClick={() => logout()}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )
}
