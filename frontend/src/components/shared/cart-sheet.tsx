"use client"

import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, ShoppingCart, Loader2, User, Phone } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function CartSheet() {
    const { items, removeItem, total, isCartOpen, setIsCartOpen, clearCart } = useCart()
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [buyerName, setBuyerName] = useState("")
    const [buyerPhone, setBuyerPhone] = useState("")
    const router = useRouter()

    const handleCheckout = async () => {
        if (!buyerName.trim() || !buyerPhone.trim()) {
            alert("Please enter your full name and phone number.")
            return
        }

        setIsCheckingOut(true)
        setIsCheckingOut(true)
        try {
            const token = localStorage.getItem('token')
            // if (!token) {
            //     router.push('/login?callbackUrl=/courses')
            //     return
            // }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const response = await fetch(`${apiUrl}/api/student/checkout`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    items: items.map(item => ({ id: item.id })),
                    buyer_name: buyerName.trim(),
                    buyer_phone: buyerPhone.trim(),
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.url) {
                    window.location.href = data.url
                } else {
                    console.error("No checkout URL returned")
                }
            } else {
                console.error("Checkout failed")
                const error = await response.json()
                alert(error.message || "Checkout failed. Please try again.")
            }
        } catch (error) {
            console.error("Checkout error", error)
            alert("An error occurred during checkout.")
        } finally {
            setIsCheckingOut(false)
        }
    }

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="w-full sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Your Cart ({items.length})
                    </SheetTitle>
                    <SheetDescription>
                        Review your selected courses before checkout.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <ShoppingCart className="w-16 h-16 opacity-20" />
                            <p>Your cart is empty</p>
                            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                                Browse Courses
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                    {/* Thumbnail Placeholder */}
                                    <div className={`w-20 h-20 rounded-lg shrink-0 bg-gradient-to-br ${['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500'][item.id % 2]
                                        }`} />

                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h4>
                                            <p className="text-sm text-slate-500">{item.tutorName}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">£{item.price.toFixed(2)}</span>
                                                {item.registrationFee ? (
                                                    <span className="text-[10px] text-slate-400">+ £{item.registrationFee.toFixed(2)} Reg. Fee</span>
                                                ) : null}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        {/* Buyer Info Fields */}
                        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Details</p>
                            <div className="space-y-2">
                                <Label htmlFor="buyer-name" className="text-sm font-medium text-slate-700">Full Name *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input
                                        id="buyer-name"
                                        placeholder="Enter your full name"
                                        className="pl-10"
                                        value={buyerName}
                                        onChange={(e) => setBuyerName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="buyer-phone" className="text-sm font-medium text-slate-700">Phone Number *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input
                                        id="buyer-phone"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        className="pl-10"
                                        value={buyerPhone}
                                        onChange={(e) => setBuyerPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>£{total.toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full h-12 text-base"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isCheckingOut || !buyerName.trim() || !buyerPhone.trim()}
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Checkout • £${total.toFixed(2)}`
                            )}
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            Secure checkout powered by Stripe
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
