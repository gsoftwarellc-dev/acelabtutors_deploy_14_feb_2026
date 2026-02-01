"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    name: string
    email: string
    role: string
}

interface AuthContextType {
    user: User | null
    login: (token: string, user: User) => void
    logout: () => void
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
        // Check for token on load
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
            setUser(JSON.parse(storedUser))
            setIsAuthenticated(true)
        }
        setIsLoading(false)
    }, [])

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
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
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            setIsAuthenticated(false)
            router.push('/login')
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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
