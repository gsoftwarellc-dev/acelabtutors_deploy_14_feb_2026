"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import MessagesInterface from "@/components/shared/messages-interface"

export default function AdminMessagesPage() {
    const searchParams = useSearchParams()
    const urlUserId = searchParams.get('userId')

    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [urlUserId])

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/messages/contacts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                let data = await response.json()

                // If userId param exists, ensure this user is at the top or selected
                if (urlUserId) {
                    const targetId = parseInt(urlUserId)
                    const targetUser = data.find((c: any) => c.id === targetId)

                    if (targetUser) {
                        // Move target user to top
                        data = [targetUser, ...data.filter((c: any) => c.id !== targetId)]
                    } else {
                        // If user not in list (e.g. no prior messages), fetch and add them
                        try {
                            const userRes = await fetch(`http://localhost:8000/api/admin/users/${targetId}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            })
                            if (userRes.ok) {
                                const user = await userRes.json()
                                const newContact = {
                                    id: user.id,
                                    name: user.name,
                                    role: user.role,
                                    avatar: user.avatar,
                                    lastMessage: "",
                                    time: "",
                                    unread: 0,
                                    online: false,
                                    type: user.role
                                }
                                data = [newContact, ...data]
                            }
                        } catch (err) {
                            console.error("Failed to fetch target user details", err)
                        }
                    }
                }

                setContacts(data)
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-120px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return <MessagesInterface contacts={contacts} />
}
