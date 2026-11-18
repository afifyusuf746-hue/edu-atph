import { NextRequest, NextResponse } from 'next/server';
import {
  getMaterialsFromSupabase,
  saveMaterialToSupabase,
} from '@/lib/materials-service';
import { getVerifiedSessionFromRequest } from '@/lib/server-auth';
import { TeachingMaterial } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getVerifiedSessionFromRequest(req);
    const { searchParams } = new URL(req.url);
    const classIdParam = searchParams.get('classId');

    const allMaterials = await getMaterialsFromSupabase();

    // If caller is an admin or teacher, they can view drafts and published materials
    const isStaff = session && (session.role === 'admin' || session.role === 'teacher');

    let filtered = allMaterials;

    if (!isStaff) {
      // Students and public callers only see published materials
      filtered = filtered.filter((m) => m.status === 'published');

      // Filter by class target if classId provided or student session active
      const studentClass = session?.classId || classIdParam;
      if (studentClass) {
        filtered = filtered.filter(
          (m) =>
            m.targetClassId === 'all' ||
            m.targetClassId === studentClass ||
            (studentClass.includes('11') && m.targetClassId.includes('xi')) ||
            (studentClass.includes('10') && m.targetClassId.includes('x')) ||
            (studentClass.includes('12') && m.targetClassId.includes('xii'))
        );
      }
    }

    return NextResponse.json({
      success: true,
      materials: filtered,
    });
  } catch (err: unknown) {
    console.error('GET /api/materials failed:', err);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data materi pembelajaran.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getVerifiedSessionFromRequest(req);
    if (!session || (session.role !== 'admin' && session.role !== 'teacher')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Hanya administrator dan guru yang berhak menambah materi.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      categoryId,
      categoryName,
      targetClassId,
      targetClassName,
      topic,
      learningObjectives,
      content,
      imageUrl,
      videoUrl,
      pdfUrl,
      attachments,
      sources,
      orderIndex,
      status,
    } = body;

    // 1. Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Judul materi wajib diisi.' }, { status: 400 });
    }

    if (!topic || !topic.trim()) {
      return NextResponse.json({ success: false, error: 'Topik materi wajib diisi.' }, { status: 400 });
    }

    const trimmedContent = (content || '').trim();
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasSources = Array.isArray(sources) && sources.length > 0;
    const hasUrls = Boolean(pdfUrl || videoUrl || hasSources);

    // Rule: Minimal satu sumber: teks yang terisi, file terunggah, atau tautan URL valid.
    // Placeholder tidak boleh dianggap sebagai konten yang valid.
    const isPlaceholderContent =
      trimmedContent.includes('Lorem ipsum') ||
      trimmedContent.includes('[Isi materi belum diisi]');

    if (!trimmedContent && !hasAttachments && !hasUrls) {
      return NextResponse.json(
        {
          success: false,
          error: 'Materi wajib memiliki minimal satu sumber pembelajaran (teks isi materi, berkas unggahan, atau tautan sumber URL).',
        },
        { status: 400 }
      );
    }

    const newMaterialId = body.id || `mat-${Date.now()}`;
    const generatedSlug =
      slug ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

    const materialToSave: TeachingMaterial = {
      id: newMaterialId,
      title: title.trim(),
      slug: generatedSlug,
      description: (description || '').trim(),
      categoryId: categoryId || 'cat-dasar',
      categoryName: categoryName || 'Dasar-Dasar Agribisnis Tanaman',
      targetClassId: targetClassId || 'all',
      targetClassName: targetClassName || 'Semua Kelas',
      topic: topic.trim(),
      learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
      content: isPlaceholderContent ? '' : trimmedContent,
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      pdfUrl: pdfUrl || undefined,
      attachments: hasAttachments ? attachments : [],
      sources: hasSources ? sources : [],
      orderIndex: Number(orderIndex || 1),
      status: status === 'draft' || status === 'archived' ? status : 'published',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await saveMaterialToSupabase(
      materialToSave,
      session.fullName || 'Guru ATPH'
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, error: saveResult.error || 'Gagal menyimpan ke database Supabase.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      material: saveResult.material,
      message:
        materialToSave.status === 'published'
          ? 'Materi pembelajaran berhasil diterbitkan.'
          : 'Draf materi berhasil disimpan.',
    });
  } catch (err: unknown) {
    console.error('POST /api/materials failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan server saat menyimpan materi.',
      },
      { status: 500 }
    );
  }
}
