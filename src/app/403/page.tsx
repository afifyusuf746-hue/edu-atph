'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  Home,
  LogOut,
  GraduationCap,
  School,
  ShieldCheck,
  Sprout,
} from 'lucide-react';

interface CurrentUserSession {
  role?: 'admin' | 'teacher' | 'student';
  fullName?: string;
  email?: string;
}

export default function Forbidden403Page() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUserSession | null>(null);

  useEffect(() => {
    // Coba baca sesi dari cookie atau localStorage
    if (typeof window !== 'undefined') {
      try {
        const match = document.cookie.match(/(?:^|;\s*)edu_user_session=([^;]+)/);
        if (match) {
          setUser(JSON.parse(decodeURIComponent(match[1])));
          return;
        }

        const studentMatch = document.cookie.match(/(?:^|;\s*)edu_student_session=([^;]+)/);
        if (studentMatch) {
          setUser(JSON.parse(decodeURIComponent(studentMatch[1])));
          return;
        }

        const stored = localStorage.getItem('eduatph_current_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/student-session', { method: 'DELETE' });
      document.cookie = 'edu_user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'edu_student_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.removeItem('eduatph_current_user');
    } catch {}
    router.push('/login');
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'teacher') return '/guru/dashboard';
    return '/siswa/dashboard';
  };

  const getRoleLabel = () => {
    if (!user?.role) return 'Tamu / Belum Terautentikasi';
    if (user.role === 'admin') return 'Administrator Sistem';
    if (user.role === 'teacher') return 'Guru / Tenaga Pendidik ATPH';
    return 'Siswa Belajar ATPH';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-white">
      {/* Glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 text-center space-y-6">
        {/* Logo Brand */}
        <Link href="/beranda" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 group-hover:scale-105 transition-all">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Edu<span className="text-emerald-600 dark:text-emerald-400">ATPH</span>
          </span>
        </Link>

        {/* 403 Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-black uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Kode 403: Akses Ditolak</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Akses Halaman Dibatasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>

          {/* User Session Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px] font-semibold">Akun Aktif:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                {user?.fullName || 'Pengguna'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px] font-semibold">Tingkat Hak Akses:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-[10px] uppercase text-emerald-700 dark:text-emerald-400">
                {user?.role === 'admin' ? (
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ) : user?.role === 'teacher' ? (
                  <School className="w-3 h-3 text-teal-600" />
                ) : (
                  <GraduationCap className="w-3 h-3 text-emerald-600" />
                )}
                <span>{getRoleLabel()}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 leading-normal">
              {user?.role === 'student'
                ? 'Siswa hanya memiliki hak akses ke Ruang Belajar, Materi, Kuis, dan Nilai Pribadi. Halaman manajemen guru/admin dilindungi.'
                : 'Silakan gunakan akun yang memiliki wewenang administratif untuk melanjutkan.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={getDashboardUrl()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Dashboard Saya</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Ganti Akun / Keluar</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          EduATPH — Sistem Manajemen Pembelajaran SMK Agribisnis Tanaman Pangan dan Hortikultura
        </p>
      </div>
    </div>
  );
}

