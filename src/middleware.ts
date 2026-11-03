import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati static assets, api routes, icons, dan halaman public
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/templates') ||
    pathname.startsWith('/icons') ||
    pathname === '/403' ||
    pathname === '/login' ||
    pathname === '/beranda' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Ambil sesi pengguna dari HTTP Cookie
  let userRole: string | null = null;
  const userSessionCookie = request.cookies.get('edu_user_session')?.value;
  const studentSessionCookie = request.cookies.get('edu_student_session')?.value;

  if (userSessionCookie) {
    try {
      const parsed = JSON.parse(userSessionCookie);
      userRole = parsed?.role || null;
    } catch {}
  } else if (studentSessionCookie) {
    try {
      const parsed = JSON.parse(studentSessionCookie);
      userRole = parsed?.role || 'student';
    } catch {}
  }

  // 1. JALUR ADMIN (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Pengecualian jika ada rute /admin/login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    if (!userRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Hanya role 'admin' yang diizinkan mengakses /admin/*
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    return NextResponse.next();
  }

  // 2. JALUR GURU (/guru/*)
  if (pathname.startsWith('/guru')) {
    if (!userRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role 'student' DILARANG mengakses /guru/*
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    // Guru dan Admin boleh mengakses
    return NextResponse.next();
  }

  // 3. JALUR SISWA (/siswa/* dan /student/*)
  if (pathname.startsWith('/siswa') || pathname.startsWith('/student')) {
    // Redirect alias /siswa/dashboard ke /student/dashboard jika diperlukan
    if (pathname === '/siswa' || pathname === '/siswa/dashboard') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }

    if (!userRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/guru/:path*',
    '/student/:path*',
    '/siswa/:path*',
  ],
};
