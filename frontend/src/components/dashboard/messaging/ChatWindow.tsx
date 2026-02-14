"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
    id: number
    sender_id: number
    receiver_id: number
    content: string
    image_url?: string
    is_read: boolean
    created_at: string
}

interface Contact {
    id: number
    name: string
    email: string
    type: 'admin' | 'student'
}

interface ChatWindowProps {
    contact: Contact
}

export default function ChatWindow({ contact }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [currentUserId, setCurrentUserId] = useState<number | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // Get current user ID from token or separate API call if needed
        // For now, assume we fetch it or store it in context
        fetchCurrentUser()
        fetchMessages()

        // Polling for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000)
        return () => clearInterval(interval)
    }, [contact.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchCurrentUser = async () => {
        // Quick fetch to get "me"
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCurrentUserId(data.id)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/messages/${contact.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB')
                return
            }
            setSelectedImage(file)
        }
    }

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if ((!newMessage.trim() && !selectedImage)) return

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const formData = new FormData()
            formData.append('receiver_id', contact.id.toString())
            if (newMessage.trim()) {
                formData.append('content', newMessage)
            }
            if (selectedImage) {
                formData.append('image', selectedImage)
            }

            // Reset image state immediately
            setSelectedImage(null)
            if (fileInputRef.current) fileInputRef.current.value = ''

            const res = await fetch(`${apiUrl}/api/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (res.ok) {
                const sentMsg = await res.json()
                // Ensure image_url is present if backend returns it
                if (sentMsg.image_path && !sentMsg.image_url) {
                    sentMsg.image_url = `${apiUrl}/storage/${sentMsg.image_path}`
                }
                setMessages([...messages, sentMsg])
                setNewMessage("")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">{contact.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{contact.type} • {contact.email}</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-slate-50/50 p-4">
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <p className="text-center text-sm text-muted-foreground py-10">Loading messages...</p>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <p>No messages yet.</p>
                            <p className="text-sm">Start a conversation with {contact.name.split(' ')[0]}.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-max max-w-[70%] flex-col gap-1 rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        isMe
                                            ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-white border rounded-bl-none"
                                    )}
                                >
                                    {msg.image_url && (
                                        <div className="mb-1">
                                            <img
                                                src={msg.image_url}
                                                alt="Attachment"
                                                className="rounded-lg max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90"
                                                onClick={() => window.open(msg.image_url, '_blank')}
                                            />
                                        </div>
                                    )}
                                    {msg.content && <p>{msg.content}</p>}
                                    <span className={cn(
                                        "text-[10px] self-end opacity-70",
                                        isMe ? "text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <form onSubmit={sendMessage} className="flex gap-2 items-end">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <button
                        type="button"
                        className={`p-2 shrink-0 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors mb-1 ${selectedImage ? 'text-blue-600 bg-blue-50' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach image"
                    >
                        <Paperclip size={20} />
                    </button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() && !selectedImage}>
                        <Send size={18} />
                    </Button>
                </form>
            </div>
        </div>
    )
}
