'use client';

import React from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { HelpCircle, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GuruQuizzesPage() {
  const quizzes = [
    {
      id: 'quiz-bab-4',
      title: 'Kuis Evaluasi Bab IV: Pengelolaan Faktor Produksi',
      questionsCount: 20,
      duration: '45 Menit',
      passingScore: 75,
      targetClass: 'Semua Rombel X ATPH',
      status: 'Aktif Ujian',
      desc: '20 butir soal pilihan ganda acak mencakup lahan, tenaga kerja HOK, modal, PHT, dan manajemen produksi.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Evaluasi & Bank Soal Kuis Guru"
        subtitle="Kelola paket soal evaluasi kejuruan, kunci jawaban, dan batas waktu pengerjaan siswa"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200">
                    {q.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{q.duration}</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {q.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{q.desc}</p>

                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {q.questionsCount} Butir Soal
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    KKM: {q.passingScore}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {q.targetClass}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/guru/grades"
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Lihat Hasil Siswa
                </Link>
                <Link
                  href={`/student/quizzes/${q.id}`}
                  className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Pratinjau Soal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

