import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPin,
  createSessionToken,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  ADMIN_COOKIE_NAME,
} from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  // Extract client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';

  // Check brute force status
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'too_many_attempts',
        message: `Too many failed attempts. Try again in ${Math.ceil((rateLimit.retryAfterSec || 60) / 60)} minutes.`,
        retryAfterSec: rateLimit.retryAfterSec,
      },
      { status: 429 }
    );
  }

  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { pin } = body;
  if (!pin || typeof pin !== 'string') {
    return NextResponse.json({ error: 'pin_required' }, { status: 400 });
  }

  const isValid = verifyAdminPin(pin);
  if (!isValid) {
    const failureResult = recordFailedAttempt(ip);
    return NextResponse.json(
      {
        error: 'invalid_credentials',
        message: failureResult.locked
          ? 'Account temporarily locked due to repeated invalid attempts.'
          : `Invalid PIN. Remaining attempts: ${failureResult.remainingAttempts}.`,
        remainingAttempts: failureResult.remainingAttempts,
        locked: failureResult.locked,
      },
      { status: 401 }
    );
  }

  // Success: reset rate limit and issue secure session cookie
  resetRateLimit(ip);
  const token = createSessionToken(12); // 12 hour session

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 12 * 3600,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
