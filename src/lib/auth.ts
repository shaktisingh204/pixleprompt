
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { cache } from 'react';

const SESSION_COOKIE_NAME = 'admin_session';
const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-for-local-dev');

type SessionPayload = {
    username: string;
    expiresAt: Date;
};

// --- SESSION MANAGEMENT ---

export async function createSession() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ username: 'admin', expiresAt });

  cookies().set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  cookies().set(SESSION_COOKIE_NAME, '', { expires: new Date(0) });
}

// --- HELPERS ---

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, secretKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export const getSessionCookie = cache(async () => {
    const cookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    const session = await decrypt(cookie);

    if (!session?.username) {
        return null;
    }

    return session;
});
