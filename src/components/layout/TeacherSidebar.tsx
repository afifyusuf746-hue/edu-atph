'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sprout,
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  FileCheck2,
  HelpCircle,
  Award,
  LogOut,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export interface TeacherNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export const TEACHER_NAV_ITEMS: TeacherNavItem[] = [
  { label: 'Dashboard Guru', href: '/guru/dashboard', icon: LayoutDashboard, desc: 'Ringkasan & Aktivitas' },
  { label: 'Kelas Binaan', href: '/guru/classes', icon: School, desc: 'Rombel Tanggung Jawab' },
  { label: 'Siswa Saya', href: '/guru/students', icon: Users, desc: 'Data & Keaktifan Siswa' },
  { label: 'Materi & Modul', href: '/guru/materials', icon: BookOpen, desc: 'Bahan Ajar Kejuruan' },
  { label: 'Tugas Praktik', href: '/guru/assignments', icon: FileCheck2, desc: 'Tugas Lapangan & LKPD' },
  { label: 'Kuis & Evaluasi', href: '/guru/quizzes', icon: HelpCircle, desc: 'Soal & Ujian Online' },
  { label: 'Rekap Nilai Siswa', href: '/guru/grades', icon: Award, desc: 'Nilai Kuis & Rapor' },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/student-session', { method: 'DELETE' });
      document.cookie = 'edu_user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'edu_student_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.removeItem('eduatph_current_user');
    } catch {}
    router.push('/login');
  };

  return (
    <aside className="w-72 flex-shrink-0 min-h-screen bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between hidden lg:flex">
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <Link href="/guru/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight">
                  Edu<span className="text-emerald-400">ATPH</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  GURU
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Portal Tenaga Pendidik</p>
            </div>
          </Link>
        </div>

        {/* Role Access Badge */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-teal-950/40 border border-teal-800/40 text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Hak Akses: Guru ATPH</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Akses ke manajemen kelas binaan, modul ajar, tugas, dan rekap penilaian siswa.
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {TEACHER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all
                  ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
              GP
            </div>
            <div>
              <p className="text-xs font-bold text-white">Guru Pendidik</p>
              <p className="text-[10px] text-teal-400 font-mono">NIP Resmi ATPH</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Sesi Guru</span>
        </button>
      </div>
    </aside>
  );
}
