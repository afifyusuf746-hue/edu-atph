import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngreirksuoraurufzftn.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_Tj16Oq3f9BqbVj35Le-7bQ_avuh1PjD';

// Class dictionary helper
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

// Generate deterministic unique student ID from clean email
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
    const { email, password, classId, className, fullName, nis } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Validasi kata sandi wajib skaneba123 (kecuali demo login dengan email yang valid)
    if (cleanPassword !== 'skaneba123' && !cleanEmail.includes('demo')) {
      return NextResponse.json(
        { error: 'Kata sandi siswa salah! Password resmi: skaneba123' },
        { status: 401 }
      );
    }

    const studentId = generateStudentId(cleanEmail);
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName =
      namePart
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ') || 'Siswa ATPH';

    const resolvedName = (fullName && fullName.trim()) || formattedName;

    // Deterministic NISN based on email hash
    let nisnSeed = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      nisnSeed = (nisnSeed * 31 + cleanEmail.charCodeAt(i)) % 90000000;
    }
    const resolvedNisn = nis ? String(nis).trim() : `00${(10000000 + Math.abs(nisnSeed)).toString()}`;

    // Resolve class ID & name
    const targetClassId = classId || 'cls-x-at-1';
    const targetClassName = className || CLASS_MAP[targetClassId] || 'X AT 1';
    const nowIso = new Date().toISOString();

    let studentRecord: any = null;
    let isNewStudent = false;
    let databaseError = null;

    // Database check & auto-register in Supabase
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      });

      // 1. Cek apakah profil siswa sudah ada di database Supabase berdasarkan email
      const { data: existingStudent, error: findErr } = await supabase
        .from('students')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (findErr) {
        console.warn('Supabase check student warning:', findErr.message);
      }

      if (existingStudent) {
        // SISWA SUDAH TERDAFTAR: Ambil profil yang sudah ada & perbarui terakhir login
        isNewStudent = false;
        const updatePayload: any = {
          last_login_at: nowIso,
          updated_at: nowIso,
        };

        // Jika siswa memilih kelas spesifik saat login, perbarui rombelnya
        if (targetClassId && targetClassId !== existingStudent.class_id) {
          updatePayload.class_id = targetClassId;
          updatePayload.class_name = targetClassName;
        }
        if (fullName && fullName.trim() && fullName.trim() !== existingStudent.full_name) {
          updatePayload.full_name = fullName.trim();
        }

        const { data: updatedData, error: updateErr } = await supabase
          .from('students')
          .update(updatePayload)
          .eq('id', existingStudent.id)
          .select()
          .maybeSingle();

        studentRecord = updatedData || { ...existingStudent, ...updatePayload };

        // Pastikan relasi class_students terisi
        try {
          await supabase.from('class_students').upsert(
            {
              class_id: studentRecord.class_id || targetClassId,
              student_id: studentRecord.id,
              academic_year: '2025/2026',
              status: 'active',
            },
            { onConflict: 'class_id,student_id' }
          );
        } catch {}
      } else {
        // SISWA BARU: Auto-Register profil siswa baru ke Supabase
        isNewStudent = true;
        const newStudentPayload = {
          id: studentId,
          full_name: resolvedName,
          nis: resolvedNisn,
          nisn: resolvedNisn,
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          class_id: targetClassId,
          class_name: targetClassName,
          major: 'Agribisnis Tanaman Pangan dan Hortikultura',
          status: 'active',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
          last_login_at: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        };

        const { data: insertedData, error: insertErr } = await supabase
          .from('students')
          .insert(newStudentPayload)
          .select()
          .maybeSingle();

        if (insertErr) {
          console.warn('Supabase auto-register student error:', insertErr.message);
          databaseError = insertErr.message;
        }

        studentRecord = insertedData || newStudentPayload;

        // Hubungkan siswa ke kelas di tabel class_students
        try {
          await supabase.from('class_students').upsert(
            {
              class_id: targetClassId,
              student_id: studentId,
              academic_year: '2025/2026',
              status: 'active',
            },
            { onConflict: 'class_id,student_id' }
          );
        } catch {}

        // Sinkronkan juga ke edu_profiles jika tabel tersedia
        try {
          await supabase.from('edu_profiles').upsert(
            {
              id: studentId,
              full_name: resolvedName,
              email: cleanEmail,
              role: 'student',
              class_name: targetClassName,
              student_number: resolvedNisn,
              is_active: true,
            },
            { onConflict: 'email' }
          );
        } catch {}
      }
    } catch (dbErr: any) {
      console.warn('Supabase connection error during login:', dbErr?.message);
      databaseError = dbErr?.message;
    }

    // Bangun objek user profile terstandarisasi untuk client
    const studentUser = {
      id: studentRecord?.id || studentId,
      email: cleanEmail,
      fullName: studentRecord?.full_name || resolvedName,
      role: 'student',
      nisn: studentRecord?.nisn || studentRecord?.nis || resolvedNisn,
      classId: studentRecord?.class_id || targetClassId,
      className: studentRecord?.class_name || targetClassName,
      major: studentRecord?.major || 'Agribisnis Tanaman Pangan dan Hortikultura',
      avatarUrl:
        studentRecord?.avatar_url ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      isActive: studentRecord?.status !== 'nonaktif',
      lastLoginAt: studentRecord?.last_login_at || nowIso,
      createdAt: studentRecord?.created_at || nowIso,
      syncedWithSupabase: !databaseError,
    };

    const response = NextResponse.json({
      success: true,
      user: studentUser,
      isNewStudent,
      message: isNewStudent
        ? 'Pendaftaran akun siswa otomatis berhasil dan sesi aktif di Supabase'
        : 'Selamat datang kembali! Sesi siswa aktif',
      dbSync: !databaseError,
    });

    // Simpan ke cookie HTTP untuk persistensi antar tab & refresh (30 hari)
    response.cookies.set('edu_student_session', JSON.stringify(studentUser), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal memproses sesi siswa' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('edu_student_session');
    if (!cookie?.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = JSON.parse(cookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil, sesi berakhir',
  });
  response.cookies.delete('edu_student_session');
  return response;
}
