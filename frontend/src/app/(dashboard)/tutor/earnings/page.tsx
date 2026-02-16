"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Calendar, Loader2, ArrowDownRight, Banknote, CreditCard, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Transaction {
    id: number
    amount: string
    method: string
    reference: string | null
    note: string | null
    payment_date: string
    created_at: string
    paid_by_admin?: {
        id: number
        name: string
    } | null
}

export default function TutorEarningsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        this_month: 0,
        last_month: 0,
    })
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        fetchEarnings()
    }, [])

    const fetchEarnings = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.acelabtutors.co.uk'
            const res = await fetch(`${apiUrl}/api/tutor/earnings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data.stats)
                setTransactions(data.transactions.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch earnings:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return `£${amount.toFixed(2)}`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const getMethodBadge = (method: string) => {
        const styles: Record<string, { label: string; className: string }> = {
            bank_transfer: { label: 'Bank Transfer', className: 'bg-blue-100 text-blue-700 border-blue-200' },
            cash: { label: 'Cash', className: 'bg-green-100 text-green-700 border-green-200' },
            cheque: { label: 'Cheque', className: 'bg-amber-100 text-amber-700 border-amber-200' },
            other: { label: 'Other', className: 'bg-slate-100 text-slate-700 border-slate-200' },
        }
        const style = styles[method] || styles.other
        return <Badge variant="outline" className={style.className}>{style.label}</Badge>
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Earnings</h1>
                <p className="text-slate-600">Track your payment history</p>
            </div>

            {/* Earnings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Total Received</h3>
                        <DollarSign size={20} />
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(stats.total)}</p>
                    <p className="text-xs opacity-75 mt-1">All time</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">This Month</h3>
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(stats.this_month)}</p>
                    <p className="text-xs opacity-75 mt-1">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg shadow-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold opacity-90">Last Month</h3>
                        <Calendar size={20} />
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(stats.last_month)}</p>
                    <p className="text-xs opacity-75 mt-1">
                        {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Receipt size={20} className="text-slate-400" />
                        Transaction History
                    </h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Banknote size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No transactions yet</p>
                        <p className="text-slate-400 text-sm mt-1">Payment records will appear here once admin processes payments.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((txn) => (
                                <TableRow key={txn.id}>
                                    <TableCell className="font-medium">
                                        {formatDate(txn.payment_date)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-emerald-600">
                                            +{formatCurrency(parseFloat(txn.amount))}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {getMethodBadge(txn.method)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {txn.reference || '—'}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
                                        {txn.note || '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
