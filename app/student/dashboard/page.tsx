'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, Video, Play, FileText, UploadCloud, 
  CheckCircle2, Clock, ShieldCheck, LogOut, ExternalLink, 
  Sparkles, AlertCircle, BookOpen, User, Phone, Check, Loader2
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'recordings' | 'materials' | 'slip'>('overview');

  // Database Data States
  const [courses, setCourses] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  // Active Video Modal State
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Slip Upload States
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipSubmitting, setSlipSubmitting] = useState(false);
  const [slipSuccess, setSlipSuccess] = useState(false);

  useEffect(() => {
    // 1. Session Check
    const stored = localStorage.getItem('lms_demo_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);

    // 2. Fetch Data from Supabase Demo Database
    const fetchStudentData = async () => {
      try {
        // Fetch courses
        const { data: coursesData } = await supabase.from('courses').select('*');
        if (coursesData) setCourses(coursesData);

        // Fetch live classes
        const { data: liveData } = await supabase.from('live_classes').select('*').order('date', { ascending: true });
        if (liveData) setLiveClasses(liveData);

        // Fetch recordings
        const { data: recData } = await supabase.from('recordings').select('*').order('created_at', { ascending: false });
        if (recData) setRecordings(recData);

        // Fetch materials
        const { data: matData } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
        if (matData) setMaterials(matData);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [router]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('lms_demo_user');
    router.push('/login');
  };

  // Demo Slip Upload Submission
  const handleSlipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlipSubmitting(true);

    try {
      // Demo Supabase Slip Record
      await supabase.from('slips').insert([{
        student_id: user.id,
        course_id: courses[0]?.id || 1,
        student_name: user.fullName,
        student_username: user.username,
        student_phone: user.phone || '0770000000',
        course_name: courses[0]?.title || 'A/L Combined Maths - 2026',
        amount: courses[0]?.monthly_fee || 3000,
        slip_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
        status: 'pending'
      }]);

      setSlipSuccess(true);
      setSlipFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSlipSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span>Student Portal එක සූදානම් වෙමින් පවතී...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070b14]/85 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-purple-600/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">Smart Tuition LMS</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Student Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Pill */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0c1322] border border-slate-800 text-xs">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-slate-200">{user?.fullName}</span>
              <span className="font-mono text-[10px] text-slate-400">({user?.username})</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Device Lock & Status Notification Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-[#0c1322] to-emerald-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white flex items-center gap-2">
                Single Device Locking Active
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Verified</span>
              </h2>
              <p className="text-[11px] text-slate-400">ඔබගේ ගිණුම මෙම උපාංගයට (Device) ආරක්ෂිතව සම්බන්ධ කර ඇත.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Current Month: Paid
            </span>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'පන්ති විස්තර (Classes)', icon: BookOpen },
            { id: 'recordings', label: 'පසුගිය Recordings', icon: Play },
            { id: 'materials', label: 'නිබන්ධන (Tutes)', icon: FileText },
            { id: 'slip', label: 'ගාස්තු ගෙවීම් (Bank Slip)', icon: UploadCloud }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & LIVE ZOOM CLASS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Live Class Hero Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1322] to-[#131c31] border border-purple-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Upcoming Live Class
                </span>
                <span className="text-xs text-slate-400 font-mono">Zoom Integrated</span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {liveClasses[0]?.title || 'Calculus & Integration Discussion'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">A/L Combined Maths - 2026 Theory Masterclass</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 bg-[#070b14] px-3 py-1.5 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> දිනය: {liveClasses[0]?.date || 'හෙට දින'}
                </span>
                <span className="flex items-center gap-1.5 bg-[#070b14] px-3 py-1.5 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> වේලාව: {liveClasses[0]?.time || '19:00 (රාත්‍රී 7.00)'}
                </span>
              </div>

              <div className="pt-2">
                <a
                  href={liveClasses[0]?.zoom_join_url || 'https://zoom.us'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                >
                  <Video className="w-4 h-4" />
                  <span>1-Click Live Class එකට සම්බන්ධ වන්න</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>

            {/* Enrolled Courses Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ලියාපදිංචි වී ඇති පන්ති පාඨමාලා</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase">{course.category}</span>
                        <h5 className="font-bold text-sm text-white mt-2">{course.title}</h5>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">රු. {course.monthly_fee}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>තත්ත්වය: <strong className="text-emerald-400">Active</strong></span>
                      <button onClick={() => setActiveTab('recordings')} className="text-purple-400 hover:text-purple-300 font-semibold">Recordings බලන්න →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PROTECTED RECORDINGS */}
        {activeTab === 'recordings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">පසුගිය පන්ති වීඩියෝ (Class Recordings)</h3>
                <p className="text-xs text-slate-400">මඟහැරුණු පාඩම් පද්ධතිය තුළින්ම ආරක්ෂිතව නරඹන්න.</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-[#0c1322] border border-slate-800 text-slate-400">
                {recordings.length} Videos Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recordings.map((rec) => (
                <div key={rec.id} className="bg-[#0c1322] border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/40 transition group">
                  {/* Video Thumbnail */}
                  <div 
                    onClick={() => setSelectedVideo(rec.video_id)}
                    className="relative aspect-video bg-slate-900 cursor-pointer flex items-center justify-center overflow-hidden"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${rec.video_id}/hqdefault.jpg`} 
                      alt={rec.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {rec.duration || '2h 10m'}
                    </span>
                  </div>

                  {/* Video Details */}
                  <div className="p-4 space-y-2">
                    <h5 className="font-bold text-xs text-white line-clamp-1">{rec.title}</h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>දිනය: {rec.lesson_date}</span>
                      <button 
                        onClick={() => setSelectedVideo(rec.video_id)}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Play Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TUTES & STUDY MATERIALS */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">නිබන්ධන සහ කෙටි සටහන් (Tutes & Handouts)</h3>
            
            <div className="space-y-3">
              {/* Sample Material Item */}
              <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Unit 01: Complete Theory Tute & Formulas PDF</h5>
                    <p className="text-[11px] text-slate-400 font-mono">PDF • 4.8 MB • Combined Maths 2026</p>
                  </div>
                </div>

                <a
                  href="#download"
                  onClick={(e) => { e.preventDefault(); alert('Demo Download: සැබෑ පද්ධතියේදී මෙතැනින් PDF එක Download වේ.'); }}
                  className="px-4 py-2 rounded-xl bg-[#131c31] hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold transition"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BANK SLIP UPLOAD */}
        {activeTab === 'slip' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">පන්ති ගාස්තු බැංකු රිසිට්පත් Upload කිරීම</h3>
              <p className="text-xs text-slate-400">ඔබගේ Slip පත ඇතුළත් කර ක්ෂණිකව පන්ති Access සක්‍රිය කරගන්න.</p>
            </div>

            {slipSuccess ? (
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">Slip පත සාර්ථකව යොමු කෙරිණි!</h4>
                <p className="text-xs text-slate-300">ගුරුතුමා විසින් එය Approve කළ සැනින් ඔබට WhatsApp පණිවිඩයක් ලැබෙනු ඇත.</p>
                <button 
                  onClick={() => setSlipSuccess(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  තවත් Slip එකක් දමන්න
                </button>
              </div>
            ) : (
              <form onSubmit={handleSlipSubmit} className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">පන්තිය (Course)</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white">
                    <option>A/L Combined Maths - 2026 Theory (රු. 3,000)</option>
                    <option>O/L Science - Revision Masterclass (රු. 2,000)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">බැංකු රිසිට්පත (Photo / Screenshot)</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition">
                    <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-semibold">Slip පත තෝරන්න හෝ මෙතැනට ඇද දමන්න</p>
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, PDF උපරිම 5MB</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={slipSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  {slipSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Upload වෙමින් පවතී...</span>
                    </>
                  ) : (
                    <span>Slip පත තහවුරු කිරීමට යොමු කරන්න</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

      </main>

      {/* 3. VIDEO PLAYER POPUP MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-[#0c1322] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Protected Player Session
              </span>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-white text-xs font-mono font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&modestbranding=1&rel=0`}
                title="LMS Protected Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-[11px] text-slate-500">
        Smart Tuition LMS Platform • Student Session Verified
      </footer>

    </div>
  );
}