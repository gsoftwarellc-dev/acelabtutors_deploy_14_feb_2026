"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface GoogleConnectButtonProps {
    onConnectionChange?: (connected: boolean) => void
}

export default function GoogleConnectButton({ onConnectionChange }: GoogleConnectButtonProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [googleEmail, setGoogleEmail] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)

    useEffect(() => {
        checkGoogleStatus()
    }, [])

    const checkGoogleStatus = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${apiUrl}/api/google/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (res.ok) {
                const data = await res.json()
                setIsConnected(data.connected)
                setGoogleEmail(data.google_email)
                onConnectionChange?.(data.connected)
            }
        } catch (error) {
            console.error('Failed to check Google status:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnect = async () => {
        try {
            setIsConnecting(true)
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${apiUrl}/api/google/connect`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (res.ok) {
                const data = await res.json()
                window.location.href = data.auth_url
            }
        } catch (error) {
            console.error('Failed to connect Google:', error)
        } finally {
            setIsConnecting(false)
        }
    }

    const handleDisconnect = async () => {
        try {
            setIsLoading(true)
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${apiUrl}/api/google/disconnect`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            })

            if (res.ok) {
                setIsConnected(false)
                onConnectionChange?.(false)
            } else {
                console.error('Failed to disconnect Google account')
            }
        } catch (error) {
            console.error('Failed to disconnect Google:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking Google account...
            </div>
        )
    }

    if (isConnected) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                        <Check className="h-4 w-4" />
                        Google account connected
                    </div>
                    {googleEmail && (
                        <div className="text-xs text-green-600/80 ml-6">
                            {googleEmail}
                        </div>
                    )}
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-700 hover:text-green-800"
                        >
                            Disconnect
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will disconnect your Google account. You will no longer be able to host live classes using Google Meet until you reconnect.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDisconnect}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Disconnect
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )
    }

    return (
        <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
                <span className="text-orange-700">
                    Connect your Google account to create real meeting links
                </span>
                <Button
                    size="sm"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-orange-600 hover:bg-orange-700 ml-4"
                >
                    {isConnecting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        "Connect Google"
                    )}
                </Button>
            </AlertDescription>
        </Alert>
    )
}

