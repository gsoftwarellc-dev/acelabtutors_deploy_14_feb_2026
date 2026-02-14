"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Loader2, Printer, CheckCircle, Download } from "lucide-react"
import { useCart } from "@/context/cart-context"

interface OrderItem {
    name: string
    price: number
    year?: string
}

interface OrderDetails {
    order_id: string | number
    payment_intent_id?: string
    date: string
    total_amount: number
    currency: string
    buyer_name: string
    buyer_phone: string
    items?: OrderItem[]
    items_description?: string
    status: string
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('session_id')
    const [order, setOrder] = useState<OrderDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const { clearCart } = useCart()

    useEffect(() => {
        if (!sessionId) {
            router.push('/')
            return
        }

        // Clear cart on successful return
        clearCart()

        const fetchOrder = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/api/student/order-details?session_id=${sessionId}`)

                if (!res.ok) {
                    throw new Error("Failed to fetch order details")
                }

                const data = await res.json()
                setOrder(data)
            } catch (err) {
                console.error(err)
                setError("Could not retrieve order details. Please contact support if you have been charged.")
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId])

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                    <p className="text-slate-600 max-w-md">{error}</p>
                    <Button className="mt-6" onClick={() => router.push('/')}>Return Home</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
            <div className="print:hidden">
                <Navbar />
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 print:p-0">
                <div className="max-w-3xl mx-auto">
                    {/* Success Message - Hidden in Print */}
                    <div className="text-center mb-8 print:hidden">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Thank you for your order!</h1>
                        <p className="text-slate-500 mt-2">A confirmation email has been sent to you.</p>

                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                                <Printer size={16} /> Print Invoice
                            </Button>
                            <Button onClick={() => router.push('/courses')} className="flex items-center gap-2">
                                Continue Browsing
                            </Button>
                        </div>
                    </div>

                    {/* Invoice Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
                        {/* Invoice Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/logo_main.png" alt="Acelab Tutors" className="h-12 w-auto object-contain" />
                                </div>
                                <div className="text-sm text-slate-500 space-y-1">
                                    <p>123 Education Lane</p>
                                    <p>London, UK</p>
                                    <p>support@acelabtutors.com</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide mb-1">Invoice</h2>
                                <p className="text-sm text-slate-500">#{order?.order_id}</p>
                                <div className="mt-4 text-sm">
                                    <p className="text-slate-500">Date Issued:</p>
                                    <p className="font-medium text-slate-900">{order?.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="p-8 border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bill To</h3>
                            <div className="text-slate-900 font-medium">{order?.buyer_name}</div>
                            {order?.buyer_phone && <div className="text-slate-600 text-sm">{order?.buyer_phone}</div>}
                        </div>

                        {/* Line Items */}
                        <div className="p-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items</h3>
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-3 font-semibold text-slate-900">Description</th>
                                        <th className="py-3 font-semibold text-slate-900">Year Group</th>
                                        <th className="py-3 font-semibold text-slate-900 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order?.items && order.items.length > 0 ? (
                                        order.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-4 text-slate-700">
                                                    <span className="font-medium text-slate-900 block">{item.name}</span>
                                                    {/* Optional: Add instructor or other details if available */}
                                                </td>
                                                <td className="py-4">
                                                    {item.year ? (
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium border border-indigo-100">
                                                            {item.year}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">N/A</span>
                                                    )}
                                                </td>
                                                <td className="py-4 text-slate-900 text-right font-medium">£{Number(item.price).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="py-4 text-slate-700" colSpan={2}>{order?.items_description || 'Course Purchase'}</td>
                                            <td className="py-4 text-slate-900 text-right font-medium">£{Number(order?.total_amount).toFixed(2)}</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td className="pt-6 font-medium text-slate-500"></td>
                                        <td className="pt-6 text-right font-medium text-slate-500">Total</td>
                                        <td className="pt-6 text-right font-bold text-2xl text-slate-900">£{Number(order?.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-8 text-center text-xs text-slate-500 border-t border-slate-100">
                            <p>Thank you for choosing Acelab Tutors.</p>
                            <p className="mt-1">For any questions, please contact us at support@acelabtutors.com</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    )
}
