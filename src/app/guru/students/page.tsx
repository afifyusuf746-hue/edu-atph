'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  School,
  Clock,
  RefreshCw,
  Database,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { UserProfile, ClassItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function GuruStudentsPage() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      try {
        const clsRes = await fetch('/api/admin/classes', { cache: 'no-store' });
        const clsJson = await clsRes.json();
        if (clsRes.ok && clsJson.success && Array.isArray(clsJson.data)) {
          setClasses(clsJson.data);
        } else {
          setClasses(DataProvider.getClasses());
        }
      } catch {
        setClasses(DataProvider.getClasses());
      }

      const res = await fetch('/api/admin/students', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setStudents(json.data);
      } else {
        const allUsers = DataProvider.getUsers();
        setStudents(allUsers.filter((u) => u.role === 'student'));
      }
    } catch {
      const allUsers = DataProvider.getUsers();
      setStudents(allUsers.filter((u) => u.role === 'student'));
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.nisn && s.nisn.includes(q));

    const matchesClass =
      selectedClass === 'all' ||
      s.classId === selectedClass ||
      s.className === selectedClass;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Daftar Siswa Binaan ATPH"
        subtitle="Data identitas, rombongan belajar, dan rekam keaktifan siswa yang diampu oleh Guru ATPH"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
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
              <option value="all">Semua Rombel ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span>Menampilkan {filteredStudents.length} siswa</span>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Siswa */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-4 px-6">Identitas Siswa</th>
                  <th className="py-4 px-6">Kelas & NISN</th>
                  <th className="py-4 px-6">Jurusan</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Terdaftar Sejak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Memuat daftar siswa...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Tidak ada data siswa yang sesuai pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-bold flex items-center justify-center border border-teal-500/20">
                            {s.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{s.fullName}</p>
                            <p className="text-[11px] text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200">
                          {s.className || 'X AT 1'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          NIS: {s.nisn || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                        {s.major || 'Agribisnis Tanaman Pangan dan Hortikultura'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {s.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{s.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[11px]">
                        {formatDate(s.createdAt)}
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

