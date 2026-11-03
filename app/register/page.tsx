'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, User, Phone, Lock, BookOpen, 
  ArrowRight, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load available classes for selection
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setCourses(data);
        setSelectedCourseId(data[0].id);
      }
    };
    fetchCourses();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !username || !password) {
      setError('කරුණාකර අනිවාර්ය තොරතුරු සියල්ල සම්පූර්ණ කරන්න.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check if username already taken
      const { data: existingUser } = await supabase
        .from('students')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .maybeSingle();

      if (existingUser) {
        setError('මෙම Username එක දැනටමත් භාවිතයේ පවතී. කරුණාකර වෙනත් නමක් යොදන්න.');
        setLoading(false);
        return;
      }

      // 2. Create student record
      const { data: newStudent, error: createError } = await supabase
        .from('students')
        .insert([{
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          phone: phone.trim() || '0770000000',
          password: password.trim(),
          role: 'student'
        }])
        .select()
        .single();

      if (createError || !newStudent) {
        setError(createError?.message || 'ලියාපදිංචි වීමේදී දෝෂයක් ඇතිවිය.');
        setLoading(false);
        return;
      }

      // 3. Enroll to selected course
      if (selectedCourseId) {
        await supabase.from('enrollments').insert([{
          student_id: newStudent.id,
          course_id: selectedCourseId,
          status: 'active',
          is_paid_current_month: false,
          month_status_text: 'Pending Payment'
        }]);
      }

      // 4. Save session and auto-login to Student Dashboard
      localStorage.setItem('lms_demo_user', JSON.stringify({
        id: newStudent.id,
        fullName: newStudent.full_name,
        username: newStudent.username,
        role: newStudent.role,
        phone: newStudent.phone
      }));

      router.push('/student/dashboard');

    } catch (err: any) {
      setError('දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between selection:bg-purple-500 selection:text-white font-sans">
      
      <div className="p-6">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          ← ආපසු Login පිටුවට
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto px-6 py-6">
        
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center shadow-xl shadow-purple-600/25">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white">ශිෂ්‍ය ලියාපදිංචිය (Student Registration)</h1>
          <p className="text-xs text-slate-400">ඔබගේ විස්තර ඇතුළත් කර පන්ති සඳහා ලියාපදිංචි වන්න</p>
        </div>

        <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">සම්පූර්ණ නම (Full Name)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="උදා: කසුන් පෙරේරා"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="st_kasun"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">WhatsApp අංකය (Phone)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">සම්බන්ධ වන පන්තිය (Select Course)</label>
              <div className="relative">
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (රු. {c.monthly_fee})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ලියාපදිංචි වෙමින් පවතී...</span>
                </>
              ) : (
                <>
                  <span>ලියාපදිංචි වී පිවිසෙන්න</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/login" className="text-xs text-slate-400 hover:text-purple-400 transition">
              දැනටමත් ගිණුමක් තිබේද? <strong className="text-purple-400 underline">Login වන්න</strong>
            </Link>
          </div>

        </div>

      </div>

      <div className="p-4 text-center text-[11px] text-slate-600">
        Smart Tuition LMS Platform © 2026
      </div>

    </div>
  );
}