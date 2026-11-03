'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherSidebar from '@/components/layout/TeacherSidebar';
import { DataProvider } from '@/lib/data-provider';
import { UserProfile } from '@/types';

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = DataProvider.getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      router.push('/login?redirect=/guru/dashboard');
    } else if (user.role === 'student') {
      // Siswa dilarang masuk ke portal guru
      router.push('/403');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi Hak Akses Guru ATPH...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <TeacherSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
