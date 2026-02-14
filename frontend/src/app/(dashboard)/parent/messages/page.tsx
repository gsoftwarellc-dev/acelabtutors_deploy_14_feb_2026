"use client"

import { useEffect, useState } from "react"
import MessagesInterface from "@/components/shared/messages-interface"
import api from "@/lib/api"

export default function ParentMessagesPage() {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/messages/contacts')
            setContacts(data || [])
        } catch (error) {
            console.error("Failed to fetch contacts:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading messages...</div>
    }

    return <MessagesInterface contacts={contacts} />
}
