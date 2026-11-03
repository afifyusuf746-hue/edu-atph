'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  GraduationCap,
  LogIn,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Eye,
  EyeOff,
  Download,
  Smartphone,
  Apple,
  Monitor,
  X,
  CheckCircle2,
  KeyRound,
  Info,
  School,
  MoreVertical,
  Layers,
  Check,
  User,
} from 'lucide-react';
import { DataProvider } from '@/lib/data-provider';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallPlatform = 'android' | 'ios' | 'desktop' | null;

export default function StudentLoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState('cls-x-at-1');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<InstallPlatform>('android');
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState('');
  const [installOnLogin, setInstallOnLogin] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed as Android App / PWA)
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Catch install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const triggerNativePrompt = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setInstallSuccessMessage('Aplikasi Android EduATPH berhasil dipasang!');
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Install error:', err);
      }
    }
  };

  const handleInstallClick = useCallback(async () => {
    if (platform === 'ios') {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      await triggerNativePrompt();
    } else {
      // Fallback instructions if prompt is unavailable
      if (platform === 'android') {
        setShowAndroidGuide(true);
      } else {
        alert(
          'Untuk memasang aplikasi di Laptop/PC: Klik ikon Pasang/Install (tanda panah atau komputer kecil) di address bar browser Anda, atau buka Menu > Install EduATPH.'
        );
      }
    }
  }, [deferredPrompt, platform]);

  const handleStudentQuickLogin = async (withInstall = false) => {
    setLoading(true);
    setErrorMessage('');

    if (withInstall || installOnLogin) {
      if (deferredPrompt && !isInstalled) {
        await triggerNativePrompt();
      } else if (platform === 'android' && !isInstalled && !deferredPrompt) {
        setShowAndroidGuide(true);
      }
    }

    try {
      // Daftarkan / Verifikasi akun siswa demo langsung ke Supabase
      const res = await fetch('/api/auth/student-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'siswa.demo@atph.sch.id',
          password: 'skaneba123',
          classId: selectedClass,
          fullName: 'Siswa Demo ATPH',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.user) {
        DataProvider.setCurrentUser(json.user);
        router.push('/student/dashboard');
        return;
      }
    } catch (err) {
      console.warn('Quick login server sync fallback:', err);
    }

    // Fallback lokal jika jaringan offline
    const user = DataProvider.login('', 'student', undefined, selectedClass);
    if (user) {
      router.push('/student/dashboard');
    } else {
      setErrorMessage('Gagal memuat data akun siswa.');
      setLoading(false);
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Silakan masukkan alamat email akun Anda.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Silakan masukkan kata sandi Anda (password resmi: skaneba123).');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    // If install on login is active and prompt available, trigger Android install immediately
    if (installOnLogin && deferredPrompt && !isInstalled) {
      await triggerNativePrompt();
    }

    // Autentikasi Terpadu Berdasarkan Hak Akses (Admin, Guru, Siswa)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          classId: selectedClass,
          fullName: fullName.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setLoading(false);
        setErrorMessage(json.error || 'Gagal memproses masuk. Periksa kembali email dan kata sandi.');
        return;
      }

      const serverUser = json.user;
      if (serverUser) {
        // Sinkronkan ke DataProvider lokal agar kompatibel dengan seluruh komponen UI
        DataProvider.setCurrentUser(serverUser);

        // Jika belum ada di list pengguna lokal, tambahkan
        const localUsers = DataProvider.getUsers();
        if (!localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
          localUsers.push(serverUser);
          try {
            localStorage.setItem('eduatph_users', JSON.stringify(localUsers));
          } catch {}
        }

        // Arahkan ke dashboard sesuai role pengguna
        router.push(json.redirectUrl || '/student/dashboard');
        return;
      }
    } catch (err: any) {
      console.warn('Login network error:', err);
    }

    // Fallback lokal jika ada kendala jaringan total
    const fallbackUser = DataProvider.login(cleanEmail, cleanPassword, 'student', selectedClass, fullName.trim());
    if (fallbackUser) {
      if (fallbackUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } else {
      setLoading(false);
      setErrorMessage('Gagal memproses masuk. Silakan periksa kembali email Anda.');
    }
  };

  const PlatformIcon = platform === 'ios' ? Apple : platform === 'android' ? Smartphone : Monitor;
  const platformLabel =
    platform === 'ios' ? 'iPhone / iPad' : platform === 'android' ? 'HP Android' : 'Laptop / PC';

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/beranda" className="inline-flex items-center gap-2 mb-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 group-hover:scale-105 transition-all">
            <Sprout className="w-7 h-7" />
          </div>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Ruang Belajar Siswa ATPH</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Masuk Portal Siswa
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Gunakan email masing-masing dengan kata sandi <strong>skaneba123</strong>
        </p>

        {/* ANDROID APP PROMINENT INSTALL BANNER (APK / PWA) */}
        <div className="mt-4 mb-2">
          {isInstalled ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>EduATPH Terpasang dalam Mode Aplikasi Android Standalone</span>
            </div>
          ) : (
            <div className="rounded-2xl p-3.5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 text-white shadow-xl space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-black text-white leading-tight">
                        Aplikasi Android EduATPH
                      </p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-slate-950 uppercase">
                        WebAPK
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-200/90 leading-tight">
                      Layar Penuh • Ikon di Layar Utama HP • Bebas Alamat URL
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pasang Aplikasi Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAndroidGuide(true)}
                  className="py-2 px-3 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 transition-all"
                  title="Lihat cara pasang di Chrome"
                >
                  <span>Cara Pasang (⋮)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-7 px-5 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-800 sm:px-9 space-y-5">
          {installSuccessMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{installSuccessMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Quick Access Switcher (Student Only) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="uppercase tracking-wider">Akses Cepat Siswa Demo</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                1-Klik
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStudentQuickLogin(true)}
              disabled={loading}
              className="w-full p-3.5 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-50 text-emerald-950 dark:text-emerald-200 flex items-center justify-between text-left transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    Masuk Cepat & Pasang Aplikasi Android
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Akun Siswa Demo • Langsung memicu install aplikasi
                  </p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold tracking-wider">
                Atau Masuk dengan Email & Pilih Kelas
              </span>
            </div>
          </div>

          {/* Form Login Siswa */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            {/* PILIHAN KELAS SISWA (X AT 1/2/3, XI AT 1/2/3, XII AT 1/2/3) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilihan Kelas (Rombel ATPH)
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Wajib Dipilih
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                  <School className="w-4 h-4" />
                </div>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
                >
                  <optgroup label="── TINGKAT X (Dasar Kejuruan ATPH) ──">
                    <option value="cls-x-at-1">X AT 1 (Kelas 10 Agribisnis Tanaman 1)</option>
                    <option value="cls-x-at-2">X AT 2 (Kelas 10 Agribisnis Tanaman 2)</option>
                    <option value="cls-x-at-3">X AT 3 (Kelas 10 Agribisnis Tanaman 3)</option>
                  </optgroup>
                  <optgroup label="── TINGKAT XI (Praktik Budidaya Lanjutan) ──">
                    <option value="cls-xi-at-1">XI AT 1 (Kelas 11 Agribisnis Tanaman 1)</option>
                    <option value="cls-xi-at-2">XI AT 2 (Kelas 11 Agribisnis Tanaman 2)</option>
                    <option value="cls-xi-at-3">XI AT 3 (Kelas 11 Agribisnis Tanaman 3)</option>
                  </optgroup>
                  <optgroup label="── TINGKAT XII (Pascapanen & Kewirausahaan) ──">
                    <option value="cls-xii-at-1">XII AT 1 (Kelas 12 Agribisnis Tanaman 1)</option>
                    <option value="cls-xii-at-2">XII AT 2 (Kelas 12 Agribisnis Tanaman 2)</option>
                    <option value="cls-xii-at-3">XII AT 3 (Kelas 12 Agribisnis Tanaman 3)</option>
                  </optgroup>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Akun langsung terhubung ke Manajemen Kelas & Siswa guru sesuai rombel di atas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap Siswa <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan (Kosongkan jika auto)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Nama akan tercatat di Manajemen Kelas guru dan Transkrip Rapor Nilai resmi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Alamat Email Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.kamu@gmail.com / email sekolah"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Bisa menggunakan email pribadi atau email resmi sekolah.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi Siswa
                </label>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" />
                  <span>Password: skaneba123</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik password: skaneba123"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox auto install Android App saat login */}
            {!isInstalled && (
              <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={installOnLogin}
                    onChange={(e) => setInstallOnLogin(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Otomatis pasang aplikasi ke Layar Utama HP saat Masuk
                  </span>
                </label>
              </div>
            )}

            {/* Petunjuk kata sandi default */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                Gunakan kata sandi serentak: <strong className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-300">skaneba123</strong> untuk masuk ke akun Anda.
              </div>
            </div>

            {/* Submit Button with Android App emphasis */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>
                {loading
                  ? 'Memverifikasi & Mempersiapkan Aplikasi...'
                  : installOnLogin && !isInstalled
                  ? 'Masuk & Pasang Aplikasi Android'
                  : 'Masuk ke Ruang Belajar'}
              </span>
            </button>
          </form>
        </div>

        {/* Link to Information & Curriculum */}
        <div className="mt-5 text-center">
          <Link
            href="/beranda"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lihat Profil Jurusan & 15 Modul Kurikulum ATPH</span>
          </Link>
        </div>
      </div>

      {/* MODAL PANDUAN PASANG APLIKASI DI HP ANDROID */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 text-white">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Pasang Aplikasi di HP Android</h3>
                  <p className="text-[10px] text-emerald-400">Google Chrome / Samsung Internet</p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-slate-300 text-xs leading-relaxed">
                Pasang EduATPH ke Layar Utama HP Android Anda dalam 3 langkah mudah:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Ketuk Menu Titik Tiga</span>
                      <span className="p-0.5 rounded bg-slate-700 font-mono text-[10px]">⋮</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Berada di pojok kanan atas browser Google Chrome Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Pilih &quot;Pasang Aplikasi&quot; atau &quot;Tambahkan ke Layar Utama&quot;
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Menu dengan ikon download atau tanda panah ke bawah.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/40">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-200">
                      Ketuk &quot;Install / Pasang&quot;
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Ikon EduATPH akan muncul di layar HP Anda layaknya aplikasi Android resmi dari Play Store!
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                {deferredPrompt && (
                  <button
                    onClick={async () => {
                      await triggerNativePrompt();
                      setShowAndroidGuide(false);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Coba Munculkan Tombol Install Otomatis</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAndroidGuide(false)}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
                >
                  Saya Mengerti, Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN INSTALL IPHONE / IPAD (iOS) */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-slate-300" />
                <h3 className="text-white font-bold text-sm">Pasang di iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-400 text-xs">
                Safari di iPhone/iPad memerlukan 3 langkah mudah untuk menambahkan aplikasi ke Layar Utama:
              </p>
              {[
                {
                  icon: '⬆️',
                  title: '1. Ketuk ikon "Share" (Bagikan)',
                  desc: 'Tombol kotak dengan panah ke atas di bagian bawah Safari.',
                  color: 'bg-blue-900/40 border-blue-700/50',
                },
                {
                  icon: '➕',
                  title: '2. Pilih "Add to Home Screen"',
                  desc: 'Geser ke bawah dan pilih "Tambahkan ke Layar Utama".',
                  color: 'bg-emerald-900/40 border-emerald-700/50',
                },
                {
                  icon: '✅',
                  title: '3. Ketuk "Add" / "Tambah"',
                  desc: 'Ikon EduATPH akan muncul di homescreen layaknya aplikasi biasa!',
                  color: 'bg-emerald-900/60 border-emerald-600/50',
                },
              ].map(({ icon, title, desc, color }) => (
                <div key={title} className={`flex items-start gap-3 p-3 rounded-2xl border ${color}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
                    {icon}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
              >
                Saya Mengerti, Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
