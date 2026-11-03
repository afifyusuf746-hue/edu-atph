'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  Users,
  School,
  BookOpen,
  Award,
  HelpCircle,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { ClassItem, UserProfile } from '@/types';
import { formatDate } from '@/lib/utils';

interface ServerQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  className: string;
  studentNisn: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  correctCount: number;
  wrongCount: number;
  startedAt: string;
  completedAt: string;
}

export default function GuruDashboardPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<ServerQuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Ambil data kelas dari Supabase
      try {
        const clsRes = await fetch('/api/admin/classes', { cache: 'no-store' });
        const clsJson = await clsRes.json();
        if (clsRes.ok && clsJson.success && Array.isArray(clsJson.data)) {
          setClasses(clsJson.data);
          setIsLiveSupabase(true);
        } else {
          setClasses(DataProvider.getClasses());
        }
      } catch {
        setClasses(DataProvider.getClasses());
      }

      // 2. Ambil data siswa dari Supabase
      try {
        const stdRes = await fetch('/api/admin/students', { cache: 'no-store' });
        const stdJson = await stdRes.json();
        if (stdRes.ok && stdJson.success && Array.isArray(stdJson.data)) {
          setStudents(stdJson.data);
        } else {
          setStudents(DataProvider.getUsers().filter((u) => u.role === 'student'));
        }
      } catch {
        setStudents(DataProvider.getUsers().filter((u) => u.role === 'student'));
      }

      // 3. Ambil pengerjaan kuis siswa terbaru dari Supabase
      try {
        const attRes = await fetch('/api/admin/quiz-attempts', { cache: 'no-store' });
        const attJson = await attRes.json();
        if (attRes.ok && attJson.success && Array.isArray(attJson.data)) {
          setQuizAttempts(attJson.data.slice(0, 6));
        }
      } catch {}
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeStudentsCount = students.filter((s) => s.isActive).length;

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Dashboard Guru ATPH"
        subtitle="Selamat datang di Portal Pendidik Agribisnis Tanaman Pangan dan Hortikultura"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Supabase Status Banner */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                {isLiveSupabase
                  ? 'Database Supabase Cloud Terhubung (Portal Guru)'
                  : 'Mode Sinkronisasi Guru Aktif'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs flex items-center gap-1.5 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Siswa Binaan</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : activeStudentsCount}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Siswa aktif terdaftar
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Rombel Diampu</span>
              <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : classes.length}
            </p>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
              Tingkat X, XI, dan XII ATPH
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Materi Kejuruan</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">4 Bab</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              Bab I s/d Bab IV Lengkap
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Evaluasi & Kuis</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {quizAttempts.length > 0 ? `${quizAttempts.length}+` : '0'}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              Pengerjaan kuis tercatat
            </p>
          </div>
        </div>

        {/* QUICK ACCESS ACTIONS FOR TEACHERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/guru/classes"
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white border border-emerald-500/30 hover:border-emerald-500 transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <School className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-white">Kelola Kelas & Anggota Siswa</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pantau rombel binaan X, XI, XII ATPH dan lihat profil serta nomor induk siswa.
            </p>
          </Link>

          <Link
            href="/guru/grades"
            className="p-5 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-900 text-white border border-teal-500/30 hover:border-teal-500 transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Award className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-white">Rekapitulasi Nilai & Kuis</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Lihat skor kuis Bab IV, kunci jawaban yang dipilih siswa, dan ketuntasan KKM (75).
            </p>
          </Link>

          <Link
            href="/guru/materials"
            className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-900 text-white border border-cyan-500/30 hover:border-cyan-500 transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-white">Materi & Bahan Ajar Kejuruan</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tinjau isi 24 halaman modul Bab IV Pengelolaan Faktor Produksi dan video tutorial.
            </p>
          </Link>
        </div>

        {/* LIVE QUIZ SUBMISSIONS TABLE */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Hasil Pengerjaan Kuis Siswa Terbaru (Live Supabase)</span>
              </h3>
              <p className="text-xs text-slate-500">Nilai tersimpan permanen di cloud Supabase</p>
            </div>
            <Link
              href="/guru/grades"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-5">Nama Siswa</th>
                  <th className="py-3 px-5">Kelas</th>
                  <th className="py-3 px-5">Kuis & Topik</th>
                  <th className="py-3 px-5">Nilai / Skor</th>
                  <th className="py-3 px-5">Status KKM</th>
                  <th className="py-3 px-5">Waktu Submit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quizAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Belum ada siswa yang menyelesaikan kuis di Supabase.
                    </td>
                  </tr>
                ) : (
                  quizAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                        {att.studentName}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {att.className || 'X AT 1'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                        {att.quizTitle}
                      </td>
                      <td className="py-3.5 px-5 font-black text-slate-900 dark:text-white">
                        {att.percentage} / 100
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.isPassed
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {att.isPassed ? '✓ Tuntas' : '⚠ Remidi'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                        {formatDate(att.completedAt || att.startedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

