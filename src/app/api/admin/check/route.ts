import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
  const isValid = verifySessionToken(cookie?.value);

  return NextResponse.json({ authenticated: isValid });
}
