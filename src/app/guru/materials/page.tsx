'use client';

import React from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { BookOpen, Video, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GuruMaterialsPage() {
  const chapters = [
    {
      id: 'mat-bab-1',
      number: 'BAB I',
      title: 'Proses Bisnis Pertanian Tanaman',
      desc: 'Pemahaman alur industri pertanian, mata rantai pasok agribisnis, serta manajemen mutu produk hasil tanaman.',
      pages: '28 Halaman',
      topic: 'Bisnis & Rantai Pasok',
    },
    {
      id: 'mat-bab-2',
      number: 'BAB II',
      title: 'Perkembangan Teknologi Pertanian & Isu Global',
      desc: 'Smart farming, IoT sensor tanah, pertanian presisi, drone semprot, dan adaptasi perubahan iklim global.',
      pages: '26 Halaman',
      topic: 'Smart Farming & Presisi',
    },
    {
      id: 'mat-bab-3',
      number: 'BAB III',
      title: 'Agripreneur & Peluang Usaha Agribisnis',
      desc: 'Profil kewirausahaan muda, analisis kelayakan usaha tani, pemasaran digital, dan studi kasus sukses agribisnis.',
      pages: '22 Halaman',
      topic: 'Kewirausahaan Mandiri',
    },
    {
      id: 'mat-bab-4',
      number: 'BAB IV',
      title: 'Pengelolaan Faktor Produksi Tanaman',
      desc: 'Materi lengkap verbatim 24 halaman (hal. 111-134), tanah, HOK tenaga kerja, modal tetap/bergerak, PHT, dan manajemen.',
      pages: '24 Halaman Verbatim',
      topic: 'Dasar Kejuruan ATPH (Aktif Ujian)',
      href: '/student/materials/mat-bab-iv-pengelolaan-faktor-produksi-x',
    },
    {
      id: 'mat-hidroponik-xi',
      number: 'KELAS XI — HIDROPONIK',
      title: 'Teknologi Budidaya Tanaman Sistem Hidroponik (Kelas XI ATPH)',
      desc: 'Modul PDF lengkap berisi Materi Pembelajaran (Fisiologi DO, Media Inert, NFT, DFT, Drip Fertigasi, Aeroponik, Kimia AB Mix, pH/EC, & Diagnosis Masalah), Rangkuman, Glosarium, dan Daftar Pustaka.',
      pages: '5 Halaman PDF + Evaluasi AI',
      topic: 'Sistem Hidroponik Kelas XI (10 PG, 5 Uraian, 2 Studi Kasus)',
      href: '/student/materials/mat-hidroponik-xi',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Materi Pembelajaran Guru ATPH"
        subtitle="Kelola modul pembelajaran, materi kurikulum merdeka Bab I - IV, dan bahan ajar kejuruan"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-teal-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-black text-xs border border-teal-500/20">
                    {ch.number}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{ch.pages}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {ch.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{ch.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">{ch.topic}</span>
                <Link
                  href={(ch as any).href || '/student/materials/mat-bab-iv-pengelolaan-faktor-produksi-x'}
                  className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Buka Modul Ajar</span>
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

