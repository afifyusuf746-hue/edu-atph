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
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkServerSession() {
      if (pathname === '/admin/login') {
        setAuthorized(true);
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
        });
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.authenticated && data.user) {
          if (data.user.role === 'admin') {
            setCurrentUser(data.user);
            DataProvider.setCurrentUser(data.user);
            setAuthorized(true);
          } else {
            // Pengguna bukan admin
            router.push('/403');
          }
        } else {
          // Belum terautentikasi di server
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch {
        if (!isMounted) return;
        // Fallback jika API gagal tetapi ada local admin
        const local = DataProvider.getCurrentUser();
        if (local && local.role === 'admin') {
          setCurrentUser(local);
          setAuthorized(true);
        } else {
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    checkServerSession();

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  if (verifying || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi Hak Akses Administrator Server...</span>
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
