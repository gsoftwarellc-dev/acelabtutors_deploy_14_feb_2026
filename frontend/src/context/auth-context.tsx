"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    name: string
    email: string
    role: string
    phone?: string
    bio?: string
    created_at?: string
    avatar?: string
}

interface AuthContextType {
    user: User | null
    login: (token: string, user: User) => void
    logout: () => void
    updateUser: (user: User) => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check for token on load from both localStorage and cookies
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        // Also check cookie as fallback
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1]

        if (token && storedUser) {
            setUser(JSON.parse(storedUser))
            setIsAuthenticated(true)
        } else if (cookieToken && storedUser) {
            // If cookie exists but localStorage doesn't, restore it
            localStorage.setItem('token', cookieToken)
            setUser(JSON.parse(storedUser))
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])

    const login = (token: string, userData: User) => {
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('userId', userData.id.toString())  // Store userId separately for easy access

        // Store in cookie for middleware (7 days expiry, HttpOnly=false for client access)
        const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds
        document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`
        document.cookie = `userRole=${userData.role}; path=/; max-age=${maxAge}; SameSite=Strict`

        setUser(userData)
        setIsAuthenticated(true)

        // Redirect based on role
        if (userData.role === 'tutor') {
            router.push('/tutor')
        } else if (userData.role === 'student') {
            router.push('/student')
        } else if (userData.role === 'admin') {
            router.push('/admin')
        } else if (userData.role === 'parent') {
            router.push('/parent')
        } else {
            router.push('/')
        }
    }

    const updateUser = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = async () => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                await fetch(`${apiUrl}/api/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
            }
        } catch (error) {
            console.error("Logout failed", error)
        } finally {
            // Clear localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            // Clear cookie
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

            setUser(null)
            setIsAuthenticated(false)
            router.push('/login')
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
