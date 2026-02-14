
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X, Loader2 } from "lucide-react"
import api from "@/lib/api"

interface PriceEditorProps {
    courseId: number
    initialPrice: number
    initialRegistrationFee?: number
    onUpdate: (newPrice: number, newRegistrationFee: number) => void
}

export function PriceEditor({ courseId, initialPrice, initialRegistrationFee, onUpdate }: PriceEditorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [price, setPrice] = useState(initialPrice?.toString() || "0")
    const [registrationFee, setRegistrationFee] = useState(initialRegistrationFee?.toString() || "0")
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        try {
            const { data } = await api.put(`/admin/courses/${courseId}/price`, {
                price: parseFloat(price),
                registration_fee: parseFloat(registrationFee)
            })
            onUpdate(data.price, data.registration_fee)
            setIsEditing(false)
        } catch (error) {
            console.error("Failed to update price", error)
        } finally {
            setLoading(false)
        }
    }


    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <div className="relative w-20">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">£</span>
                    <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-8 pl-5 text-[10px] pr-1"
                        min="0"
                        placeholder="Price"
                    />
                </div>
                <div className="relative w-20">
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">Reg: £</span>
                    <Input
                        type="number"
                        value={registrationFee}
                        onChange={(e) => setRegistrationFee(e.target.value)}
                        className="h-8 pl-9 text-[10px] pr-1"
                        min="0"
                        placeholder="Reg Fee"
                    />
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 bg-green-50 shrink-0" onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check size={14} />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-slate-600 shrink-0" onClick={() => setIsEditing(false)} disabled={loading}>
                    <X size={14} />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1 group cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900">£{initialPrice || 0}</span>
                <Edit2 size={10} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {initialRegistrationFee ? initialRegistrationFee > 0 && (
                <div className="text-[10px] text-slate-500 font-medium">
                    + £{initialRegistrationFee} Reg. Fee
                </div>
            ) : null}
        </div>
    )
}
