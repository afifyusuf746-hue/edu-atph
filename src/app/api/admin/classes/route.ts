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

function resolveRombel(nameOrId?: string | null): { classId: string; className: string; gradeLevel: 'X' | 'XI' | 'XII' } {
  const norm = (nameOrId || '').trim().toUpperCase();

  if (norm.includes('X AT 1') || norm === 'CLS-X-AT-1' || norm.includes('X-AT-1')) {
    return { classId: 'cls-x-at-1', className: 'X AT 1', gradeLevel: 'X' };
  }
  if (norm.includes('X AT 2') || norm === 'CLS-X-AT-2' || norm.includes('X-AT-2')) {
    return { classId: 'cls-x-at-2', className: 'X AT 2', gradeLevel: 'X' };
  }
  if (norm.includes('X AT 3') || norm === 'CLS-X-AT-3' || norm.includes('X-AT-3')) {
    return { classId: 'cls-x-at-3', className: 'X AT 3', gradeLevel: 'X' };
  }

  if (norm.includes('XI AT 1') || norm === 'CLS-XI-AT-1' || norm.includes('XI-AT-1')) {
    return { classId: 'cls-xi-at-1', className: 'XI AT 1', gradeLevel: 'XI' };
  }
  if (norm.includes('XI AT 2') || norm === 'CLS-XI-AT-2' || norm.includes('XI-AT-2')) {
    return { classId: 'cls-xi-at-2', className: 'XI AT 2', gradeLevel: 'XI' };
  }
  if (norm.includes('XI AT 3') || norm === 'CLS-XI-AT-3' || norm.includes('XI-AT-3')) {
    return { classId: 'cls-xi-at-3', className: 'XI AT 3', gradeLevel: 'XI' };
  }

  if (norm.includes('XII AT 1') || norm === 'CLS-XII-AT-1' || norm.includes('XII-AT-1')) {
    return { classId: 'cls-xii-at-1', className: 'XII AT 1', gradeLevel: 'XII' };
  }
  if (norm.includes('XII AT 2') || norm === 'CLS-XII-AT-2' || norm.includes('XII-AT-2')) {
    return { classId: 'cls-xii-at-2', className: 'XII AT 2', gradeLevel: 'XII' };
  }
  if (norm.includes('XII AT 3') || norm === 'CLS-XII-AT-3' || norm.includes('XII-AT-3')) {
    return { classId: 'cls-xii-at-3', className: 'XII AT 3', gradeLevel: 'XII' };
  }

  if (norm.includes('XII')) {
    return { classId: 'cls-xii-at-1', className: 'XII AT 1', gradeLevel: 'XII' };
  }
  if (norm.includes('XI')) {
    return { classId: 'cls-xi-at-1', className: 'XI AT 1', gradeLevel: 'XI' };
  }

  return { classId: 'cls-x-at-1', className: 'X AT 1', gradeLevel: 'X' };
}

const DEFAULT_CLASSES = [
  {
    id: 'cls-x-at-1',
    name: 'X AT 1',
    grade_level: 'X',
    description: 'Kelas 10 Agribisnis Tanaman 1 - Rombel Dasar Kejuruan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-x-at-2',
    name: 'X AT 2',
    grade_level: 'X',
    description: 'Kelas 10 Agribisnis Tanaman 2 - Rombel Dasar Kejuruan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-x-at-3',
    name: 'X AT 3',
    grade_level: 'X',
    description: 'Kelas 10 Agribisnis Tanaman 3 - Rombel Dasar Kejuruan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-xi-at-1',
    name: 'XI AT 1',
    grade_level: 'XI',
    description: 'Kelas 11 Agribisnis Tanaman 1 - Praktik Budidaya Lanjutan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-xi-at-2',
    name: 'XI AT 2',
    grade_level: 'XI',
    description: 'Kelas 11 Agribisnis Tanaman 2 - Praktik Budidaya Lanjutan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-xi-at-3',
    name: 'XI AT 3',
    grade_level: 'XI',
    description: 'Kelas 11 Agribisnis Tanaman 3 - Praktik Budidaya Lanjutan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-xii-at-1',
    name: 'XII AT 1',
    grade_level: 'XII',
    description: 'Kelas 12 Agribisnis Tanaman 1 - Pascapanen & Kewirausahaan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-xii-at-2',
    name: 'XII AT 2',
    grade_level: 'XII',
    description: 'Kelas 12 Agribisnis Tanaman 2 - Pascapanen & Kewirausahaan ATPH',
    academic_year: '2025/2026',
  },
  {
    id: 'cls-xii-at-3',
    name: 'XII AT 3',
    grade_level: 'XII',
    description: 'Kelas 12 Agribisnis Tanaman 3 - Pascapanen & Kewirausahaan ATPH',
    academic_year: '2025/2026',
  },
];

