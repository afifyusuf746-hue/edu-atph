import { NextRequest } from 'next/server';
import { UserProfile } from '@/types';
import { INITIAL_USERS } from './mock-data';

export interface AuthSessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  classId?: string;
  className?: string;
  nisn?: string;
  assignedClasses?: string[];
  iat: number;
  exp: number;
}

const SECRET_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.AUTH_SECRET ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eduatph-production-hmac-secret-salt-2026';

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  return btoa(encodeURIComponent(str))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  return decodeURIComponent(atob(base64));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Compute HMAC-SHA256 signature using universal Web Crypto API (fully Edge & Node.js compatible).
 */
async function computeHmacSha256(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Sign session payload into tamper-proof session token: payload.signature
 */
export async function signSessionToken(
  payload: Omit<AuthSessionPayload, 'iat' | 'exp'>,
  expiresInDays = 30
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AuthSessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 24 * 60 * 60,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await computeHmacSha256(payloadEncoded, SECRET_KEY);
  return `${payloadEncoded}.${signature}`;
}

/**
 * Verify a tamper-proof session token. Returns verified payload or null if invalid/tampered/expired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<AuthSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;
  const expectedSignature = await computeHmacSha256(payloadEncoded, SECRET_KEY);

  if (signature !== expectedSignature) {
    return null; // Tampered token!
  }

  try {
    const payloadStr = base64UrlDecode(payloadEncoded);
    const payload = JSON.parse(payloadStr) as AuthSessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired token
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Fast synchronous payload extractor. Checks payload structure and expiration.
 * Signature verification is handled by verifySessionToken.
 */
export function parseSessionTokenPayload(token: string | undefined | null): AuthSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  try {
    const payloadStr = base64UrlDecode(parts[0]);
    const payload = JSON.parse(payloadStr) as AuthSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Explicit Whitelist of legitimate Administrator accounts in EduATPH.
 * Strictly prevents role escalation based on arbitrary substring matching.
 */
export const LEGITIMATE_ADMIN_EMAILS = [
  'okta.nofiyanto@eduatph.sch.id',
  'oktanofiyanto123@gmail.com',
  'admin@atph.sch.id',
];

/**
 * Verify administrator credentials on the server
 */
export function verifyAdminCredentials(email: string, password: string): UserProfile | null {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const isWhitelisted = LEGITIMATE_ADMIN_EMAILS.includes(cleanEmail);
  if (!isWhitelisted) {
    return null;
  }

  // Official admin passwords
  if (cleanPassword !== 'skaneba123' && cleanPassword !== 'admin123') {
    return null;
  }

  const adminKnown = INITIAL_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.role === 'admin'
  );

  return {
    id: adminKnown?.id || 'usr-admin-okta',
    email: cleanEmail,
    fullName: adminKnown?.fullName || 'Okta Nofiyanto',
    role: 'admin',
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl:
      adminKnown?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: adminKnown?.createdAt || '2026-01-01T00:00:00Z',
  };
}

/**
 * Verify teacher credentials on the server
 */
export function verifyTeacherCredentials(email: string, password: string): UserProfile | null {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (cleanPassword !== 'skaneba123') {
    return null;
  }

  const teacher = INITIAL_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.role === 'teacher'
  );
  if (!teacher && !cleanEmail.endsWith('@guru.eduatph.sch.id')) {
    return null;
  }

  const teacherName =
    teacher?.fullName ||
    cleanEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: teacher?.id || `usr-tch-${Date.now()}`,
    email: cleanEmail,
    fullName: teacherName,
    role: 'teacher',
    nip: teacher?.nip || '198005122005011003',
    subjectName: teacher?.subjectName || 'Dasar-Dasar Agribisnis Tanaman',
    assignedClasses: teacher?.assignedClasses || ['cls-x-at-1', 'cls-x-at-2', 'cls-x-at-3'],
    avatarUrl:
      teacher?.avatarUrl ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: teacher?.createdAt || '2026-01-01T00:00:00Z',
  };
}

/**
 * Extract authenticated server user from HTTP request using tamper-proof signed token.
 */
export async function getVerifiedSessionFromRequest(req: NextRequest): Promise<AuthSessionPayload | null> {
  const token = req.cookies.get('edu_session_token')?.value;
  if (token) {
    const verified = await verifySessionToken(token);
    if (verified) {
      return verified;
    }
  }

  // Fallback check for student session cookie (only allows 'student' role)
  const studentCookie = req.cookies.get('edu_student_session')?.value;
  if (studentCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(studentCookie));
      if (parsed && parsed.id && parsed.email) {
        return {
          userId: String(parsed.id),
          email: String(parsed.email),
          fullName: String(parsed.fullName || 'Siswa ATPH'),
          role: 'student',
          classId: parsed.classId,
          className: parsed.className || 'XI AT 1',
          nisn: parsed.nisn || '-',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400 * 30,
        };
      }
    } catch {}
  }

  return null;
}
