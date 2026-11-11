'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sprout,
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  FileCheck2,
  Inbox,
  HelpCircle,
  Award,
  Megaphone,
  Settings,
  ArrowLeft,
  ChevronRight,
  PanelLeftClose,
  X,
  LogOut,
} from 'lucide-react';
import { useAdminNav } from '@/context/AdminNavContext';
import { DataProvider } from '@/lib/data-provider';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, desc: 'Ringkasan & Statistik ATPH' },
  { label: 'Manajemen Siswa', href: '/admin/students', icon: Users, desc: 'Kelola Akun & Data Siswa' },
  { label: 'Manajemen Kelas', href: '/admin/classes', icon: School, desc: 'Rombongan Belajar ATPH' },
  { label: 'Materi ATPH', href: '/admin/materials', icon: BookOpen, desc: 'Modul & Bahan Ajar' },
  { label: 'Manajemen Tugas', href: '/admin/assignments', icon: FileCheck2, desc: 'Tugas Praktik & LKPD' },
  { label: 'Pengumpulan Tugas', href: '/admin/submissions', icon: Inbox, desc: 'Periksa & Nilai Tugas' },
  { label: 'Kuis & Evaluasi', href: '/admin/quizzes', icon: HelpCircle, desc: 'Bank Soal & Ujian Online' },
  { label: 'Rekap Nilai Siswa', href: '/admin/grades', icon: Award, desc: 'Transkrip & Rapor Siswa' },
  { label: 'Pengumuman', href: '/admin/announcements', icon: Megaphone, desc: 'Info & Edaran Kelas' },
  { label: 'Pengaturan & Backup', href: '/admin/settings', icon: Settings, desc: 'Backup & Konfigurasi' },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const nav = useAdminNav();
  const isHidden = nav?.isSidebarHidden ?? false;
  const isMobileDrawerOpen = nav?.isMobileDrawerOpen ?? false;
  const closeDrawer = () => nav?.setIsMobileDrawerOpen(false);
  const toggleSidebar = () => nav?.toggleSidebar();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    DataProvider.logout();
    closeDrawer();
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay when Drawer is Open */}
      {isMobileDrawerOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar (Responsive Drawer on Mobile, Collapsible on Desktop) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 lg:static
          w-72 flex-shrink-0 min-h-screen bg-slate-900 text-slate-300 border-r border-slate-800
          flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isMobileDrawerOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isHidden ? 'lg:hidden' : 'lg:flex'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={closeDrawer}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl text-white tracking-tight">EduATPH</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Digital Learning Management</p>
                </div>
              </Link>

              {/* Close button for mobile drawer */}
              <button
                onClick={closeDrawer}
                title="Tutup Menu"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Collapse button for desktop */}
              <button
                onClick={toggleSidebar}
                title="Sembunyikan Menu Samping (Layar Penuh)"
                className="hidden lg:flex p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Admin badge */}
            <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                ON
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Okta Nofiyanto</p>
                <p className="text-[10px] text-emerald-400 font-medium truncate">Administrator Utama</p>
              </div>
            </div>
          </div>

          {/* Navigation list */}
          <div className="px-3 py-4 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Menu Administrator
            </p>
            <nav className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer links: landing page & logout */}
          <div className="p-4 border-t border-slate-800 mt-auto space-y-1">
            <Link
              href="/"
              onClick={closeDrawer}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Publik</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Admin</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