// GET: Ambil daftar seluruh kelas beserta anggota siswa aktual dari Supabase
export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Ambil daftar kelas dari Supabase
    const { data: dbClasses, error: classErr } = await supabase
      .from('classes')
      .select('*')
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    let classesList = dbClasses;

    // Jika tabel classes belum berisi data, otomatis seed default classes
    if (!classesList || classesList.length === 0) {
      try {
        await supabase.from('classes').upsert(DEFAULT_CLASSES, { onConflict: 'id' });
        classesList = DEFAULT_CLASSES as any[];
      } catch {
        classesList = DEFAULT_CLASSES as any[];
      }
    }

    // 2. Ambil seluruh siswa untuk mengkalkulasi anggota kelas secara real-time
    const { data: dbStudents } = await supabase
      .from('students')
      .select('id, full_name, email, nis, nisn, class_id, class_name, major, status, last_login_at')
      .order('full_name', { ascending: true });

    let allStudents = [...(dbStudents || [])];

    // Cek juga siswa yang pernah mengerjakan kuis di `quiz_attempts` dan `assessments`
    try {
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('student_id, student_name, answers, completed_at')
        .limit(100);

      if (quizAttempts && quizAttempts.length > 0) {
        for (const att of quizAttempts) {
          if (!att.student_id) continue;
          const exists = allStudents.some((s) => s.id === att.student_id);
          if (!exists) {
            let metaName = 'X AT 1';
            if (Array.isArray(att.answers) && att.answers[0]?.__meta?.className) {
              metaName = att.answers[0].__meta.className;
            }
            const resolved = resolveRombel(metaName);
            const newStd = {
              id: att.student_id,
              full_name: att.student_name || 'Siswa Peserta Kuis',
              email: `${att.student_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@atph.sch.id`,
              nis: '-',
              nisn: '-',
              class_id: resolved.classId,
              class_name: resolved.className,
              major: 'Agribisnis Tanaman Pangan dan Hortikultura',
              status: 'active',
              last_login_at: att.completed_at || new Date().toISOString(),
            };
            allStudents.push(newStd);

            // Simpan / daftarkan ke tabel students agar permanen
            supabase.from('students').upsert(newStd, { onConflict: 'id' }).then(() => {});
            supabase.from('class_students').upsert(
              {
                class_id: resolved.classId,
                student_id: att.student_id,
                academic_year: '2025/2026',
                status: 'active',
              },
              { onConflict: 'class_id,student_id' }
            ).then(() => {});
          }
        }
      }
    } catch {}

    // Cek juga dari tabel `assessments`
    try {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('student_id, student_name, student_nis, class_name, created_at')
        .limit(100);

      if (assessments && assessments.length > 0) {
        for (const ass of assessments) {
          if (!ass.student_id) continue;
          const exists = allStudents.some((s) => s.id === ass.student_id);
          if (!exists) {
            const resolved = resolveRombel(ass.class_name);
            const newStd = {
              id: ass.student_id,
              full_name: ass.student_name || 'Siswa Peserta Kuis',
              email: `${ass.student_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@atph.sch.id`,
              nis: ass.student_nis || '-',
              nisn: ass.student_nis || '-',
              class_id: resolved.classId,
              class_name: resolved.className,
              major: 'Agribisnis Tanaman Pangan dan Hortikultura',
              status: 'active',
              last_login_at: ass.created_at || new Date().toISOString(),
            };
            allStudents.push(newStd);

            supabase.from('students').upsert(newStd, { onConflict: 'id' }).then(() => {});
            supabase.from('class_students').upsert(
              {
                class_id: resolved.classId,
                student_id: ass.student_id,
                academic_year: '2025/2026',
                status: 'active',
              },
              { onConflict: 'class_id,student_id' }
            ).then(() => {});
          }
        }
      }
    } catch {}

    // 3. Gabungkan kelas dengan data siswa yang valid
    const formattedClasses = classesList.map((cls: any) => {
      const classId = cls.id;
      const className = cls.name;

      // Filter siswa yang terdaftar di kelas ini (dengan pencocokan ID, Nama, atau Fallback Rombel)
      const enrolledStudents = allStudents.filter((s: any) => {
        if (s.class_id === classId) return true;
        if (s.class_name && s.class_name.toLowerCase() === className.toLowerCase()) return true;
        const resolved = resolveRombel(s.class_name || s.class_id);
        return resolved.classId === classId;
      });

      return {
        id: classId,
        name: className,
        gradeLevel: cls.grade_level || cls.gradeLevel || 'X',
        description: cls.description || '',
        academicYear: cls.academic_year || cls.academicYear || '2025/2026',
        studentCount: enrolledStudents.length,
        students: enrolledStudents.map((s: any) => ({
          id: s.id,
          fullName: s.full_name,
          email: s.email,
          nis: s.nis || s.nisn || '-',
          status: s.status || 'active',
          lastLoginAt: s.last_login_at,
        })),
        createdAt: cls.created_at || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedClasses.length,
      data: formattedClasses,
      totalRegisteredStudents: allStudents.length,
      source: 'supabase',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, data: DEFAULT_CLASSES },
      { status: 500 }
    );
  }
}

