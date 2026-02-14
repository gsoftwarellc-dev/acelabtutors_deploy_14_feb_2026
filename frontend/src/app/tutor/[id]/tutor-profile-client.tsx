"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, MapPin, Share2, ShieldCheck, BookOpen, GraduationCap } from "lucide-react";
import { BookingModal } from "@/components/features/booking-modal";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/mock-data";

type TutorProfileClientProps = {
  tutor: User;
};

export function TutorProfileClient({ tutor }: TutorProfileClientProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/student/tutors" className="text-sm text-slate-500 hover:text-slate-900">
        &larr; Back to Tutors
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400 mx-auto md:mx-0">
              {tutor.name.charAt(0)}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{tutor.name}</h1>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Share2 size={16} className="mr-2" /> Share
                </Button>
              </div>
            </div>

            <p className="text-lg text-slate-600 mb-4">{tutor.bio}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                <ShieldCheck size={14} className="mr-1" /> Verified Tutor
              </span>
              <span className="flex items-center">
                <Star size={16} className="text-yellow-500 mr-1" fill="currentColor" />
                <span className="font-bold text-slate-900 mr-1">{tutor.rating}</span> (42 reviews)
              </span>
              <span className="flex items-center">
                <MapPin size={16} className="mr-1" /> London, UK (Online)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {tutor.subjects?.map((subject) => (
                <span
                  key={subject}
                  className="px-3 py-1 bg-slate-100 rounded-md text-sm font-medium text-slate-700"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <BookOpen size={20} className="mr-2 text-primary" /> About Layout
            </h3>
            <p className="text-slate-600 leading-relaxed">
              I am a dedicated tutor with a passion for helping students achieve their academic goals. With a
              structured yet flexible teaching style, I ensure that every lesson is tailored to the student&apos;s
              needs. Whether you are struggling with the basics or aiming for an A*, I can help you bridge the gap.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <GraduationCap size={20} className="mr-2 text-primary" /> Education & Experience
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="h-2 w-2 mt-2 rounded-full bg-slate-300"></div>
                <div>
                  <p className="font-medium text-slate-900">PhD in Relevant Subject</p>
                  <p className="text-sm text-slate-500">University of Cambridge • 2018 - 2022</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="h-2 w-2 mt-2 rounded-full bg-slate-300"></div>
                <div>
                  <p className="font-medium text-slate-900">Certified Tutor</p>
                  <p className="text-sm text-slate-500">National Tutoring Association • 2020</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Booking */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <div className="mb-6">
              <span className="text-3xl font-bold text-slate-900">£{tutor.hourlyRate}</span>
              <span className="text-slate-500">/hour</span>
            </div>

            <div className="space-y-4">
              <Button className="w-full h-12 text-lg" onClick={() => setIsBookingOpen(true)}>
                Book a Session
              </Button>

            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Free cancellation up to 24 hours before the session.
            </p>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        tutorName={tutor.name}
        rate={tutor.hourlyRate || 0}
      />
    </div>
  );
}
