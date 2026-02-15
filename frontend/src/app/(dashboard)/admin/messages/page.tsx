"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import api from "@/lib/api"
import MessagesInterface from "@/components/shared/messages-interface"

function AdminMessagesContent() {
    const searchParams = useSearchParams()
    const urlUserId = searchParams.get('userId')

    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [urlUserId])

    const fetchContacts = async () => {
        try {
            const response = await api.get('/messages/contacts')
            let data = response.data

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
                        const userRes = await api.get(`/admin/users/${targetId}`)
                        const user = userRes.data
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
                    } catch (err) {
                        console.error("Failed to fetch target user details", err)
                    }
                }
            }

            setContacts(data)
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

export default function AdminMessagesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminMessagesContent />
        </Suspense>
    )
}
