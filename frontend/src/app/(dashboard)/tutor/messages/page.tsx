"use client"

import { useState } from "react"
import ChatSidebar from "@/components/dashboard/messaging/ChatSidebar"
import ChatWindow from "@/components/dashboard/messaging/ChatWindow"

interface Contact {
    id: number
    name: string
    email: string
    role: string
    type: 'admin' | 'student'
}

export default function MessagesPage() {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

    return (
        <div className="h-[calc(100vh-2rem)] border rounded-xl overflow-hidden bg-white shadow-sm flex">
            <ChatSidebar
                onSelectContact={setSelectedContact}
                selectedContactId={selectedContact?.id}
            />

            <main className="flex-1 flex flex-col">
                {selectedContact ? (
                    <ChatWindow contact={selectedContact} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/30">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <span className="text-4xl">👋</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Welcome to Messages</h3>
                        <p className="mt-2 text-center max-w-sm">
                            Select a student or an admin from the sidebar to start messaging.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
