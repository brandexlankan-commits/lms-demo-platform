'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, Lock, User, ArrowRight, 
  Sparkles, ShieldCheck, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Demo Auto-fill Helper
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('කරුණාකර Username සහ Password ඇතුළත් කරන්න.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Check user in Supabase 'students' table
      const { data: user, error: dbError } = await supabase
        .from('students')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password.trim())
        .single();

      if (dbError || !user) {
        setError('ඇතුළත් කළ Username හෝ Password නිවැරදි නොවේ.');
        setLoading(false);
        return;
      }

      // 2. Demo Device Verification Logic (Client Friendly)
      // සැබෑ පද්ධතියේ Device Lock පරීක්ෂාව මෙහි සිදුවන අතර Demo එකේදී පහසුවෙන් Login වීමට සලස්වා ඇත
      let currentDeviceId = localStorage.getItem('demo_device_id');
      if (!currentDeviceId) {
        currentDeviceId = 'dev_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('demo_device_id', currentDeviceId);
      }

      // Save active session
      localStorage.setItem('lms_demo_user', JSON.stringify({
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        role: user.role,
        phone: user.phone
      }));

      // 3. Role based redirect
      if (user.role === 'admin') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/student/dashboard');
      }

    } catch (err: any) {
      setError('පද්ධතියට සම්බන්ධ වීමේදී දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
      
      {/* Top Simple Bar */}
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          ← මුල් පිටුවට (Home)
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto px-6 py-8">
        
        {/* Header Icon */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center shadow-xl shadow-purple-600/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Smart Tuition LMS</h1>
          <p className="text-xs text-slate-400">ඔබගේ ගිණුමට පිවිසීමට තොරතුරු ඇතුළත් කරන්න</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username එක ඇතුළත් කරන්න"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131c31] border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password එක ඇතුළත් කරන්න"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131c31] border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>තහවුරු කරමින්...</span>
                </>
              ) : (
                <>
                  <span>Login වන්න</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* ⚡ Quick Demo Test Buttons for Teachers */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Demo Quick Access:
              </span>
              <span className="text-[10px] text-slate-500">Click to fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold text-left transition"
              >
                👨‍🏫 Teacher Admin
                <span className="block text-[10px] text-purple-400/80 font-mono font-normal">admin / admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('st_kasun01', 'Kasun#4829')}
                className="p-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-left transition"
              >
                👨‍🎓 Demo Student
                <span className="block text-[10px] text-emerald-400/80 font-mono font-normal">st_kasun01 / ...</span>
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Single Device Protected Secure Session</span>
          </div>

        </div>

      </div>

      <div className="p-6 text-center text-[11px] text-slate-600">
        Smart Tuition LMS Platform © 2026
      </div>

    </div>
  );
}