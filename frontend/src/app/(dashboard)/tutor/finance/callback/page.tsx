"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function StripeCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
    const [message, setMessage] = useState("Connecting your account...")
    const processedRef = useRef(false)

    useEffect(() => {
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        if (processedRef.current) return
        processedRef.current = true

        if (error) {
            setStatus('error')
            setMessage("Stripe connection was denied or failed.")
            return
        }

        if (code) {
            connectStripe(code)
        } else {
            setStatus('error')
            setMessage("Invalid callback parameters.")
        }
    }, [searchParams])

    const connectStripe = async (code: string) => {
        try {
            await api.post('/tutor/finance/connect', { code })
            setStatus('success')
            setMessage("Your account has been successfully connected!")
            setTimeout(() => {
                router.push('/tutor/earnings')
            }, 2000)
        } catch (error: any) {
            console.error("Connect error:", error)
            setStatus('error')
            setMessage(error.response?.data?.message || "Failed to connect Stripe account.")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            {status === 'processing' && (
                <>
                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Connecting to Stripe</h1>
                    <p className="text-slate-600">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Connected!</h1>
                    <p className="text-slate-600 mb-4">{message}</p>
                    <p className="text-sm text-slate-400">Redirecting to earnings...</p>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Connection Failed</h1>
                    <p className="text-slate-600 mb-6">{message}</p>
                    <Button onClick={() => router.push('/tutor/earnings')}>
                        Return to Earnings
                    </Button>
                </>
            )}
        </div>
    )
}
