"use client"

import { useState, useEffect } from "react"
import MessagesInterface from "@/components/shared/messages-interface"

export default function StudentMessagesPage() {
    const [contacts, setContacts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchContacts()
    }, [])

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8000/api/messages/contacts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                setContacts(data)
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center py-20">
            <div className="text-slate-500">Loading contacts...</div>
        </div>
    }

    return <MessagesInterface contacts={contacts} />
}
