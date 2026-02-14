"use client"

import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Star, ChevronLeft } from "lucide-react"
import Link from "next/link"

const TUTORS = [
    {
        id: 4,
        name: "Anita Oddiri",
        role: "Director, AceLab Tutors",
        image: "/tutors/anita.jpg",
        education: [
            { degree: "Bsc in Mass Communication", institution: "Nnamdi Azikiwe University, Akwa Anambra state" },
            { degree: "Bsc in Midwifery", institution: "Middlesex University Hendon" },
            { degree: "Master's in Public Administration", institution: "University of Benin" }
        ]
    },
    {
        id: 6,
        name: "Mrs. Oma E",
        role: "Branch Manager / Tutor",
        image: "/tutors/oma.jpg",
        education: [
            { degree: "BSc in Applied Biochemistry", institution: "Nnamdi Azikiwe University, Akwa, Anambra State, Nigeria" },
            { degree: "MSc in Chemistry", institution: "University of Benin, Edo state, Nigeria" },
            { degree: "PhD Industrial Chemistry (In View)", institution: "Federal University of Petroleum Resources Effurun, Delta State Nigeria" }
        ]
    },
    {
        id: 5,
        name: "Mr. Prince E.",
        role: "Technical Director (IT dept)",
        image: "/tutors/prince.jpg",
        education: [
            { degree: "BSc in Computer Science", institution: "University of Benin (Uniben)" },
            { degree: "Postgraduate Diploma in Computer Science", institution: "Federal University of Petroleum Resources Effurun (FUPRE)" }
        ]
    },
    {
        id: 7,
        name: "Mrs. Faith E",
        role: "Tutor",
        image: "/tutors/faith.jpg",
        education: [
            { degree: "Bsc in Microbiology", institution: "" },
            { degree: "Masters in Microbiology", institution: "" }
        ]
    },
    {
        id: 8,
        name: "Miss Rul Oddiri",
        role: "Admin",
        image: "/tutors/rul.jpg",
        education: []
    },
    {
        id: 2,
        name: "Mrs. Cynthia D",
        role: "Physics Tutor",
        image: "/tutors/Cynthia.PNG",
        education: [
            { degree: "M.Sc (Energy and Petroleum Studies)", institution: "" },
            { degree: "Post Graduate Diploma in Education (PGDE)", institution: "Registration Council Nigeria" },
            { degree: "B.Sc Geophysics", institution: "" }
        ]
    },
    {
        id: 3,
        name: "Mr. Ben",
        role: "Mathematics Tutor",
        image: "/tutors/Ben.PNG",
        education: [
            { degree: "PhD in Applied Mathematics", institution: "" },
            { degree: "M.Sc Applied Mathematics", institution: "" },
            { degree: "Post Graduate Diploma in Education (PGDE)", institution: "" },
            { degree: "B.Sc Mathematics", institution: "" }
        ]
    },
    {
        id: 1,
        name: "Mr. Emuobo O",
        role: "Chemistry Tutor",
        image: "/tutors/EMUOBO_OYAGBARHA.PNG",
        education: [
            { degree: "Master of Science (M.Sc) in Chemistry", institution: "Lagos State University, Lagos, Nigeria" },
            { degree: "Post Graduate Diploma in Education (PGDE)", institution: "University of Port-Harcourt, Rivers, Choba, Nigeria" },
            { degree: "Bachelor of Science (B.Sc) in Chemistry", institution: "Delta State University, Delta, Abraka, Nigeria" }
        ]
    }
]

export default function TutorsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-1 pb-20">
                {/* Header Section */}
                <div className="py-12 px-4 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Meet Our Tutors</h1>
                    <p className="text-slate-600">Our highly qualified and dedicated teaching staff.</p>
                </div>

                {/* Tutors List */}
                <div className="px-4">
                    <div className="container mx-auto max-w-5xl space-y-6">
                        {TUTORS.map((tutor) => (
                            <Card key={tutor.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Image Section */}
                                        <div className="w-full md:w-64 shrink-0">
                                            <div className="aspect-[1/1] md:aspect-[4/5] relative rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={tutor.image}
                                                    alt={tutor.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 pt-2">
                                            <div className="mb-5">
                                                <h2 className="text-xl font-bold text-[#e11d48] tracking-tight">{tutor.name}</h2>
                                                {tutor.role && <p className="text-slate-600 text-[13px] font-medium mt-1">{tutor.role}</p>}
                                            </div>

                                            {tutor.education.length > 0 && (
                                                <div className="bg-[#f9fafb] p-5 rounded-lg border-l-[3px] border-[#ef4444] shadow-sm">
                                                    <h3 className="text-[13px] font-bold text-slate-900 mb-4 tracking-tight uppercase">
                                                        Education & Qualifications
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {tutor.education.map((edu, idx) => (
                                                            <div key={idx} className="flex flex-col">
                                                                <p className="font-bold text-[13px] text-slate-800 leading-tight">{edu.degree}</p>
                                                                {edu.institution && (
                                                                    <p className="text-[11px] text-slate-500 mt-1">{edu.institution}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
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

