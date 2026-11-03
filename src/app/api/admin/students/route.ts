import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// GET: Ambil daftar seluruh siswa langsung dari Supabase
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query = supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (classId && classId !== 'all') {
      query = query.or(`class_id.eq.${classId},class_name.eq.${classId}`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      const cleanSearch = search.trim();
      query = query.or(`full_name.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%,nis.ilike.%${cleanSearch}%,nisn.ilike.%${cleanSearch}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase get students error:', error.message);
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
    }

    // Format output data agar kompatibel dengan UserProfile di frontend
    const students = (data || []).map((row: any) => ({
      id: row.id,
      authUserId: row.auth_user_id || null,
      email: row.email,
      fullName: row.full_name,
      role: 'student' as const,
      nisn: row.nisn || row.nis || '-',
      nis: row.nis || row.nisn || '-',
      classId: row.class_id || 'cls-x-at-1',
      className: row.class_name || 'X AT 1',
      major: row.major || 'Agribisnis Tanaman Pangan dan Hortikultura',
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      status: row.status || 'active',
      isActive: row.status === 'active',
      phoneNumber: row.phone_number || '',
      lastLoginAt: row.last_login_at || row.created_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      count: students.length,
      data: students,
      source: 'supabase',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, data: [] }, { status: 500 });
  }
}

// POST: Tambah Siswa Baru dari Admin
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { fullName, email, nis, nisn, classId, className, major, status } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !fullName) {
      return NextResponse.json({ success: false, error: 'Nama dan Email wajib diisi' }, { status: 400 });
    }

    const studentId = `usr-std-${Date.now()}`;
    const resolvedNis = (nis || nisn || `00${Date.now().toString().slice(-8)}`).trim();
    const nowIso = new Date().toISOString();

    const studentPayload = {
      id: studentId,
      full_name: fullName.trim(),
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      nis: resolvedNis,
      nisn: resolvedNis,
      class_id: classId || 'cls-x-at-1',
      class_name: className || 'X AT 1',
      major: major || 'Agribisnis Tanaman Pangan dan Hortikultura',
      status: status || 'active',
      last_login_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data, error } = await supabase
      .from('students')
      .insert(studentPayload)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Insert ke class_students
    try {
      await supabase.from('class_students').upsert(
        {
          class_id: studentPayload.class_id,
          student_id: studentId,
          academic_year: '2025/2026',
          status: 'active',
        },
        { onConflict: 'class_id,student_id' }
      );
    } catch {}

    return NextResponse.json({ success: true, data, message: 'Siswa berhasil ditambahkan ke Supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Perbarui Profil Siswa atau Pindah Kelas
export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { id, fullName, email, nis, nisn, classId, className, major, status, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Siswa wajib disertakan' }, { status: 400 });
    }

    const resolvedStatus = status || (isActive === false ? 'nonaktif' : 'active');
    const nowIso = new Date().toISOString();

    const updatePayload: any = {
      updated_at: nowIso,
    };

    if (fullName) updatePayload.full_name = fullName.trim();
    if (email) updatePayload.email = email.trim().toLowerCase();
    if (nis || nisn) {
      updatePayload.nis = (nis || nisn).trim();
      updatePayload.nisn = (nisn || nis).trim();
    }
    if (classId) updatePayload.class_id = classId;
    if (className) updatePayload.class_name = className;
    if (major) updatePayload.major = major;
    if (resolvedStatus) updatePayload.status = resolvedStatus;

    const { data, error } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Jika kelas diperbarui, perbarui juga entri class_students
    if (classId) {
      try {
        await supabase.from('class_students').upsert(
          {
            class_id: classId,
            student_id: id,
            academic_year: '2025/2026',
            status: resolvedStatus,
          },
          { onConflict: 'class_id,student_id' }
        );
      } catch {}
    }

    return NextResponse.json({ success: true, data, message: 'Data siswa berhasil diperbarui di Supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus Siswa atau Nonaktifkan
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Siswa wajib disertakan' }, { status: 400 });
    }

    // Hapus relasi di class_students terlebih dahulu
    try {
      await supabase.from('class_students').delete().eq('student_id', id);
    } catch {}

    // Hapus dari tabel students
    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Data siswa berhasil dihapus dari Supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

