'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  Award,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Database,
  X,
  FileCheck2,
  FileSpreadsheet,
  Download,
  Printer,
  User,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatDate, formatDateOnly } from '@/lib/utils';

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
  answers: any[];
}

export default function GuruGradesPage() {
  const [attempts, setAttempts] = useState<ServerQuizAttempt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedAttemptModal, setSelectedAttemptModal] = useState<ServerQuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [namaGuru, setNamaGuru] = useState('Okta Nofiyanto, S.P.');

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const staffSession = encodeURIComponent(
        JSON.stringify({
          id: 'usr-tch-001',
          email: 'budi.santoso@guru.eduatph.sch.id',
          fullName: 'Budi Santoso, S.P., M.Si.',
          role: 'teacher',
        })
      );
      const res = await fetch('/api/admin/quiz-attempts', {
        cache: 'no-store',
        headers: { 'x-edu-session': staffSession, 'x-edu-role-hint': 'teacher' },
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setAttempts(json.data);
      }
    } catch (err) {
      console.warn('Failed to load quiz attempts for teacher:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uniqueClasses = Array.from(new Set(attempts.map((a) => a.className).filter(Boolean)));

  const filteredAttempts = attempts.filter((att) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      att.studentName.toLowerCase().includes(q) ||
      att.quizTitle.toLowerCase().includes(q) ||
      (att.studentNisn && att.studentNisn.includes(q));

    const matchesClass = selectedClass === 'all' || att.className === selectedClass;

    return matchesSearch && matchesClass;
  });

  const handleExportExcel = (namaGuruInput: string) => {
    const tanggalCetak = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const wb = XLSX.utils.book_new();
    const sheetData: (string | number)[][] = [
      ['REKAP NILAI KUIS SISWA (PORTAL GURU)'],
      ['SMK ATPH – Dasar-Dasar Agribisnis Tanaman'],
      ['Tahun Ajaran: 2025/2026'],
      [],
      ['Administrator', ':', 'Okta Nofiyanto'],
      ['Nama Guru', ':', namaGuruInput || 'Okta Nofiyanto, S.P.'],
      ['Tanggal Cetak', ':', tanggalCetak],
      ['KKM', ':', 75],
      [],
      [
        'No',
        'Nama Siswa',
        'NISN',
        'Kelas',
        'Mata Pelajaran',
        'Nama Kuis / Materi',
        'Nilai',
        'Jawaban Benar',
        'Jawaban Salah',
        'Tanggal Pengerjaan',
        'Waktu Pengerjaan',
        'Status',
      ],
      ...filteredAttempts.map((att, idx) => [
        idx + 1,
        att.studentName,
        att.studentNisn || '-',
        att.className || '-',
        'Dasar-Dasar Agribisnis Tanaman',
        att.quizTitle,
        att.percentage ?? att.score,
        att.correctCount,
        att.wrongCount,
        formatDateOnly(att.completedAt || att.startedAt),
        formatDate(att.completedAt || att.startedAt),
        att.isPassed ? 'Tuntas' : 'Belum Tuntas (Remidi)',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 16 },
      { wch: 12 },
      { wch: 36 },
      { wch: 32 },
      { wch: 8 },
      { wch: 14 },
      { wch: 14 },
      { wch: 20 },
      { wch: 22 },
      { wch: 24 },
    ];
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Nilai Kuis');
    XLSX.writeFile(wb, `Nilai_Kuis_Guru_ATPH_${new Date().toISOString().slice(0, 10)}.xlsx`, {
      bookType: 'xlsx',
      type: 'binary',
      cellStyles: true,
    });
    setShowExportModal(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Rekap Nilai Siswa (Guru ATPH)"
        subtitle="Pantau hasil pengerjaan kuis siswa tersimpan permanen di cloud Supabase dan lihat rincian lembar jawaban"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama siswa atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Semua Rombel</option>
              {uniqueClasses.map((cls, idx) => (
                <option key={idx} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-3">
            <span>{filteredAttempts.length} Penilaian Kuis</span>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>

        {/* Tabel Nilai */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-4 px-6">Nama Siswa</th>
                  <th className="py-4 px-6">Kelas</th>
                  <th className="py-4 px-6">Kuis / Materi</th>
                  <th className="py-4 px-6">Skor & Ketuntasan</th>
                  <th className="py-4 px-6">Benar / Salah</th>
                  <th className="py-4 px-6">Tanggal Selesai</th>
                  <th className="py-4 px-6 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Memuat data penilaian dari Supabase...
                    </td>
                  </tr>
                ) : filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Belum ada data nilai kuis yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                        <div>{att.studentName}</div>
                        <div className="text-[10px] font-mono text-slate-400">NIS: {att.studentNisn}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {att.className}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                        {att.quizTitle}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {att.percentage}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.isPassed
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {att.isPassed ? 'Tuntas' : 'Remidi'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px]">
                        <span className="text-emerald-600 font-bold">{att.correctCount} benar</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-rose-600 font-bold">{att.wrongCount} salah</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[11px]">
                        {formatDate(att.completedAt || att.startedAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttemptModal(att)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lembar Jawaban</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL RINCIAN LEMBAR JAWABAN */}
      {selectedAttemptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Lembar Jawaban: {selectedAttemptModal.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAttemptModal.quizTitle} • Skor: {selectedAttemptModal.percentage}/100 ({selectedAttemptModal.correctCount} Benar, {selectedAttemptModal.wrongCount} Salah)
                </p>
              </div>
              <button
                onClick={() => setSelectedAttemptModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {(!selectedAttemptModal.answers || selectedAttemptModal.answers.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Rincian per butir soal tercatat langsung di server Supabase.
                </div>
              ) : (
                selectedAttemptModal.answers.map((ans: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      ans.isCorrect
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Nomor {idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          ans.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {ans.isCorrect ? 'Benar (+5 Poin)' : 'Salah'}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      {ans.questionText}
                    </p>
                    <div className="text-[11px] space-y-0.5 pt-1">
                      <p className="text-slate-600 dark:text-slate-400">
                        Jawaban Siswa:{' '}
                        <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          {ans.userAnswer || '(Tidak Dijawab)'}
                        </strong>
                      </p>
                      {!ans.isCorrect && ans.correctAnswer && (
                        <p className="text-emerald-700 dark:text-emerald-400">
                          Kunci Jawaban yang Benar: <strong>{ans.correctAnswer}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAttemptModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Tutup Lembar Jawaban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EKSPOR EXCEL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-600 text-white">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="text-sm font-bold">Ekspor Excel – Rekap Nilai Guru</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Informasi Dokumen</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Data</span>
                  <span className="font-semibold">{filteredAttempts.length} baris</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Administrator</span>
                  <span className="font-semibold">Okta Nofiyanto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Cetak</span>
                  <span className="font-semibold">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Nama Guru Pengampu
                </label>
                <input
                  type="text"
                  value={namaGuru}
                  onChange={(e) => setNamaGuru(e.target.value)}
                  placeholder="Contoh: Okta Nofiyanto, S.P."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleExportExcel(namaGuru)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh .xlsx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

