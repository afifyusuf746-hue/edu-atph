import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil, seluruh sesi telah diakhiri.',
  });

  const cookieOptions = {
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
  };

  response.cookies.set('edu_session_token', '', cookieOptions);
  response.cookies.set('edu_user_session', '', cookieOptions);
  response.cookies.set('edu_student_session', '', cookieOptions);

  return response;
}

