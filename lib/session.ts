import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE = 'knn_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET 환경 변수가 설정되지 않았습니다.');
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string): string {
  const payload = base64url(JSON.stringify({ userId, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): { userId: string } | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (typeof data.userId !== 'string' || typeof data.exp !== 'number') return null;
    if (Date.now() > data.exp) return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySessionToken(token);
  return session?.userId ?? null;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
