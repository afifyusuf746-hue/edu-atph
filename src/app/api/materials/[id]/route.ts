import { NextRequest, NextResponse } from 'next/server';
import {
  getMaterialsFromSupabase,
  saveMaterialToSupabase,
  deleteMaterialFromSupabase,
} from '@/lib/materials-service';
import { getVerifiedSessionFromRequest } from '@/lib/server-auth';
import { TeachingMaterial } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getVerifiedSessionFromRequest(req);
    const materials = await getMaterialsFromSupabase();

    const found = materials.find((m) => m.id === id || m.slug === id);
    if (!found) {
      return NextResponse.json({ success: false, error: 'Materi tidak ditemukan.' }, { status: 404 });
    }

    const isStaff = session && (session.role === 'admin' || session.role === 'teacher');
    if (!isStaff && found.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Materi ini masih berstatus draf atau diarsipkan.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, material: found });
  } catch (err: unknown) {
    console.error('GET /api/materials/[id] failed:', err);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil materi pembelajaran.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getVerifiedSessionFromRequest(req);
    if (!session || (session.role !== 'admin' && session.role !== 'teacher')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Hanya administrator dan guru yang berhak mengubah materi.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const materials = await getMaterialsFromSupabase();
    const existing = materials.find((m) => m.id === id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Materi dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const updatedMaterial: TeachingMaterial = {
      ...existing,
      ...body,
      id: existing.id, // Immutable ID
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await saveMaterialToSupabase(
      updatedMaterial,
      session.fullName || 'Guru ATPH'
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { success: false, error: saveResult.error || 'Gagal menyimpan pembaruan ke Supabase.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      material: saveResult.material,
      message:
        updatedMaterial.status === 'published'
          ? 'Materi pembelajaran berhasil diperbarui dan diterbitkan.'
          : 'Draf materi berhasil diperbarui.',
    });
  } catch (err: unknown) {
    console.error('PUT /api/materials/[id] failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan server saat memperbarui materi.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getVerifiedSessionFromRequest(req);
    if (!session || (session.role !== 'admin' && session.role !== 'teacher')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Hanya administrator dan guru yang berhak menghapus materi.',
        },
        { status: 403 }
      );
    }

    const ok = await deleteMaterialFromSupabase(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Gagal menghapus materi dari database Supabase.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Materi pembelajaran berhasil dihapus.',
    });
  } catch (err: unknown) {
    console.error('DELETE /api/materials/[id] failed:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus materi.' },
      { status: 500 }
    );
  }
}
