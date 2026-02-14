"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
    id: number
    name: string
    price: number
    registrationFee?: number
    tutorName: string
    image?: string // Optional, we can use gradient if not present
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: number) => void
    clearCart: () => void
    isInCart: (id: number) => boolean
    total: number
    cartCount: number
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage whenever items change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addItem = (item: CartItem) => {
        if (!isInCart(item.id)) {
            setItems(prev => [...prev, item])
            setIsCartOpen(true) // Open cart when item added
        }
    }

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const clearCart = () => {
        setItems([])
    }

    const isInCart = (id: number) => {
        return items.some(item => item.id === id)
    }

    const total = items.reduce((sum, item) => sum + item.price + (item.registrationFee || 0), 0)
    const cartCount = items.length

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            clearCart,
            isInCart,
            total,
            cartCount,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
