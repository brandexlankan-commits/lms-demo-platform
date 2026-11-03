'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, Users, BookOpen, Video, FileText, CheckCircle2, 
  Clock, ShieldCheck, LogOut, Plus, Check, X, Smartphone, 
  MessageSquare, AlertCircle, Loader2, DollarSign, Play, RefreshCw, 
  ExternalLink, Eye, UserPlus
} from 'lucide-react';

export default function TeacherDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slips' | 'students' | 'courses' | 'recordings'>('slips');

  // Database Data States
  const [slips, setSlips] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);

  // Action Loading States
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  // 1. New Recording Modal State
  const [showAddRecModal, setShowAddRecModal] = useState(false);
  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecVideoId, setNewRecVideoId] = useState('');
  const [newRecDuration, setNewRecDuration] = useState('2h 00m');
  const [newRecCourseId, setNewRecCourseId] = useState<number>(1);

  // 2. New Class / Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [newCourseType, setNewCourseType] = useState('Theory');
  const [newCourseFee, setNewCourseFee] = useState('2500');

  // 3. New Student Registration Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentCourseId, setNewStudentCourseId] = useState<number>(1);
  const [studentModalError, setStudentModalError] = useState<string | null>(null);

  // Initial Load & Fetch Data
  const loadDashboardData = async () => {
    try {
      const { data: slipsData } = await supabase
        .from('slips')
        .select('*')
        .order('created_at', { ascending: false });
      if (slipsData) setSlips(slipsData);

      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });
      if (studentsData) setStudents(studentsData);

      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });
      if (coursesData) {
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setNewRecCourseId(coursesData[0].id);
          setNewStudentCourseId(coursesData[0].id);
        }
      }

      const { data: recData } = await supabase
        .from('recordings')
        .select('*, courses(title)')
        .order('created_at', { ascending: false });
      if (recData) setRecordings(recData);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('lms_demo_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(stored);
    if (parsedUser.role !== 'admin') {
      router.push('/student/dashboard');
      return;
    }
    setAdminUser(parsedUser);
    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('lms_demo_user');
    router.push('/login');
  };

  // Slip Approve / Reject Handler
  const handleSlipAction = async (slipId: number, studentId: string, action: 'approved' | 'rejected') => {
    setActionLoadingId(slipId);
    try {
      await supabase.from('slips').update({ status: action }).eq('id', slipId);
      if (action === 'approved') {
        await supabase
          .from('enrollments')
          .update({ is_paid_current_month: true, month_status_text: 'Active for Current Month' })
          .eq('student_id', studentId);
      }
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Device Reset Handler
  const handleResetDevice = async (studentId: string) => {
    setActionLoadingId(studentId);
    try {
      await supabase.from('students').update({ device_id: null }).eq('id', studentId);
      await loadDashboardData();
      alert('ශිෂ්‍යයාගේ Device Lock එක Reset කරන ලදී!');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Class / Course Handler
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseCategory || !newCourseFee) return;

    setActionLoadingId('new_course');
    try {
      const { error } = await supabase.from('courses').insert([{
        title: newCourseTitle.trim(),
        category: newCourseCategory.trim(),
        type: newCourseType,
        monthly_fee: Number(newCourseFee)
      }]);

      if (error) throw error;

      setNewCourseTitle('');
      setNewCourseCategory('');
      setNewCourseFee('2500');
      setShowAddCourseModal(false);
      await loadDashboardData();
      alert('නව පන්තිය සාර්ථකව නිර්මාණය කරන ලදී!');
    } catch (err: any) {
      alert('පන්තිය සෑදීමේදී දෝෂයක් ඇතිවිය: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add / Register Student Handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentModalError(null);

    if (!newStudentName || !newStudentUsername || !newStudentPassword) {
      setStudentModalError('කරුණාකර සියලුම තොරතුරු ඇතුළත් කරන්න.');
      return;
    }

    setActionLoadingId('new_student');
    try {
      // 1. Create Student Profile
      const { data: createdStudent, error: stError } = await supabase.from('students').insert([{
        full_name: newStudentName.trim(),
        username: newStudentUsername.trim().toLowerCase(),
        phone: newStudentPhone.trim() || '0770000000',
        password: newStudentPassword.trim(),
        role: 'student'
      }]).select().single();

      if (stError) {
        if (stError.message.includes('unique')) {
          setStudentModalError('මෙම Username එක දැනටමත් භාවිතයේ පවතී. කරුණාකර වෙනත් නමක් යොදන්න.');
        } else {
          setStudentModalError(stError.message);
        }
        setActionLoadingId(null);
        return;
      }

      // 2. Auto-enroll student into selected course
      if (createdStudent && newStudentCourseId) {
        await supabase.from('enrollments').insert([{
          student_id: createdStudent.id,
          course_id: newStudentCourseId,
          status: 'active',
          is_paid_current_month: false,
          month_status_text: 'Pending Payment'
        }]);
      }

      setNewStudentName('');
      setNewStudentUsername('');
      setNewStudentPhone('');
      setNewStudentPassword('');
      setShowAddStudentModal(false);
      await loadDashboardData();
      alert('ශිෂ්‍යයා සාර්ථකව ලියාපදිංචි කරන ලදී!');
    } catch (err: any) {
      setStudentModalError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Recording Handler
  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecTitle || !newRecVideoId) return;

    setActionLoadingId('new_rec');
    try {
      let finalId = newRecVideoId.trim();
      if (finalId.includes('v=')) {
        finalId = finalId.split('v=')[1]?.split('&')[0];
      } else if (finalId.includes('youtu.be/')) {
        finalId = finalId.split('youtu.be/')[1]?.split('?')[0];
      }

      await supabase.from('recordings').insert([{
        course_id: newRecCourseId,
        title: newRecTitle,
        lesson_date: new Date().toISOString().split('T')[0],
        duration: newRecDuration,
        video_id: finalId
      }]);

      setNewRecTitle('');
      setNewRecVideoId('');
      setShowAddRecModal(false);
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span>Teacher Admin Panel එක සූදානම් වෙමින් පවතී...</span>
        </div>
      </div>
    );
  }

  const pendingSlipsCount = slips.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070b14]/85 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-purple-600/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">Teacher Admin Panel</span>
              <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                Master Control Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1322] border border-slate-800 text-xs">
              <span className="text-slate-400">ගුරුභවතා:</span>
              <strong className="text-white">{adminUser?.fullName || 'Administrator'}</strong>
            </div>

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

      {/* 2. MAIN DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">සම්පූර්ණ සිසුන්</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{students.length}</div>
            <p className="text-[10px] text-slate-500">සක්‍රිය ශිෂ්‍ය ගිණුම් සංඛ්‍යාව</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Pending Slips</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{pendingSlipsCount}</div>
            <p className="text-[10px] text-slate-500">පරීක්ෂා කිරීමට ඇති රිසිට්පත්</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">පන්ති පාඨමාලා</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{courses.length}</div>
            <p className="text-[10px] text-slate-500">පැවැත්වෙන Active Classes</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Class Recordings</span>
              <Video className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{recordings.length}</div>
            <p className="text-[10px] text-slate-500">ආරක්ෂිත වීඩියෝ සංඛ්‍යාව</p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'slips', label: `Bank Slip Approvals (${pendingSlipsCount})`, icon: FileText },
              { id: 'students', label: `ශිෂ්‍ය කළමනාකරණය (${students.length})`, icon: Users },
              { id: 'courses', label: `පන්ති පාඨමාලා (${courses.length})`, icon: BookOpen },
              { id: 'recordings', label: `Recordings (${recordings.length})`, icon: Video },
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

          <button
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* TAB 1: BANK SLIP APPROVALS */}
        {activeTab === 'slips' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">සිසුන් යොමුකළ බැංකු රිසිට්පත් (Slips)</h3>
              <p className="text-xs text-slate-400">Slip එක පරීක්ෂා කර තනි ක්ලික් එකකින් පන්ති Access ලබා දෙන්න.</p>
            </div>

            {slips.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#0c1322] rounded-2xl border border-slate-800">
                තවමත් කිසිදු Slip පතක් ලැබී නැත.
              </div>
            ) : (
              <div className="space-y-3">
                {slips.map((slip) => (
                  <div key={slip.id} className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <a href={slip.slip_url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative group shrink-0">
                        <img src={slip.slip_url} alt="Slip" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </a>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white">{slip.student_name}</h4>
                          <span className="font-mono text-[10px] text-slate-400">({slip.student_username})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            slip.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            slip.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {slip.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{slip.course_name}</p>
                        <p className="text-[11px] font-mono text-emerald-400 font-bold">ගෙවූ මුදල: රු. {slip.amount}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {slip.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleSlipAction(slip.id, slip.student_id, 'approved')}
                            disabled={actionLoadingId === slip.id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve කරන්න</span>
                          </button>
                          <button
                            onClick={() => handleSlipAction(slip.id, slip.student_id, 'rejected')}
                            disabled={actionLoadingId === slip.id}
                            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Action Completed ({slip.status})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS MANAGEMENT (+ REGISTER STUDENT BUTTON) */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">ලියාපදිංචි ශිෂ්‍ය නාමාවලිය සහ Devices</h3>
                <p className="text-xs text-slate-400">Single Device Locking පරීක්ෂාව සහ WhatsApp Fee Reminders යැවීම.</p>
              </div>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ ශිෂ්‍යයෙකු ඇතුළත් කරන්න</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0c1322]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#131c31] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">ශිෂ්‍යයා</th>
                    <th className="p-4">Username</th>
                    <th className="p-4">දුරකථන අංකය</th>
                    <th className="p-4">Device Lock Status</th>
                    <th className="p-4 text-right">ක්‍රියාමාර්ග (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((st) => {
                    const isLocked = !!st.device_id;
                    const reminderMsg = encodeURIComponent(`ආයුබෝවන් ${st.full_name}, ඔබගේ මෙම මාසයේ පන්ති ගාස්තු ගෙවීම තවමත් සිදුකර නොමැති බව සිහිපත් කරමු. කරුණාකර Slip පත LMS එකට Upload කරන්න.`);
                    const waUrl = `https://wa.me/94${st.phone?.replace(/[^0-9]/g, '').slice(-9)}?text=${reminderMsg}`;

                    return (
                      <tr key={st.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-bold text-white">{st.full_name}</td>
                        <td className="p-4 font-mono text-purple-400">{st.username}</td>
                        <td className="p-4 font-mono text-slate-300">{st.phone || 'N/A'}</td>
                        <td className="p-4">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              <Smartphone className="w-3 h-3" /> Device Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                              Unlocked / Free
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Remind Fee</span>
                          </a>

                          {isLocked && (
                            <button
                              onClick={() => handleResetDevice(st.id)}
                              disabled={actionLoadingId === st.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] font-semibold transition"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Reset Device</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COURSES (+ CREATE CLASS BUTTON) */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">පැවැත්වෙන පන්ති පාඨමාලා (Classes)</h3>
                <p className="text-xs text-slate-400">නව පන්ති සෑදීම සහ ගාස්තු සැකසීම.</p>
              </div>
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>+ අලුත් පන්තියක් සාදන්න</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold uppercase">{course.category}</span>
                      <h4 className="font-bold text-sm text-white mt-2">{course.title}</h4>
                    </div>
                    <span className="text-sm font-mono font-bold text-emerald-400">රු. {course.monthly_fee}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>පන්ති වර්ගය: <strong className="text-white">{course.type}</strong></span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECORDINGS (+ ADD RECORDING BUTTON) */}
        {activeTab === 'recordings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">ආරක්ෂිත YouTube Recordings</h3>
                <p className="text-xs text-slate-400">නව පන්ති වීඩියෝ ලින්ක් ඇතුළත් කර සිසුන්ට නැරඹීමට සලස්වන්න.</p>
              </div>
              <button
                onClick={() => setShowAddRecModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>අලුත් Recording එකක් දමන්න</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordings.map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
                  <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden">
                    <img src={`https://img.youtube.com/vi/${rec.video_id}/hqdefault.jpg`} alt={rec.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                      {rec.duration || '2h 00m'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-white line-clamp-1">{rec.title}</h4>
                    <p className="text-[11px] text-slate-400">දිනය: {rec.lesson_date}</p>
                    <p className="text-[10px] font-mono text-purple-400">YouTube ID: {rec.video_id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW CLASS / COURSE                       */}
      {/* ======================================================== */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0c1322] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>නව පන්තියක් නිර්මාණය කිරීම</span>
              </h4>
              <button onClick={() => setShowAddCourseModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">පන්තියේ නම (Course Title)</label>
                <input 
                  type="text" 
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="උදා: A/L Physics 2026 Theory"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">කාණ්ඩය (Category)</label>
                  <input 
                    type="text" 
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    placeholder="උදා: A/L Science"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">පන්ති වර්ගය (Type)</label>
                  <select 
                    value={newCourseType} 
                    onChange={(e) => setNewCourseType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Revision">Revision</option>
                    <option value="Paper Class">Paper Class</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">මාසික පන්ති ගාස්තුව (රු.)</label>
                <input 
                  type="number" 
                  value={newCourseFee}
                  onChange={(e) => setNewCourseFee(e.target.value)}
                  placeholder="2500"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoadingId === 'new_course'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                {actionLoadingId === 'new_course' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>පන්තිය සාදන්න (Create Course)</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REGISTER / ADD STUDENT                          */}
      {/* ======================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0c1322] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>නව ශිෂ්‍යයෙකු ලියාපදිංචි කිරීම</span>
              </h4>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            {studentModalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{studentModalError}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">සම්පූර්ණ නම (Full Name)</label>
                <input 
                  type="text" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="උදා: සදුන් බණ්ඩාර"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Username</label>
                  <input 
                    type="text" 
                    value={newStudentUsername}
                    onChange={(e) => setNewStudentUsername(e.target.value)}
                    placeholder="st_sandun"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  <input 
                    type="text" 
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    placeholder="Pass#123"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">WhatsApp දුරකථන අංකය</label>
                <input 
                  type="text" 
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="0771234567"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ලියාපදිංචි කරන පන්තිය (Assign Class)</label>
                <select 
                  value={newStudentCourseId} 
                  onChange={(e) => setNewStudentCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} (රු. {c.monthly_fee})</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoadingId === 'new_student'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {actionLoadingId === 'new_student' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>ශිෂ්‍යයා ලියාපදිංචි කරන්න (Save Student)</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD RECORDING                                   */}
      {/* ======================================================== */}
      {showAddRecModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0c1322] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                <span>නව Recording එකක් ඇතුළත් කිරීම</span>
              </h4>
              <button onClick={() => setShowAddRecModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleAddRecording} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">පන්තිය (Course)</label>
                <select 
                  value={newRecCourseId} 
                  onChange={(e) => setNewRecCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">පාඩමේ මාතෘකාව (Title)</label>
                <input 
                  type="text" 
                  value={newRecTitle}
                  onChange={(e) => setNewRecTitle(e.target.value)}
                  placeholder="උදා: Lesson 02: Functions & Graphs"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">YouTube Video URL හෝ Video ID</label>
                <input 
                  type="text" 
                  value={newRecVideoId}
                  onChange={(e) => setNewRecVideoId(e.target.value)}
                  placeholder="dQw4w9WgXcQ හෝ සම්පූර්ණ URL එක"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">කාලය (Duration)</label>
                <input 
                  type="text" 
                  value={newRecDuration}
                  onChange={(e) => setNewRecDuration(e.target.value)}
                  placeholder="2h 15m"
                  className="w-full px-3 py-2 rounded-xl bg-[#131c31] border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoadingId === 'new_rec'}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                {actionLoadingId === 'new_rec' ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>සුරකින්න (Save Video)</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-[11px] text-slate-500">
        Smart Tuition LMS Platform • Teacher Administrator Control Center
      </footer>

    </div>
  );
}