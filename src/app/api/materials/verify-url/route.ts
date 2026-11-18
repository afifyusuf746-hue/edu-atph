import { NextRequest, NextResponse } from 'next/server';
import { verifyMaterialUrlServerSide } from '@/lib/url-validator';
import { getVerifiedSessionFromRequest } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    // Only authenticated users (admins, teachers, students) can use the verification endpoint
    const session = await getVerifiedSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Parameter url wajib disertakan.' },
        { status: 400 }
      );
    }

    const verification = await verifyMaterialUrlServerSide(url);

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error: unknown) {
    console.error('Error verifying material URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal memverifikasi URL',
      },
      { status: 500 }
    );
  }
}
