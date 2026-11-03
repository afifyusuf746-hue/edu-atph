'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  HelpCircle,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { Quiz, QuizAttempt, UserProfile } from '@/types';

const GRADE_FOLDERS = [
  { level: 'X',   label: 'X ATPH',   color: 'emerald' as const },
  { level: 'XI',  label: 'XI ATPH',  color: 'sky'     as const },
  { level: 'XII', label: 'XII ATPH', color: 'violet'  as const },
];

const FOLDER_COLORS = {
  emerald: {
    folder: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60',
    header: 'text-emerald-700 dark:text-emerald-300',
    badge:  'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    icon:   'text-emerald-600 dark:text-emerald-400',
    card:   'hover:border-emerald-500/50',
    tag:    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
    btn:    'bg-emerald-600 hover:bg-emerald-700',
  },
  sky: {
    folder: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60',
    header: 'text-sky-700 dark:text-sky-300',
    badge:  'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300',
    icon:   'text-sky-600 dark:text-sky-400',
    card:   'hover:border-sky-500/50',
    tag:    'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400',
    btn:    'bg-sky-600 hover:bg-sky-700',
  },
  violet: {
    folder: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/60',
    header: 'text-violet-700 dark:text-violet-300',
    badge:  'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300',
    icon:   'text-violet-600 dark:text-violet-400',
    card:   'hover:border-violet-500/50',
    tag:    'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
    btn:    'bg-violet-600 hover:bg-violet-700',
  },
};

function guessGrade(quiz: Quiz): string {
  const name = (quiz.targetClassName || quiz.targetClassId || '').toUpperCase();
  if (name.includes('XII')) return 'XII';
  if (name.includes('XI')) return 'XI';
  if (name.includes('X') || name === 'ALL' || name === 'SEMUA') return 'X';
  return 'X';
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    X: true,
    XI: true,
    XII: true,
  });

  const toggleFolder = (level: string) => {
    setOpenFolders((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const loadData = async () => {
    let user = DataProvider.getCurrentUser();
    if (!user || user.role !== 'student') {
      try {
        const res = await fetch('/api/auth/student-session');
        const json = await res.json();
        if (json.authenticated && json.user) {
          user = json.user;
          DataProvider.setCurrentUser(user);
        }
      } catch {}
    }
    setCurrentUser(user);

    // Published quizzes (semua kuis yang dipublikasikan agar terlihat di folder tingkat)
    const list = DataProvider.getQuizzes().filter((q) => q.isPublished);
    setQuizzes(list);

    if (user) {
      let myAttempts = DataProvider.getQuizAttempts(user.id);
      try {
        const res = await fetch(`/api/admin/quiz-attempts?studentId=${user.id}`);
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const merged = [...json.data];
          myAttempts.forEach((la) => {
            if (!merged.some((m) => m.id === la.id)) {
              merged.push(la);
            }
          });
          myAttempts = merged;
        }
      } catch {}
      setAttempts(myAttempts);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader
        title="Kuis & Evaluasi Pembelajaran ATPH"
        subtitle="Uji pemahaman konsep materi dan peroleh nilai instan terintegrasi dengan rapor siswa"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Ringkasan & Info Kelas Siswa */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Paket Evaluasi Belajar ATPH
              </h2>
              <p className="text-xs text-slate-500">
                Pilih folder jenjang kelas untuk melihat daftar kuis yang tersedia
              </p>
            </div>
          </div>
          {currentUser && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Kelas Anda: {currentUser.className || 'X AT 1'}
            </div>
          )}
        </div>

        {/* Folder Accordion per Tingkat */}
        <div className="space-y-4">
          {GRADE_FOLDERS.map(({ level, label, color }) => {
            const c = FOLDER_COLORS[color];
            const folderQuizzes = quizzes.filter((q) => guessGrade(q) === level);
            const isOpen = openFolders[level] ?? true;

            return (
              <div
                key={level}
                className={`rounded-3xl border-2 ${c.folder} overflow-hidden transition-all`}
              >
                {/* Header Folder */}
                <button
                  type="button"
                  onClick={() => toggleFolder(level)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:opacity-85 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <FolderOpen className={`w-6 h-6 ${c.icon}`} />
                    ) : (
                      <Folder className={`w-6 h-6 ${c.icon}`} />
                    )}
                    <div className="text-left">
                      <p className={`text-base font-black ${c.header}`}>{label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {folderQuizzes.length} Kuis Tersedia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                      Tingkat {level}
                    </span>
                    {isOpen ? (
                      <ChevronDown className={`w-5 h-5 ${c.icon}`} />
                    ) : (
                      <ChevronRight className={`w-5 h-5 ${c.icon}`} />
                    )}
                  </div>
                </button>

                {/* Isi Kuis dalam Folder */}
                {isOpen && (
                  <div className="px-6 pb-6 space-y-4">
                    {folderQuizzes.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        Belum ada kuis yang dipublikasikan untuk tingkat {level}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {folderQuizzes.map((quiz) => {
                          const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
                          const bestAttempt = quizAttempts.sort(
                            (a, b) => b.percentage - a.percentage
                          )[0];
                          const attemptsLeft = quiz.maxAttempts - quizAttempts.length;

                          return (
                            <div
                              key={quiz.id}
                              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs ${c.card} transition-all flex flex-col justify-between space-y-5`}
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${c.tag}`}
                                  >
                                    {quiz.topic || 'Kejuruan ATPH'}
                                  </span>
                                  {bestAttempt ? (
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                                        bestAttempt.passed
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      }`}
                                    >
                                      <Award className="w-3.5 h-3.5" />
                                      <span>Skor: {bestAttempt.percentage}%</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                      Belum Dikerjakan
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    {quiz.title}
                                  </h3>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                                    {quiz.description}
                                  </p>
                                </div>

                                {/* Info stats */}
                                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block">Durasi</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                      {quiz.durationMinutes} Menit
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block">KKM</span>
                                    <strong className="text-emerald-600">
                                      {quiz.passingScore}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block">
                                      Sisa Percobaan
                                    </span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                      {attemptsLeft > 0 ? `${attemptsLeft}x` : 'Habis'}
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Link
                                  href={`/student/quizzes/${quiz.id}`}
                                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-white ${c.btn} shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]`}
                                >
                                  <span>
                                    {quizAttempts.length > 0
                                      ? 'Kerjakan Ulang Kuis'
                                      : 'Mulai Kerjakan Kuis'}
                                  </span>
                                  <ArrowRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
