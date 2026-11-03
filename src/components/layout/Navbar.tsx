'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sprout, LogIn, Menu, X, BookOpen, Layers, Award, Sparkles } from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';
import { UserProfile } from '@/types';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(DataProvider.getCurrentUser());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-emerald-100 dark:border-emerald-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 group-hover:scale-105 transition-all">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
                  EduATPH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  SMK LMS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Agribisnis Tanaman Pangan & Hortikultura
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#tentang"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Tentang Platform
            </Link>
            <Link
              href="#kategori"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              15 Kategori ATPH
            </Link>
            <Link
              href="#fitur"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Fitur Pembelajaran
            </Link>
            <Link
              href="#keunggulan"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
            >
              Keunggulan
            </Link>
          </nav>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Link
                href={
                  currentUser.role === 'admin'
                    ? '/admin/dashboard'
                    : currentUser.role === 'teacher'
                    ? '/guru/dashboard'
                    : '/student/dashboard'
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  Dashboard {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'teacher' ? 'Guru' : 'Siswa'}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="#tentang"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            Tentang Platform
          </Link>
          <Link
            href="#kategori"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            15 Kategori ATPH
          </Link>
          <Link
            href="#fitur"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            Fitur Pembelajaran
          </Link>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Pembelajaran</span>
          </Link>
        </div>
      )}
    </header>
  );
}
