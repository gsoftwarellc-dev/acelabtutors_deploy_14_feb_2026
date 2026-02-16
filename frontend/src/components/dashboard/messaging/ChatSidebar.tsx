"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Contact {
    id: number
    name: string
    email: string
    role: string
    type: 'admin' | 'student'
    avatar?: string
}

interface ChatSidebarProps {
    onSelectContact: (contact: Contact) => void
    selectedContactId?: number
}

export default function ChatSidebar({ onSelectContact, selectedContactId }: ChatSidebarProps) {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/messages/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setContacts(data)
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const admins = filteredContacts.filter(c => c.type === 'admin')

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    return (
        <div className="w-80 border-r flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-6">
                    {/* Admins Section */}
                    {admins.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Support & Admin</h3>
                            <div className="space-y-1">
                                {admins.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => onSelectContact(contact)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                            selectedContactId === contact.id ? "bg-primary/10 text-primary" : "hover:bg-slate-100"
                                        )}
                                    >
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback className="bg-slate-900 text-white text-xs">{getInitials(contact.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-sm truncate">{contact.name}</span>
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1">Admin</Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate block">{contact.email}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                </div>
            </ScrollArea>
        </div>
    )
}
