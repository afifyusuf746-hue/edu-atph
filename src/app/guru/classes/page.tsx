'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  School,
  Users,
  Search,
  Database,
  RefreshCw,
  UserCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { ClassItem } from '@/types';

interface ClassMember {
  id: string;
  fullName: string;
  email: string;
  nis: string;
  status: string;
  lastLoginAt?: string;
}

interface ExtendedClassItem extends ClassItem {
  students?: ClassMember[];
}

export default function GuruClassesPage() {
  const [classes, setClasses] = useState<ExtendedClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewClass, setViewClass] = useState<ExtendedClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchMember, setSearchMember] = useState('');

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/classes', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setClasses(json.data);
      } else {
        const localClasses = DataProvider.getClasses();
        setClasses(localClasses as ExtendedClassItem[]);
      }
    } catch {
      setClasses(DataProvider.getClasses() as ExtendedClassItem[]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenMembers = (cls: ExtendedClassItem) => {
    setViewClass(cls);
    setSearchMember('');
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Kelas Binaan Guru"
        subtitle="Pantau daftar rombongan belajar tingkat X, XI, dan XII yang menjadi tanggung jawab pembelajaran Anda"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Total {classes.length} Rombongan Belajar ATPH Terhubung ke Supabase
            </span>
          </div>
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-1 rounded-lg text-slate-500 hover:text-teal-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold">Memuat rombel kelas dari Supabase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const memberCount = cls.studentCount || (cls.students?.length ?? 0);
              return (
                <div
                  key={cls.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-500/50 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-black text-sm flex items-center justify-center border border-teal-500/20">
                        {cls.gradeLevel}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-600 dark:text-slate-400">
                        {cls.academicYear}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cls.description || 'Rombongan belajar kejuruan tanaman pangan dan hortikultura'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{memberCount} Siswa Terdaftar</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenMembers(cls)}
                      className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-900 dark:text-teal-200 text-xs font-bold flex items-center justify-center gap-2 border border-teal-200/60 dark:border-teal-800/60 transition-all"
                    >
                      <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Lihat Anggota Siswa ({memberCount})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL LIHAT ANGGOTA KELAS */}
      {isModalOpen && viewClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Daftar Siswa {viewClass.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Total {viewClass.students?.length ?? 0} siswa terdaftar di rombel ini
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa di rombel ini..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              {(!viewClass.students || viewClass.students.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada siswa yang mendaftar di kelas ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Nama Siswa</th>
                      <th className="py-2.5 px-4">NIS</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewClass.students
                      .filter(
                        (s) =>
                          !searchMember ||
                          s.fullName.toLowerCase().includes(searchMember.toLowerCase()) ||
                          s.nis.includes(searchMember)
                      )
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            <div>{st.fullName}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{st.email}</div>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {st.nis}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                              {st.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
