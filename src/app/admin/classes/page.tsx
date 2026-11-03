'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  School,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  X,
  Sparkles,
  RefreshCw,
  Database,
  ArrowRight,
  UserCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { ClassItem, UserProfile } from '@/types';

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

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ExtendedClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  // Modal Tambah / Edit Kelas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ExtendedClassItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: 'X' as 'X' | 'XI' | 'XII',
    description: '',
    academicYear: '2025/2026',
  });

  // Modal Lihat Anggota Siswa Kelas & Pindah Kelas
  const [viewClass, setViewClass] = useState<ExtendedClassItem | null>(null);
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [movingStudentId, setMovingStudentId] = useState<string | null>(null);
  const [targetMoveClassId, setTargetMoveClassId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/classes', { cache: 'no-store' });
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        setClasses(json.data);
        setIsLiveSupabase(true);

        // Perbarui modal anggota jika sedang terbuka
        if (viewClass) {
          const fresh = json.data.find((c: ExtendedClassItem) => c.id === viewClass.id);
          if (fresh) setViewClass(fresh);
        }
      } else {
        const localClasses = DataProvider.getClasses();
        const localStudents = DataProvider.getUsers().filter((u) => u.role === 'student');
        const formatted = localClasses.map((cls) => {
          const enrolled = localStudents.filter(
            (s) => s.classId === cls.id || s.className?.toLowerCase() === cls.name.toLowerCase()
          );
          return {
            ...cls,
            studentCount: enrolled.length,
            students: enrolled.map((s) => ({
              id: s.id,
              fullName: s.fullName,
              email: s.email,
              nis: s.nisn || '-',
              status: s.isActive ? 'active' : 'nonaktif',
            })),
          };
        });
        setClasses(formatted);
        setIsLiveSupabase(false);
      }
    } catch (err: any) {
      console.warn('Failed to load classes from Supabase:', err);
      const localClasses = DataProvider.getClasses();
      setClasses(localClasses as ExtendedClassItem[]);
      setIsLiveSupabase(false);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [viewClass]);

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      gradeLevel: 'X',
      description: '',
      academicYear: '2025/2026',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ExtendedClassItem) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      description: cls.description,
      academicYear: cls.academicYear,
    });
    setIsModalOpen(true);
  };

  const handleOpenViewStudents = (cls: ExtendedClassItem) => {
    setViewClass(cls);
    setStudentSearch('');
    setMovingStudentId(null);
    const otherClass = classes.find((c) => c.id !== cls.id);
    if (otherClass) setTargetMoveClassId(otherClass.id);
    setIsViewStudentsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        // Edit kelas di Supabase
        const res = await fetch('/api/admin/classes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingClass.id,
            name: formData.name,
            gradeLevel: formData.gradeLevel,
            description: formData.description,
            academicYear: formData.academicYear,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showNotification('Kelas berhasil diperbarui di Supabase');
        } else {
          showNotification(json.error || 'Gagal memperbarui kelas di server', 'error');
        }
        DataProvider.updateClass(editingClass.id, formData);
      } else {
        // Tambah kelas baru di Supabase
        const res = await fetch('/api/admin/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showNotification('Kelas baru berhasil ditambahkan ke Supabase');
        } else {
          showNotification(json.error || 'Gagal menambahkan kelas di server', 'error');
        }
        DataProvider.addClass(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kelas ${name}?`)) {
      try {
        const res = await fetch(`/api/admin/classes?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (res.ok && json.success) {
          showNotification(`Kelas ${name} telah dihapus dari Supabase.`);
        } else {
          showNotification(json.error || 'Gagal menghapus kelas', 'error');
        }
        DataProvider.deleteClass(id);
        loadData();
      } catch (err: any) {
        showNotification(err.message || 'Gagal menghapus kelas', 'error');
      }
    }
  };

  // Pindahkan Siswa ke Kelas Lain
  const handleMoveStudent = async (studentId: string, studentName: string) => {
    if (!targetMoveClassId) return;
    const targetClass = classes.find((c) => c.id === targetMoveClassId);
    if (!targetClass) return;

    if (
      !confirm(
        `Pindahkan siswa "${studentName}" dari kelas ${viewClass?.name} ke ${targetClass.name}?`
      )
    ) {
      return;
    }

    setIsMoving(true);
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move_student',
          studentId,
          targetClassId: targetClass.id,
          targetClassName: targetClass.name,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showNotification(`Siswa "${studentName}" berhasil dipindahkan ke ${targetClass.name}.`);
        setMovingStudentId(null);
        await loadData();
      } else {
        showNotification(json.error || 'Gagal memindahkan siswa', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Gagal memproses pemindahan', 'error');
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Manajemen Kelas ATPH"
        subtitle="Atur rombongan belajar tingkat X, XI, dan XII Agribisnis Tanaman Pangan dan Hortikultura"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Database Status Banner */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isLiveSupabase
                  ? 'Data Rombel & Anggota Terhubung Langsung ke Supabase'
                  : 'Mode Sinkronisasi Kelas Aktif'}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              • Jumlah siswa dihitung dinamis dari pendaftaran siswa aktif
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {classes.length} Rombongan Belajar
            </span>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Refresh Data dari Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daftar Rombel & Keanggotaan Kelas
            </h2>
            <p className="text-xs text-slate-500">
              Materi, kuis, dan penilaian tersinkronisasi otomatis dengan anggota kelas di bawah ini
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-semibold text-xs">Memuat daftar rombel kelas dari Supabase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const memberCount = cls.studentCount || (cls.students?.length ?? 0);
              return (
                <div
                  key={cls.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                        {cls.gradeLevel}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          title="Edit Info Kelas"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id, cls.name)}
                          title="Hapus Kelas"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cls.description || 'Kelas Agribisnis Tanaman Pangan dan Hortikultura'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{memberCount} Siswa Terdaftar</span>
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {cls.academicYear}
                      </span>
                    </div>

                    {/* Tombol Lihat Anggota Kelas & Pindah Kelas */}
                    <button
                      type="button"
                      onClick={() => handleOpenViewStudents(cls)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/40 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Daftar Anggota ({memberCount})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: LIHAT ANGGOTA KELAS & PINDAH KELAS SISWA */}
      {isViewStudentsOpen && viewClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center border border-emerald-500/20">
                  {viewClass.gradeLevel}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Anggota Rombel: {viewClass.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total {viewClass.students?.length ?? 0} siswa terdaftar di kelas ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewStudentsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pencarian Siswa dalam Kelas */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa di rombel ini..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Daftar Siswa */}
            <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              {(!viewClass.students || viewClass.students.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada siswa yang terdaftar di kelas {viewClass.name}.
                  <p className="mt-1 text-[11px] text-slate-500">
                    Siswa dapat memilih kelas ini saat login pertama kali atau ditambahkan manual dari Manajemen Siswa.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Nama Siswa</th>
                      <th className="py-2.5 px-4">NIS</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Aksi Pindah Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewClass.students
                      .filter(
                        (s) =>
                          !studentSearch ||
                          s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.nis.includes(studentSearch)
                      )
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            <div>{st.fullName}</div>
                            <div className="text-[10px] font-normal text-slate-500">{st.email}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {st.nis}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                st.status === 'active'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {st.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {movingStudentId === st.id ? (
                              <div className="inline-flex items-center gap-1.5">
                                <select
                                  value={targetMoveClassId}
                                  onChange={(e) => setTargetMoveClassId(e.target.value)}
                                  className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold"
                                >
                                  {classes
                                    .filter((c) => c.id !== viewClass.id)
                                    .map((c) => (
                                      <option key={c.id} value={c.id}>
                                        Pindah ke {c.name}
                                      </option>
                                    ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleMoveStudent(st.id, st.fullName)}
                                  disabled={isMoving}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                                >
                                  {isMoving ? '...' : 'OK'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMovingStudentId(null)}
                                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-[10px]"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setMovingStudentId(st.id);
                                  const other = classes.find((c) => c.id !== viewClass.id);
                                  if (other) setTargetMoveClassId(other.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                Pindah Rombel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Perubahan rombel langsung tersimpan di Supabase</span>
              <button
                type="button"
                onClick={() => setIsViewStudentsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH / EDIT KELAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Kelas ATPH' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: X AT 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat / Jenjang *
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeLevel: e.target.value as 'X' | 'XI' | 'XII' })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="X">Tingkat X (Kelas 10)</option>
                  <option value="XI">Tingkat XI (Kelas 11)</option>
                  <option value="XII">Tingkat XII (Kelas 12)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="2025/2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan / Fokus Rombel
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi kegiatan belajar kelas..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
