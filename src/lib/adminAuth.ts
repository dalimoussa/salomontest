import crypto from 'crypto';

// Server-side admin PIN / secret (NEVER exposed to client bundle via NEXT_PUBLIC_)
const SERVER_ADMIN_PIN = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'salomon-takao-admin-session-secret-key-2026';

export const ADMIN_COOKIE_NAME = 'salomon_admin_session';

// In-memory rate limiting map: ip -> { count: number, lockedUntil: number }
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (record) {
    if (record.lockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSec: Math.ceil((record.lockedUntil - now) / 1000),
      };
    } else if (record.lockedUntil > 0 && record.lockedUntil <= now) {
      // Lock expired, reset
      rateLimitMap.delete(ip);
    }
  }

  const currentAttempts = record?.attempts || 0;
  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - currentAttempts),
  };
}

export function recordFailedAttempt(ip: string): { locked: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitMap.set(ip, record);
    return {
      locked: true,
      remainingAttempts: 0,
      retryAfterSec: Math.ceil(LOCKOUT_DURATION_MS / 1000),
    };
  }

  rateLimitMap.set(ip, record);
  return {
    locked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
  };
}

export function resetRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

/**
 * Constant-time PIN verification to prevent timing attack vulnerabilities.
 */
export function verifyAdminPin(candidatePin: string): boolean {
  if (!candidatePin || typeof candidatePin !== 'string') return false;

  const target = Buffer.from(SERVER_ADMIN_PIN.trim());
  const candidate = Buffer.from(candidatePin.trim());

  if (target.length !== candidate.length) {
    // Constant time dummy comparison
    crypto.timingSafeEqual(target, target);
    return false;
  }

  return crypto.timingSafeEqual(target, candidate);
}

/**
 * Creates an HMAC-SHA256 signed session token containing an expiration timestamp.
 */
export function createSessionToken(validHours = 12): string {
  const expiresAt = Date.now() + validHours * 3600 * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Validates the HMAC signature and expiration of an admin session token.
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, candidateSignature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

  const expectedBuf = Buffer.from(expectedSignature);
  const candidateBuf = Buffer.from(candidateSignature);

  if (expectedBuf.length !== candidateBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, candidateBuf)) return false;

  const [role, expiresStr] = payload.split(':');
  if (role !== 'admin') return false;

  const expiresAt = parseInt(expiresStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