// POST: Tambah Kelas Baru di Supabase
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const { name, gradeLevel, description, academicYear } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama kelas wajib diisi' }, { status: 400 });
    }

    const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const classId = `cls-${cleanSlug}-${Date.now().toString().slice(-4)}`;

    const classPayload = {
      id: classId,
      name: name.trim(),
      grade_level: gradeLevel || 'X',
      description: description || '',
      academic_year: academicYear || '2025/2026',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('classes')
      .insert(classPayload)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Kelas berhasil dibuat di Supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Perbarui Kelas atau Pindahkan Siswa antar Kelas
export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();

    // Fitur Pindah Kelas Siswa
    if (body.action === 'move_student') {
      const { studentId, targetClassId, targetClassName } = body;

      if (!studentId || !targetClassId) {
        return NextResponse.json(
          { success: false, error: 'studentId dan targetClassId wajib disertakan' },
          { status: 400 }
        );
      }

      // Perbarui kelas siswa di tabel students
      const { data, error } = await supabase
        .from('students')
        .update({
          class_id: targetClassId,
          class_name: targetClassName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .select()
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Perbarui relasi di class_students
      try {
        await supabase.from('class_students').delete().eq('student_id', studentId);
        await supabase.from('class_students').insert({
          class_id: targetClassId,
          student_id: studentId,
          academic_year: '2025/2026',
          status: 'active',
        });
      } catch {}

      return NextResponse.json({
        success: true,
        data,
        message: `Siswa berhasil dipindahkan ke kelas ${targetClassName}`,
      });
    }

    // Edit Data Kelas
    const { id, name, gradeLevel, description, academicYear } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Kelas wajib disertakan' }, { status: 400 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (name) updatePayload.name = name.trim();
    if (gradeLevel) updatePayload.grade_level = gradeLevel;
    if (description !== undefined) updatePayload.description = description;
    if (academicYear) updatePayload.academic_year = academicYear;

    const { data, error } = await supabase
      .from('classes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Data kelas berhasil diperbarui di Supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus Kelas
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Kelas wajib disertakan' }, { status: 400 });
    }

    // Cek apakah masih ada siswa di kelas ini
    const { data: studentsInClass } = await supabase
      .from('students')
      .select('id')
      .eq('class_id', id);

    if (studentsInClass && studentsInClass.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Tidak dapat menghapus kelas karena masih ada ${studentsInClass.length} siswa di dalamnya. Pindahkan siswa terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('classes').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Kelas berhasil dihapus dari Supabase' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

