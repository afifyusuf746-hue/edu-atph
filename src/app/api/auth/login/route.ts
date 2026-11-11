import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  signSessionToken,
  verifyAdminCredentials,
  verifyTeacherCredentials,
} from '@/lib/server-auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngreirksuoraurufzftn.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_Tj16Oq3f9BqbVj35Le-7bQ_avuh1PjD';

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

const CLASS_MAP: Record<string, string> = {
  'cls-x-at-1': 'X AT 1',
  'cls-x-at-2': 'X AT 2',
  'cls-x-at-3': 'X AT 3',
  'cls-xi-at-1': 'XI AT 1',
  'cls-xi-at-2': 'XI AT 2',
  'cls-xi-at-3': 'XI AT 3',
  'cls-xii-at-1': 'XII AT 1',
  'cls-xii-at-2': 'XII AT 2',
  'cls-xii-at-3': 'XII AT 3',
};

function generateStudentId(email: string): string {
  const clean = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `usr-std-${hex}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, classId, className, fullName } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'Alamat email wajib diisi' }, { status: 400 });
    }

    if (!cleanPassword) {
      return NextResponse.json({ success: false, error: 'Kata sandi wajib diisi' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const isProd = process.env.NODE_ENV === 'production';

    // -------------------------------------------------------------
    // 1. CEK ROLE ADMINISTRATOR (SERVER-SIDE WHITELIST & PASSWORD)
    // -------------------------------------------------------------
    const adminUser = verifyAdminCredentials(cleanEmail, cleanPassword);
    if (adminUser) {
      const signedToken = await signSessionToken({
        userId: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: 'admin',
      });

      const res = NextResponse.json({
        success: true,
        role: 'admin',
        user: adminUser,
        redirectUrl: '/admin/dashboard',
        message: 'Login Administrator berhasil',
      });

      // Set tamper-proof signed session token (HTTP-only)
      res.cookies.set('edu_session_token', signedToken, {
        path: '/',
        httpOnly: true,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 30, // 30 hari
        sameSite: 'lax',
      });

      // Display cookie for UI hydration
      res.cookies.set('edu_user_session', JSON.stringify(adminUser), {
        path: '/',
        httpOnly: false,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });

      return res;
    }

    // -------------------------------------------------------------
    // 2. CEK ROLE GURU / PENDIDIK
    // -------------------------------------------------------------
    const teacherUser = verifyTeacherCredentials(cleanEmail, cleanPassword);
    if (teacherUser) {
      const signedToken = await signSessionToken({
        userId: teacherUser.id,
        email: teacherUser.email,
        fullName: teacherUser.fullName,
        role: 'teacher',
        assignedClasses: teacherUser.assignedClasses,
      });

      const res = NextResponse.json({
        success: true,
        role: 'teacher',
        user: teacherUser,
        redirectUrl: '/guru/dashboard',
        message: 'Selamat datang di Ruang Guru ATPH',
      });

      res.cookies.set('edu_session_token', signedToken, {
        path: '/',
        httpOnly: true,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });

      res.cookies.set('edu_user_session', JSON.stringify(teacherUser), {
        path: '/',
        httpOnly: false,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });

      return res;
    }

    // -------------------------------------------------------------
    // 3. ROLE SISWA (VALIDASI DAN SYNC SUPABASE)
    // -------------------------------------------------------------
    if (cleanPassword !== 'skaneba123' && !cleanEmail.includes('demo')) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi atau kredensial yang Anda masukkan salah.' },
        { status: 401 }
      );
    }

    const studentId = generateStudentId(cleanEmail);
    const targetClassId = classId || 'cls-x-at-1';
    const targetClassName = className || CLASS_MAP[targetClassId] || 'X AT 1';

    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName =
      namePart
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ') || 'Siswa ATPH';
    const resolvedName = (fullName && fullName.trim()) || formattedName;

    let nisnSeed = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      nisnSeed = (nisnSeed * 31 + cleanEmail.charCodeAt(i)) % 90000000;
    }
    const resolvedNis = `00${(10000000 + Math.abs(nisnSeed)).toString()}`;

    let studentRecord: any = null;
    const supabase = getSupabase();

    try {
      const { data: existingStudent, error: findErr } = await supabase
        .from('students')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!findErr && existingStudent) {
        const updatePayload: any = {
          last_login_at: nowIso,
          updated_at: nowIso,
        };
        if (targetClassId && targetClassId !== existingStudent.class_id) {
          updatePayload.class_id = targetClassId;
          updatePayload.class_name = targetClassName;
        }
        if (fullName && fullName.trim() && fullName.trim() !== existingStudent.full_name) {
          updatePayload.full_name = fullName.trim();
        }

        const { data: updated } = await supabase
          .from('students')
          .update(updatePayload)
          .eq('id', existingStudent.id)
          .select()
          .maybeSingle();

        studentRecord = updated || { ...existingStudent, ...updatePayload };
      } else {
        const newStudentPayload = {
          id: studentId,
          full_name: resolvedName,
          nis: resolvedNis,
          nisn: resolvedNis,
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          class_id: targetClassId,
          class_name: targetClassName,
          major: 'Agribisnis Tanaman Pangan dan Hortikultura',
          status: 'active',
          role: 'student',
          last_login_at: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        };

        const { data: inserted, error: insErr } = await supabase
          .from('students')
          .insert(newStudentPayload)
          .select()
          .maybeSingle();

        if (insErr) {
          console.warn('[STUDENT_REGISTER_WARN]', insErr.message);
        }
        studentRecord = inserted || newStudentPayload;
      }
    } catch (err: any) {
      console.warn('Supabase student login sync:', err?.message);
    }

    const studentUser = {
      id: studentRecord?.id || studentId,
      email: cleanEmail,
      fullName: studentRecord?.full_name || resolvedName,
      role: 'student' as const,
      nisn: studentRecord?.nisn || resolvedNis,
      nis: studentRecord?.nis || resolvedNis,
      classId: studentRecord?.class_id || targetClassId,
      className: studentRecord?.class_name || targetClassName,
      major: studentRecord?.major || 'Agribisnis Tanaman Pangan dan Hortikultura',
      avatarUrl:
        studentRecord?.avatar_url ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      isActive: studentRecord?.status !== 'nonaktif',
      lastLoginAt: studentRecord?.last_login_at || nowIso,
      createdAt: studentRecord?.created_at || nowIso,
    };

    const signedToken = await signSessionToken({
      userId: studentUser.id,
      email: studentUser.email,
      fullName: studentUser.fullName,
      role: 'student',
      classId: studentUser.classId,
      className: studentUser.className,
      nisn: studentUser.nisn,
    });

    const res = NextResponse.json({
      success: true,
      role: 'student',
      user: studentUser,
      redirectUrl: '/student/dashboard',
      message: 'Login siswa berhasil',
    });

    res.cookies.set('edu_session_token', signedToken, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    res.cookies.set('edu_user_session', JSON.stringify(studentUser), {
      path: '/',
      httpOnly: false,
      secure: isProd,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    res.cookies.set('edu_student_session', JSON.stringify(studentUser), {
      path: '/',
      httpOnly: false,
      secure: isProd,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal memproses autentikasi' }, { status: 500 });
  }
}
