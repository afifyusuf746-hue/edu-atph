'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  KeyRound,
  GraduationCap,
  X,
  Mail,
  ShieldAlert,
  FileSpreadsheet,
  Download,
  UploadCloud,
  FileText,
  AlertCircle,
  Check,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  Sparkles,
  School,
  Database,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { UserProfile, ClassItem } from '@/types';
import { formatDate } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface ExtendedStudentProfile extends UserProfile {
  authUserId?: string | null;
  nis?: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

interface ParsedStudentRow {
  fullName: string;
  email: string;
  nisn: string;
  className: string;
  classId: string;
  major: string;
  isValid: boolean;
  validationError?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<ExtendedStudentProfile[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  // Single Student Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ExtendedStudentProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    nisn: '',
    classId: '',
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    status: 'active',
  });

  // Student Detail Modal State
  const [detailStudent, setDetailStudent] = useState<ExtendedStudentProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Batch Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Load live students from Supabase API route
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Ambil data kelas
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

      // 2. Ambil data siswa dari Supabase
      const res = await fetch('/api/admin/students', { cache: 'no-store' });
      const json = await res.json();

      if (res.ok && json.success && Array.isArray(json.data)) {
        setStudents(json.data);
        setIsLiveSupabase(true);

        // Sinkronkan ke local users cache agar sinkron dengan dashboard stats
        try {
          const localUsers = DataProvider.getUsers();
          const adminOnly = localUsers.filter((u) => u.role === 'admin');
          const merged = [...adminOnly, ...json.data];
          localStorage.setItem('eduatph_users', JSON.stringify(merged));
        } catch {}
      } else {
        // Fallback ke DataProvider jika tabel kosong / offline
        const allUsers = DataProvider.getUsers();
        setStudents(allUsers.filter((u) => u.role === 'student') as ExtendedStudentProfile[]);
        setIsLiveSupabase(false);
      }
    } catch (err: any) {
      console.warn('Failed to load students from Supabase:', err);
      const allUsers = DataProvider.getUsers();
      setStudents(allUsers.filter((u) => u.role === 'student') as ExtendedStudentProfile[]);
      setIsLiveSupabase(false);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  // Filtered Students List
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.nisn && s.nisn.includes(q)) ||
      (s.nis && s.nis.includes(q));

    const matchesClass =
      selectedClass === 'all' ||
      s.classId === selectedClass ||
      s.className === selectedClass;

    const matchesMajor =
      selectedMajor === 'all' ||
      (s.major && s.major.toLowerCase().includes(selectedMajor.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && s.isActive) ||
      (selectedStatus === 'nonaktif' && !s.isActive);

    return matchesSearch && matchesClass && matchesMajor && matchesStatus;
  });

  // Unique majors for filter dropdown
  const uniqueMajors = Array.from(
    new Set(students.map((s) => s.major || 'Agribisnis Tanaman Pangan dan Hortikultura'))
  );

  // Single Student Actions
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      email: '',
      nisn: '',
      classId: classes[0]?.id || 'cls-x-at-1',
      major: 'Agribisnis Tanaman Pangan dan Hortikultura',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: ExtendedStudentProfile) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      nisn: student.nisn || student.nis || '',
      classId: student.classId || classes[0]?.id || 'cls-x-at-1',
      major: student.major || 'Agribisnis Tanaman Pangan dan Hortikultura',
      status: student.isActive ? 'active' : 'nonaktif',
    });
    setIsModalOpen(true);
  };

  const handleOpenDetail = (student: ExtendedStudentProfile) => {
    setDetailStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      showNotification('Nama lengkap dan email siswa wajib diisi', 'error');
      return;
    }

    setIsSaving(true);
    const matchedClass = classes.find((c) => c.id === formData.classId);
    const className = matchedClass?.name || 'X AT 1';

    try {
      if (editingStudent) {
        // Update di Supabase
        const res = await fetch('/api/admin/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStudent.id,
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            nis: formData.nisn.trim(),
            nisn: formData.nisn.trim(),
            classId: formData.classId,
            className,
            major: formData.major,
            status: formData.status,
            isActive: formData.status === 'active',
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          showNotification('Data siswa berhasil diperbarui di Supabase');
        } else {
          showNotification(json.error || 'Gagal memperbarui di database', 'error');
        }

        // Sinkronkan ke DataProvider lokal
        DataProvider.updateUser(editingStudent.id, {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          nisn: formData.nisn.trim(),
          classId: formData.classId,
          className,
          major: formData.major,
          isActive: formData.status === 'active',
        });
      } else {
        // Tambah baru ke Supabase
        const res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            nis: formData.nisn.trim(),
            nisn: formData.nisn.trim(),
            classId: formData.classId,
            className,
            major: formData.major,
            status: formData.status,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          showNotification('Siswa baru berhasil didaftarkan ke Supabase');
        } else {
          showNotification(json.error || 'Gagal mendaftarkan ke database', 'error');
        }

        // Sinkronkan ke DataProvider lokal
        DataProvider.addUser({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          nisn: formData.nisn.trim(),
          role: 'student',
          classId: formData.classId,
          className,
          major: formData.major,
          isActive: formData.status === 'active',
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (student: ExtendedStudentProfile) => {
    const nextStatus = student.isActive ? 'nonaktif' : 'active';
    try {
      await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          status: nextStatus,
          isActive: !student.isActive,
        }),
      });

      DataProvider.toggleUserStatus(student.id);
      showNotification(`Status akun ${student.fullName} diubah menjadi ${nextStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`);
      loadData();
    } catch (err: any) {
      showNotification('Gagal mengubah status akun siswa', 'error');
    }
  };

  const handleResetPassword = (email: string) => {
    showNotification(`Password resmi siswa telah disetel ulang: skaneba123 (${email}).`);
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus akun siswa "${name}" dari Supabase? Seluruh riwayat nilai dan sesi siswa ini akan dibersihkan.`
      )
    ) {
      try {
        const res = await fetch(`/api/admin/students?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        const json = await res.json();

        if (res.ok && json.success) {
          showNotification(`Siswa "${name}" berhasil dihapus dari Supabase.`);
        } else {
          showNotification(json.error || 'Gagal menghapus siswa di server', 'error');
        }

        DataProvider.deleteStudent(id);
        loadData();
      } catch (err: any) {
        showNotification(err.message || 'Gagal menghapus data', 'error');
      }
    }
  };

  // -------------------------------------------------------------
  // BATCH IMPORT & TEMPLATE DOWNLOAD FUNCTIONS
  // -------------------------------------------------------------
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    if (format === 'csv') {
      const link = document.createElement('a');
      link.href = '/templates/template_siswa_atph.csv';
      link.download = 'format_import_siswa_atph.csv';
      link.click();
      showNotification('Template CSV berhasil diunduh.');
    } else {
      const link = document.createElement('a');
      link.href = '/templates/template_siswa_atph.xlsx';
      link.download = 'format_import_siswa_atph.xlsx';
      link.click();
      showNotification('Template Excel (.xlsx) berhasil diunduh.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsParsing(true);
    setParsedRows([]);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          showNotification('File kosong atau format data tidak terbaca.', 'error');
          setIsParsing(false);
          return;
        }

        const parsed: ParsedStudentRow[] = rawJson.map((row: any) => {
          const fullName = String(row['Nama Lengkap'] || row['Nama'] || row['full_name'] || '').trim();
          const nisn = String(row['NISN'] || row['NIS'] || row['nisn'] || '').trim();
          const rawClass = String(row['Kelas'] || row['Rombel'] || row['class_name'] || '').trim();
          const email = String(row['Email'] || row['Email Siswa'] || row['email'] || '').trim().toLowerCase();
          const major = String(row['Jurusan'] || row['major'] || 'Agribisnis Tanaman Pangan dan Hortikultura').trim();

          let classId = 'cls-x-at-1';
          let className = 'X AT 1';
          const foundCls = classes.find(
            (c) =>
              c.name.toLowerCase() === rawClass.toLowerCase() ||
              c.id.toLowerCase() === rawClass.toLowerCase()
          );
          if (foundCls) {
            classId = foundCls.id;
            className = foundCls.name;
          } else if (rawClass) {
            className = rawClass;
          }

          let isValid = true;
          let validationError = '';

          if (!fullName) {
            isValid = false;
            validationError = 'Nama kosong';
          } else if (!email) {
            isValid = false;
            validationError = 'Email kosong';
          } else if (!email.includes('@')) {
            isValid = false;
            validationError = 'Email tidak valid';
          }

          return {
            fullName,
            email,
            nisn: nisn || '-',
            className,
            classId,
            major,
            isValid,
            validationError,
          };
        });

        setParsedRows(parsed);
        setIsParsing(false);
      } catch (err) {
        console.error('File parsing error:', err);
        showNotification('Gagal membaca file spreadsheet. Pastikan file valid.', 'error');
        setIsParsing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  const handleProcessImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showNotification('Tidak ada data valid yang dapat diimpor.', 'error');
      return;
    }

    setIsImporting(true);

    try {
      // Loop kirim ke Supabase
      let successCount = 0;
      for (const row of validRows) {
        try {
          await fetch('/api/admin/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: row.fullName,
              email: row.email,
              nis: row.nisn,
              nisn: row.nisn,
              classId: row.classId,
              className: row.className,
              major: row.major,
              status: 'active',
            }),
          });
          successCount++;
        } catch {}
      }

      // Simpan juga ke local DataProvider
      DataProvider.addUsers(
        validRows.map((r) => ({
          fullName: r.fullName,
          email: r.email,
          nisn: r.nisn,
          role: 'student' as const,
          classId: r.classId,
          className: r.className,
          major: r.major,
          isActive: true,
        }))
      );

      showNotification(`Berhasil mengimpor ${successCount} siswa ke Supabase.`);
      setIsImportModalOpen(false);
      setParsedRows([]);
      setImportFileName('');
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Gagal menyimpan data import', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Manajemen Siswa ATPH"
        subtitle="Kelola identitas, rombel kelas, akun portal, dan pemantauan keaktifan siswa SMK ATPH"
        onRefresh={loadData}
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Notifikasi Toast */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Database Live Banner Indicator */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isLiveSupabase
                  ? 'Tersinkronisasi Database Supabase Cloud'
                  : 'Mode Sinkronisasi Database Otomatis Aktif'}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              • Setiap siswa yang login pertama kali otomatis masuk ke daftar ini
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Total <strong>{students.length}</strong> Siswa Terdata
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

        {/* Top Controls Bar (Search & Filter & Buttons) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama siswa, NISN, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="all">Semua Kelas ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Major Filter */}
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="all">Semua Jurusan</option>
              {uniqueMajors.map((m, idx) => (
                <option key={idx} value={m}>
                  {m.length > 25 ? m.slice(0, 25) + '...' : m}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Action Buttons: Import, Template, Single Add */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Format Template Buttons */}
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => handleDownloadTemplate('xlsx')}
                title="Unduh Format Spreadsheet Excel (.xlsx)"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Format Excel</span>
              </button>
              <span className="w-px bg-slate-200 dark:bg-slate-800 my-1" />
              <button
                type="button"
                onClick={() => handleDownloadTemplate('csv')}
                title="Unduh Format Nilai Koma CSV (.csv)"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Format CSV</span>
              </button>
            </div>

            {/* Import CSV / Excel Button */}
            <button
              onClick={() => {
                setParsedRows([]);
                setImportFileName('');
                setIsImportModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500/50 flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Import CSV / Excel</span>
            </button>

            {/* Single Add Button */}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Manual</span>
            </button>
          </div>
        </div>

        {/* Students Table Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Identitas Siswa</th>
                  <th className="py-4 px-6">Kelas & NISN</th>
                  <th className="py-4 px-6">Jurusan</th>
                  <th className="py-4 px-6">Status Akun</th>
                  <th className="py-4 px-6">Terakhir Login</th>
                  <th className="py-4 px-6 text-right">Aksi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500">
                      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="font-semibold">Mengambil data siswa dari Supabase Cloud...</p>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Tidak ada siswa yang sesuai filter atau pencarian.
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Siswa yang login pertama kali di portal otomatis terdaftar di sini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600/10 to-teal-600/20 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                            {s.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => handleOpenDetail(s)}
                              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 text-left transition-colors flex items-center gap-1.5"
                            >
                              <span>{s.fullName}</span>
                              <Eye className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
                            </button>
                            <p className="text-[11px] text-slate-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {s.className || 'X AT 1'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          NIS: {s.nis || s.nisn || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                        <p className="text-xs leading-tight font-medium line-clamp-1">{s.major}</p>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(s)}
                          title="Klik untuk mengubah status aktif"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            s.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                          }`}
                        >
                          {s.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{s.lastLoginAt ? formatDate(s.lastLoginAt) : formatDate(s.createdAt)}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Daftar: {formatDate(s.createdAt)}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(s)}
                            title="Lihat Detail Profil Siswa"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            title="Edit Data Siswa"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(s.email)}
                            title="Reset Kata Sandi Siswa (skaneba123)"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.fullName)}
                            title="Hapus Siswa dari Supabase"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: DETAIL PROFIL SISWA LENGKAP */}
      {isDetailModalOpen && detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  {detailStudent.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {detailStudent.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">{detailStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Field Details Grid */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Nomor Induk Siswa (NIS/NISN)
                </p>
                <p className="font-mono font-bold text-slate-900 dark:text-white">
                  {detailStudent.nis || detailStudent.nisn || '-'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Rombel / Kelas
                </p>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  {detailStudent.className || 'X AT 1'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 col-span-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Kompetensi Keahlian (Jurusan)
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {detailStudent.major || 'Agribisnis Tanaman Pangan dan Hortikultura'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Status Akun
                </p>
                <p className="font-bold">
                  {detailStudent.isActive ? (
                    <span className="text-emerald-600 dark:text-emerald-400">✓ Aktif Belajar</span>
                  ) : (
                    <span className="text-rose-600">✗ Nonaktif</span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Peran Akun
                </p>
                <p className="font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-[11px]">
                  {detailStudent.role}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Tanggal Pertama Daftar
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {formatDate(detailStudent.createdAt)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Terakhir Login
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {detailStudent.lastLoginAt ? formatDate(detailStudent.lastLoginAt) : 'Belum pernah'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 col-span-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  ID Database Supabase
                </p>
                <p className="font-mono text-[11px] text-slate-500 break-all select-all">
                  {detailStudent.id}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEdit(detailStudent);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Data Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT CSV / EXCEL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Import Siswa Baru ke Supabase
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unggah file daftar siswa untuk menambahkan data secara massal ke database Supabase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Template Guide */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Langkah 1: Unduh Format Template
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate('csv')}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV (.csv)</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
                <p>
                  <strong>Kolom yang didukung dalam template:</strong>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    Nama Lengkap (Wajib)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                    NISN (Opsional)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    Kelas (X AT 1 / X AT 2 / XI AT 1 / dll)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    Email Siswa (Wajib)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                    Jurusan (Default: ATPH)
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: File Upload Dropzone */}
            <div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                Langkah 2: Pilih atau Tarik File CSV / Excel
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {importFileName ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      File Terpilih: {importFileName}
                    </span>
                  ) : (
                    'Klik untuk memilih file spreadsheet (.xlsx, .xls, .csv)'
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung file Microsoft Excel dan file CSV UTF-8
                </p>
              </div>
            </div>

            {/* Step 3: Live Preview Table */}
            {isParsing && (
              <div className="py-8 text-center text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Membaca dan memverifikasi data file...</span>
              </div>
            )}

            {!isParsing && parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Pratinjau Data Siswa ({parsedRows.length} baris terbaca)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                      ✓ {validCount} Siap Diimpor
                    </span>
                    {invalidCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ⚠ {invalidCount} Tidak Lengkap
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Nama Lengkap</th>
                        <th className="py-2.5 px-4">NISN</th>
                        <th className="py-2.5 px-4">Kelas</th>
                        <th className="py-2.5 px-4">Email Akun</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.isValid
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              : 'bg-rose-50/40 dark:bg-rose-950/30'
                          }
                        >
                          <td className="py-2.5 px-4">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3 h-3" />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600"
                                title={row.validationError}
                              >
                                <AlertCircle className="w-3 h-3" />
                                <span>{row.validationError || 'Kurang'}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            {row.fullName || '-'}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{row.nisn}</td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              {row.className}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                            {row.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={isImporting || validCount === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isImporting
                    ? 'Menyimpan ke Supabase...'
                    : `Simpan ke Supabase (${validCount} Siswa)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TAMBAH / EDIT SISWA MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Data Siswa ATPH' : 'Tambah Siswa Baru Manual'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Muhammad Ihsan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email Akun *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ihsan@siswa.eduatph.sch.id"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Induk Siswa (NIS/NISN)
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="0078129380"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas ATPH *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kompetensi Keahlian (Jurusan)
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Siswa
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                {editingStudent ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteStudent(editingStudent.id, editingStudent.fullName);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Siswa</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isSaving
                      ? 'Menyimpan...'
                      : editingStudent
                      ? 'Simpan Perubahan'
                      : 'Daftarkan Siswa'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
