import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSessionFromRequest } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const session = await getVerifiedSessionFromRequest(req);

  if (!session) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      classId: session.classId,
      className: session.className,
      nisn: session.nisn,
      assignedClasses: session.assignedClasses,
    },
  });
}

