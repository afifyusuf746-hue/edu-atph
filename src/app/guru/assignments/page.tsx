'use client';

import React from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { FileCheck2, Calendar, Users, ArrowRight } from 'lucide-react';

export default function GuruAssignmentsPage() {
  const assignments = [
    {
      id: 'asg-001',
      title: 'LKPD Praktik Lapangan: Analisis Kebutuhan Lahan & Perhitungan HOK',
      deadline: '10 November 2026',
      targetClass: 'X AT 1, X AT 2, X AT 3',
      submissionsCount: 18,
      status: 'Sedang Berlangsung',
      desc: 'Pengamatan langsung ke lahan praktik sekolah: hitung luas efektif, kemiringan kontur, dan kebutuhan tenaga kerja (TKDK & TKLK) dengan konversi HOK.',
    },
    {
      id: 'asg-002',
      title: 'Laporan Identifikasi Ambang Ekonomi & Musuh Alami PHT',
      deadline: '17 November 2026',
      targetClass: 'X AT 1, X AT 2, X AT 3',
      submissionsCount: 12,
      status: 'Terjadwal',
      desc: 'Eksplorasi tanaman refugia dan identifikasi musuh alami (Trichogramma sp.) di bedengan hortikultura.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Tugas Praktik & LKPD Guru ATPH"
        subtitle="Kelola penugasan lembar kerja peserta didik, observasi lapangan, dan pengumpulan laporan siswa"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((asg) => (
            <div
              key={asg.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-bold text-xs border border-teal-200">
                    {asg.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tenggat: {asg.deadline}</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{asg.desc}</p>

                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    Target: {asg.targetClass}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                    {asg.submissionsCount} Terkumpul
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/admin/submissions"
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  Periksa Pengumpulan
                </Link>
                <Link
                  href="/student/assignments"
                  className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Lihat Lembar LKPD</span>
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
