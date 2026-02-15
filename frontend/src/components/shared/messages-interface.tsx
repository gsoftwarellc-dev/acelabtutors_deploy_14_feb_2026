"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Send, Paperclip, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Contact {
    id: number
    name: string
    role: string
    course_name?: string  // Course/subject name for display
    avatar?: string
    lastMessage: string
    time: string
    unread: number  // Unread message count
    online: boolean
    last_message_sender_id?: number
}

interface Message {
    id: number
    senderId: number | "me"
    text: string
    image_url?: string
    time: string
    isMe: boolean
}

interface MessagesProps {
    contacts: Contact[]
}

export default function MessagesInterface({ contacts }: MessagesProps) {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null)
    const [messageInput, setMessageInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Load messages when contact changes
    useEffect(() => {
        if (selectedContact) {
            fetchMessages(selectedContact.id)
        }
    }, [selectedContact])

    const fetchMessages = async (userId: number) => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const currentUserId = parseInt(localStorage.getItem('userId') || '0')

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/messages/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                // Transform backend format to frontend format
                const transformedMessages = data.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.sender_id,
                    text: msg.content,  // content -> text
                    image_url: msg.image_url, // image_url
                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),  // created_at -> time
                    isMe: msg.sender_id === currentUserId  // calculate isMe
                }))
                setMessages(transformedMessages)
            }
        } catch (error) {
            console.error("Failed to load messages", error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image must be less than 5MB')
                return
            }
            setSelectedImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleRemoveImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!messageInput.trim() && !selectedImage) || !selectedContact) return

        const tempId = Date.now();
        const optimisticMessage: Message = {
            id: tempId,
            senderId: "me",
            text: messageInput,
            image_url: imagePreview || undefined, // Optimistic image preview
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        }

        // Optimistic UI update
        setMessages([...messages, optimisticMessage])
        setMessageInput("")

        // Prepare FormData
        const formData = new FormData()
        formData.append('receiver_id', selectedContact.id.toString())
        if (messageInput.trim()) {
            formData.append('content', messageInput)
        }
        if (selectedImage) {
            formData.append('image', selectedImage)
        }

        // Reset image state immediately for better UX
        const currentImage = selectedImage
        handleRemoveImage()

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type header when sending FormData, let browser set it with boundary
                    'Accept': 'application/json'
                },
                body: formData
            })

            if (!res.ok) {
                // Revert on failure (simplified)
                console.error("Failed to send")
            } else {
                // Refresh messages to get the real URL from backend
                const data = await res.json()
                if (data.image_url) {
                    // Update the optimistic message with the real one or just re-fetch
                    fetchMessages(selectedContact.id)
                }
            }
        } catch (error) {
            console.error("Error sending message", error)
        }
    }

    const [searchTerm, setSearchTerm] = useState("")

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.id.toString().includes(searchTerm)
    )

    return (
        <div className="h-[calc(100vh-120px)] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex">
            {/* Contacts Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedContact?.id === contact.id
                                ? "bg-blue-100"
                                : contact.last_message_sender_id === contact.id
                                    ? "bg-blue-50"
                                    : ""
                                }`}
                        >
                            <div className="relative">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {contact.name.charAt(0)}
                                </div>
                                {contact.online && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-900 truncate">
                                        {contact.name} <span className="text-xs font-normal text-slate-500 ml-1">(ID: {contact.id})</span>
                                    </h3>
                                    {contact.unread > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center ml-2">
                                            {contact.unread}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{contact.course_name || contact.role}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-sm text-slate-600 truncate">{contact.lastMessage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {
                selectedContact ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {selectedContact.name}
                                        <span className="ml-2 text-sm font-medium text-slate-500">(ID: {selectedContact.id})</span>
                                    </h3>
                                    <p className="text-xs text-green-600 flex items-center">
                                        {selectedContact.online ? "Online" : "Offline"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-400">
                                <Button variant="ghost" size="icon"><MoreVertical size={20} /></Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                            {loading ? (
                                <div className="text-center text-slate-400 mt-4">Loading messages...</div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl p-4 ${msg.isMe
                                                ? "bg-blue-600 text-white rounded-tr-none"
                                                : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                                                }`}
                                        >
                                            {msg.image_url && (
                                                <div className="mb-2">
                                                    <img
                                                        src={msg.image_url}
                                                        alt="Sent attachment"
                                                        className="rounded-lg max-w-full max-h-60 object-cover cursor-pointer hover:opacity-90"
                                                        onClick={() => window.open(msg.image_url, '_blank')}
                                                    />
                                                </div>
                                            )}
                                            {msg.text && <p className="text-sm">{msg.text}</p>}
                                            <p
                                                className={`text-xs mt-1 text-right ${msg.isMe ? "text-blue-200" : "text-slate-400"
                                                    }`}
                                            >
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-white border-t border-slate-100">
                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="relative group">
                                        <img src={imagePreview} alt="Preview" className="h-20 w-auto object-cover rounded shadow-sm" />
                                    </div>
                                    <button
                                        onClick={handleRemoveImage}
                                        className="text-red-500 text-sm hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            <div className="p-4">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        className={`p-2 shrink-0 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors ${selectedImage ? 'text-blue-600 bg-blue-50' : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Attach image"
                                    >
                                        <Paperclip size={20} className="hidden sm:block" />
                                        <span className="sm:hidden text-xl">📎</span>
                                    </button>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        <Send size={18} />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} />
                        </div>
                        <p>Select a contact to start messaging</p>
                    </div>
                )
            }
        </div >
    )
}
