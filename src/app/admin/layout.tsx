'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { AdminNavProvider } from '@/context/AdminNavContext';
import { DataProvider } from '@/lib/data-provider';
import { UserProfile } from '@/types';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    const user = DataProvider.getCurrentUser();
    setCurrentUser(user);
    if (!user) {
      router.push('/login?redirect=/admin/dashboard');
    } else if (user.role !== 'admin') {
      // Siswa dan guru tidak boleh mengakses rute admin, arahkan ke 403 Forbidden
      router.push('/403');
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi Hak Akses Administrator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Bypass sidebar and container layout for the admin login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminNavProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminNavProvider>
  );
}
