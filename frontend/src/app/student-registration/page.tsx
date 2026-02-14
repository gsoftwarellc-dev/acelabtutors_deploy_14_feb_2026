import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function StudentRegistrationPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
                <div className="text-center max-w-2xl px-4">
                    <p className="text-slate-600 font-medium text-lg leading-relaxed">
                        Please select the type of class you would like to register for.
                    </p>
                </div>

                <div className="container mx-auto grid grid-cols-1 gap-8 max-w-3xl">
                    {/* Paid Classes Card */}
                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white group hover:scale-[1.02] transition-transform duration-300">
                        {/* Blue Top Border */}
                        <div className="h-2 bg-[#3b82f6] w-full" />
                        <CardContent className="p-10 flex flex-col h-full items-center text-center">
                            <h2 className="text-3xl font-bold text-slate-800 mb-4">Paid Classes</h2>
                            <p className="text-slate-500 mb-2">
                                Comprehensive tutoring 3 days a week.
                            </p>
                            <p className="text-sm font-semibold text-blue-600 mb-10 bg-blue-50 px-4 py-2 rounded-full inline-block">
                                11:00 a.m. to 4:00 p.m.
                            </p>

                            <ul className="space-y-4 mb-12 text-left w-full max-w-[240px] mx-auto">
                                {[
                                    "Maths",
                                    "English Language",
                                    "Verbal Reasoning",
                                    "Non-Verbal Reasoning",
                                    "Physics",
                                    "Chemistry",
                                    "Biology",
                                    "Further Maths"
                                ].map((subject) => (
                                    <li key={subject} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <Check className="text-green-500 h-5 w-5 shrink-0" />
                                        <span>{subject}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto w-full">
                                <Link href="/register-paid">
                                    <Button className="w-full bg-[#3182ce] hover:bg-[#2c5282] text-white font-bold py-6 rounded-lg uppercase tracking-wide">
                                        REGISTER FOR PAID CLASSES
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kingdom Children Classes Card */}
                    <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white group hover:scale-[1.02] transition-transform duration-300">
                        {/* Green Top Border */}
                        <div className="h-2 bg-[#38a169] w-full" />
                        <CardContent className="p-10 flex flex-col h-full items-center text-center">
                            <h2 className="text-3xl font-bold text-slate-800 mb-4">Kingdom Children Classes</h2>
                            <p className="text-slate-500 mb-10 min-h-[48px]">
                                The free classes are on Saturdays only. Classes are held twice a month.
                            </p>

                            <ul className="space-y-4 mb-12 text-left w-full max-w-[200px] mx-auto">
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check className="text-green-500 h-5 w-5 shrink-0" />
                                    <span>Physics</span>
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check className="text-green-500 h-5 w-5 shrink-0" />
                                    <span>Mathematics</span>
                                </li>
                                {/* Adding spacer to keep bottom alignment consistent */}
                                <li className="invisible h-5">Spacer</li>
                            </ul>

                            <div className="mt-auto w-full">
                                <Link href="/register-free">
                                    <Button className="w-full bg-[#3182ce] hover:bg-[#2c5282] text-white font-bold py-6 rounded-lg uppercase tracking-wide">
                                        REGISTER FOR KINGDOM CHILDREN CLASSES
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="py-8 border-t bg-white">
                <div className="container mx-auto px-4 text-center text-sm text-slate-400 font-medium">
                    © {new Date().getFullYear()} Acelab Tutors. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
