'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import HidroponikTeacherGradingPanel from '@/components/quizzes/HidroponikTeacherGradingPanel';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Users,
} from 'lucide-react';

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
    status: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200',
  },
  sky: {
    folder: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60',
    header: 'text-sky-700 dark:text-sky-300',
    badge:  'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300',
    icon:   'text-sky-600 dark:text-sky-400',
    status: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200',
  },
  violet: {
    folder: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/60',
    header: 'text-violet-700 dark:text-violet-300',
    badge:  'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300',
    icon:   'text-violet-600 dark:text-violet-400',
    status: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200',
  },
};

// Data kuis per tingkat
const QUIZZES_BY_GRADE: Record<string, Array<{
  id: string;
  title: string;
  questionsCount: number;
  duration: string;
  passingScore: number;
  targetClass: string;
  status: string;
  desc: string;
}>> = {
  X: [
    {
      id: 'quiz-x-bab-1',
      title: 'Kuis Bab I: Keselamatan & Kesehatan Kerja (K3)',
      questionsCount: 20,
      duration: '30 Menit',
      passingScore: 75,
      targetClass: 'Semua Rombel X ATPH',
      status: 'Aktif',
      desc: '20 butir soal pilihan ganda mencakup K3 di lahan budidaya, alat pelindung diri, dan prosedur keselamatan kerja.',
    },
    {
      id: 'quiz-x-bab-4',
      title: 'Kuis Bab IV: Pengelolaan Faktor Produksi',
      questionsCount: 20,
      duration: '45 Menit',
      passingScore: 75,
      targetClass: 'Semua Rombel X ATPH',
      status: 'Aktif Ujian',
      desc: '20 butir soal pilihan ganda acak mencakup lahan, tenaga kerja HOK, modal, PHT, dan manajemen produksi.',
    },
  ],
  XI: [
    {
      id: 'quiz-hidroponik-xi',
      title: 'Evaluasi Pembelajaran: Teknologi Budidaya Tanaman Hidroponik (Kelas XI ATPH)',
      questionsCount: 10,
      duration: '60 Menit',
      passingScore: 75,
      targetClass: 'Semua Rombel XI ATPH',
      status: 'Aktif + Pilihan Ganda & Ujian Terkontrol',
      desc: '10 butir soal pilihan ganda mandiri berbasis PDF Modul Hidroponik Kelas XI SMK ATPH.',
    },
    {
      id: 'quiz-xi-bab-2',
      title: 'Kuis Bab II: Teknologi Budidaya Tanaman Sayuran',
      questionsCount: 25,
      duration: '40 Menit',
      passingScore: 75,
      targetClass: 'Semua Rombel XI ATPH',
      status: 'Aktif',
      desc: '25 butir soal mencakup pemilihan varietas, teknik persemaian, pemupukan, dan pengendalian hama terpadu.',
    },
  ],
  XII: [
    {
      id: 'quiz-xii-bab-3',
      title: 'Kuis Bab III: Pascapanen & Pemasaran Produk ATPH',
      questionsCount: 20,
      duration: '35 Menit',
      passingScore: 80,
      targetClass: 'Semua Rombel XII ATPH',
      status: 'Aktif',
      desc: '20 butir soal mencakup teknik panen, grading, pengemasan, penyimpanan, dan strategi pemasaran produk hortikultura.',
    },
  ],
};

export default function GuruQuizzesPage() {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    X: true, XI: true, XII: true,
  });
  const toggleFolder = (level: string) =>
    setOpenFolders((prev) => ({ ...prev, [level]: !prev[level] }));

  const totalQuizzes = Object.values(QUIZZES_BY_GRADE).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Evaluasi & Bank Soal Kuis Guru"
        subtitle="Kelola paket soal evaluasi kejuruan, kunci jawaban, dan batas waktu pengerjaan siswa"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Ringkasan */}
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Kuis per Tingkat</h2>
            <p className="text-xs text-slate-500">{totalQuizzes} Paket kuis tersedia</p>
          </div>
        </div>

        {/* Folder Accordion */}
        <div className="space-y-4">
          {GRADE_FOLDERS.map(({ level, label, color }) => {
            const c = FOLDER_COLORS[color];
            const folderQuizzes = QUIZZES_BY_GRADE[level] || [];
            const isOpen = openFolders[level] ?? true;

            return (
              <div key={level} className={`rounded-3xl border-2 ${c.folder} overflow-hidden`}>
                {/* Header Folder */}
                <button
                  type="button"
                  onClick={() => toggleFolder(level)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    {isOpen
                      ? <FolderOpen className={`w-6 h-6 ${c.icon}`} />
                      : <Folder className={`w-6 h-6 ${c.icon}`} />
                    }
                    <div className="text-left">
                      <p className={`text-base font-black ${c.header}`}>{label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {folderQuizzes.length} Kuis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                      Tingkat {level}
                    </span>
                    {isOpen
                      ? <ChevronDown className={`w-5 h-5 ${c.icon}`} />
                      : <ChevronRight className={`w-5 h-5 ${c.icon}`} />
                    }
                  </div>
                </button>

                {/* Isi Kuis */}
                {isOpen && (
                  <div className="px-6 pb-6 space-y-4">
                    {folderQuizzes.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        Belum ada kuis untuk tingkat {level}.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {folderQuizzes.map((q) => (
                            <div
                              key={q.id}
                              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${c.status}`}>
                                    {q.status}
                                  </span>
                                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {q.duration}
                                  </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                                  {q.title}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{q.desc}</p>
                                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                    {q.questionsCount} Butir Soal
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                                    <Award className="w-3 h-3 text-amber-500" />
                                    KKM: {q.passingScore}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {q.targetClass}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  Kuis Aktif — Siswa dapat mengerjakan
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {level === 'XI' && <HidroponikTeacherGradingPanel />}
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
