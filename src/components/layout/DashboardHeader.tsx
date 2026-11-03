'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  LogOut,
  Moon,
  Sun,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  RefreshCw,
  PanelLeft,
  PanelLeftClose,
  Maximize2,
  Minimize2,
  LayoutDashboard,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { UserProfile } from '@/types';
import { useStudentNav } from '@/context/StudentNavContext';
import { useAdminNav } from '@/context/AdminNavContext';
import { ADMIN_NAV_ITEMS } from '@/components/layout/AdminSidebar';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export default function DashboardHeader({ title, subtitle, onRefresh }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const studentNav = useStudentNav();
  const adminNav = useAdminNav();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenuDropdownOpen, setAdminMenuDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const adminMenuDropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = pathname?.startsWith('/admin') || currentUser?.role === 'admin';

  useEffect(() => {
    setCurrentUser(DataProvider.getCurrentUser());
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        adminMenuDropdownRef.current &&
        !adminMenuDropdownRef.current.contains(event.target as Node)
      ) {
        setAdminMenuDropdownOpen(false);
      }
    }

    if (adminMenuDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [adminMenuDropdownOpen]);

  // Close menu dropdown on route change
  useEffect(() => {
    setAdminMenuDropdownOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const isNowDark = !isDark;
    setIsDark(isNowDark);
    if (isNowDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/student-session', { method: 'DELETE' });
    } catch {}
    if (typeof document !== 'undefined') {
      document.cookie = 'edu_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'edu_student_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    DataProvider.logout();
    router.push('/login');
  };

  const handleAdminToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      adminNav?.toggleMobileDrawer();
    } else {
      adminNav?.toggleSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5 glass-panel border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* ======================================================== */}
        {/* ADMIN CONTROLS: Tombol Menu Dashboard & Sidebar Toggle   */}
        {/* ======================================================== */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Tombol Menu Dashboard dengan Dropdown Navigasi Lengkap */}
            <div className="relative" ref={adminMenuDropdownRef}>
              <button
                type="button"
                onClick={() => setAdminMenuDropdownOpen(!adminMenuDropdownOpen)}
                title="Buka Menu Navigasi Dashboard Admin"
                className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs select-none ${
                  adminMenuDropdownOpen
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                <LayoutDashboard
                  className={`w-4 h-4 transition-transform duration-200 ${
                    adminMenuDropdownOpen ? 'text-white scale-110' : 'text-emerald-500'
                  }`}
                />
                <span className="hidden xs:inline sm:inline">Menu Dashboard</span>
                <span className="xs:hidden sm:hidden">Menu</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    adminMenuDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Panel Dropdown Menu Dashboard */}
              {adminMenuDropdownOpen && (
                <div className="absolute left-0 mt-2 w-[310px] sm:w-[460px] max-h-[82vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Menu Navigasi Admin
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          ATPH
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Pilih menu untuk langsung berpindah modul
                      </p>
                    </div>

                    {adminNav && (
                      <button
                        onClick={() => {
                          adminNav.toggleSidebar();
                          setAdminMenuDropdownOpen(false);
                        }}
                        title={adminNav.isSidebarHidden ? 'Tampilkan Sidebar Samping' : 'Sembunyikan Sidebar Samping'}
                        className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {adminNav.isSidebarHidden ? (
                          <>
                            <PanelLeft className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Buka Sidebar</span>
                          </>
                        ) : (
                          <>
                            <PanelLeftClose className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tutup Sidebar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 py-2.5">
                    {ADMIN_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href + '/'));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setAdminMenuDropdownOpen(false)}
                          className={`flex items-start gap-2.5 p-2 rounded-xl transition-all group ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-xs font-bold truncate leading-tight ${
                                  isActive
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-slate-800 dark:text-slate-200 group-hover:text-emerald-600'
                                }`}
                              >
                                {item.label}
                              </p>
                              {isActive && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Dropdown Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs px-1">
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setAdminMenuDropdownOpen(false)}
                      className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline py-1 px-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Halaman Utama Dashboard</span>
                    </Link>

                    <Link
                      href="/"
                      onClick={() => setAdminMenuDropdownOpen(false)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-1 px-1.5"
                    >
                      <span>Web Publik</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Sidebar Toggle (Desktop & Mobile Drawer) */}
            {adminNav && (
              <button
                type="button"
                onClick={handleAdminToggle}
                title={
                  adminNav.isSidebarHidden
                    ? 'Buka Menu Samping'
                    : 'Sembunyikan Menu Samping (Mode Layar Penuh)'
                }
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs"
              >
                {adminNav.isSidebarHidden ? (
                  <>
                    <PanelLeft className="w-4 h-4 text-emerald-500" />
                    <span className="hidden md:inline">Buka Menu</span>
                  </>
                ) : (
                  <>
                    <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
                    <span className="hidden md:inline">Sembunyikan Menu</span>
                  </>
                )}
              </button>
            )}

            {/* Tombol Cepat Direct ke Dashboard Utama Admin */}
            <Link
              href="/admin/dashboard"
              title="Pergi ke Ringkasan Dashboard Admin"
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                pathname === '/admin/dashboard'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-300'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
              <span>Dashboard</span>
              {pathname === '/admin/dashboard' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </Link>
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT CONTROLS: Toggle Sidebar Siswa                   */}
        {/* ======================================================== */}
        {studentNav && (
          <button
            type="button"
            onClick={studentNav.toggleSidebar}
            title={
              studentNav.isSidebarHidden
                ? 'Tampilkan Menu Samping'
                : 'Sembunyikan Menu (Mode Tombol Home iPhone)'
            }
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs flex-shrink-0"
          >
            {studentNav.isSidebarHidden ? (
              <>
                <PanelLeft className="w-4 h-4 text-emerald-500" />
                <span className="hidden md:inline">Buka Menu</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
                <span className="hidden md:inline">Sembunyikan Menu</span>
              </>
            )}
          </button>
        )}

        {/* Title and subtitle */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Quick Refresh if provided */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            title="Muat Ulang Data"
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Fullscreen toggle for immersive learning or admin workspace */}
        {(studentNav || adminNav) && (
          <button
            type="button"
            onClick={() => {
              if (studentNav) {
                studentNav.toggleFullscreen();
              } else if (adminNav) {
                adminNav.toggleFullscreen();
              }
            }}
            title={
              (studentNav?.isFullscreen || adminNav?.isFullscreen)
                ? 'Keluar Layar Penuh'
                : 'Mode Layar Penuh'
            }
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            {(studentNav?.isFullscreen || adminNav?.isFullscreen) ? (
              <Minimize2 className="w-4 h-4 text-amber-500" />
            ) : (
              <Maximize2 className="w-4 h-4 text-teal-600" />
            )}
          </button>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUnreadNotifications(0)}
            title="Notifikasi"
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {currentUser?.role === 'admin' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser?.fullName || 'Pengguna'}
              </p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {currentUser?.role === 'admin' ? 'Administrator' : `Siswa (${currentUser?.className || 'X ATPH'})`}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser?.fullName}
                </p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {currentUser?.role === 'admin'
                      ? 'Administrator Sistem'
                      : currentUser?.role === 'teacher'
                      ? 'Guru / Pendidik ATPH'
                      : 'Siswa Belajar ATPH'}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
