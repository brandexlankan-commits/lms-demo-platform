'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, ShieldCheck, Users, Video, 
  ArrowRight, Sparkles, CheckCircle2, Lock, Smartphone 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 backdrop-blur-md bg-[#070b14]/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-purple-600/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">Smart Tuition LMS</span>
              <span className="text-[10px] text-purple-400 font-semibold">Interactive Live Demo</span>
            </div>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/25 flex items-center gap-1.5"
          >
            <span>Login පිටුවට</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>ගුරුවරුන් සහ උපකාරක පන්ති සඳහාම වෙන්වූ නවීන LMS විසඳුම</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          පන්ති කළමනාකරණය ස්වයංක්‍රීය කරන <br />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Smart Tuition Platform
          </span>
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Single Device Protection, 1-Click Zoom Classes, ආරක්ෂිත YouTube Recordings, බැංකු රිසිට්පත් අනුමත කිරීම් (Slip Approvals) සහ WhatsApp Automation සහිත සම්පූර්ණ පද්ධතිය සජීවීව පරීක්ෂා කර බලන්න.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition shadow-xl shadow-purple-600/30 flex items-center gap-2"
          >
            <span>Demo එක පරීක්ෂා කරන්න (Login)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/register"
            className="px-6 py-3.5 rounded-2xl bg-[#0c1322] hover:bg-[#131c31] border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2"
          >
            <span>ශිෂ්‍ය ලියාපදිංචිය (Self-Register)</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          
          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="font-bold text-xs text-white">Single Device Protection</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              එක් ගිණුමකින් එක් උපාංගයකට පමණක් Login විය හැකි වන පරිදි Account Sharing සම්පූර්ණයෙන්ම වළකයි.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Video className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="font-bold text-xs text-white">Protected Video Recordings</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              YouTube Unlisted වීඩියෝ ලින්ක් පිටතට නොපෙනෙන පරිදි පද්ධතිය තුළින් පමණක් ආරක්ෂිතව ධාවනය වේ.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-xs text-white">1-Click Slip Approvals</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              සිසුන් දමන බැංකු රිසිට්පත් පරිපාලකවරයාට පහසුවෙන් Verify කර තනි ක්ලික් එකකින් පන්ති Access ලබාදිය හැක.
            </p>
          </div>

        </div>

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-[11px] text-slate-500">
        Smart Tuition LMS Platform © 2026 • Live Demonstration Environment
      </footer>

    </div>
  );
}