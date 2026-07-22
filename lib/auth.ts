import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Default Allowed Accounts
const DEFAULT_ALLOWED_EMAILS = [
  'niranjanmtheroth@gmail.com',
  'studiohappens26@gmail.com',
];

// Target password: Studiohappensmsme
const TARGET_PASSWORD_PLAIN = 'Studiohappensmsme';

// Standard salt for password hashing
const HARDCODED_SALT = 'htmlhost_studio_secure_salt_2026';

// Pre-computed PBKDF2 hash of the password with salt (100,000 iterations, 64-byte key)
function computeHash(password: string): string {
  return crypto
    .pbkdf2Sync(password, HARDCODED_SALT, 100000, 64, 'sha512')
    .toString('hex');
}

const PASSWORD_HASH = computeHash(TARGET_PASSWORD_PLAIN);

// Secret key for HMAC signing session tokens
const SESSION_SECRET = process.env.SESSION_SECRET || 'htmlhost_studio_secret_session_key_9948201';
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'studio_agent_sec_8849204829';

export const COOKIE_NAME = 'htmlhost_session';

export function getAllowedEmails(): string[] {
  if (process.env.ALLOWED_EMAILS) {
    return process.env.ALLOWED_EMAILS.split(',').map((e) => e.trim().toLowerCase());
  }
  return DEFAULT_ALLOWED_EMAILS.map((e) => e.toLowerCase());
}

export function getAgentApiKey(): string {
  return AGENT_API_KEY;
}

export function verifyCredentials(email: string, passwordPlain: string): boolean {
  if (!email || !passwordPlain) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const allowed = getAllowedEmails();

  if (!allowed.includes(normalizedEmail)) {
    return false;
  }

  // Compute hash of input password
  const inputHash = computeHash(passwordPlain);

  // Timing-safe comparison to prevent side-channel timing attacks
  const bufA = Buffer.from(inputHash, 'hex');
  const bufB = Buffer.from(PASSWORD_HASH, 'hex');

  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(email: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = JSON.stringify({ email: email.toLowerCase(), expiresAt });
  const base64Payload = Buffer.from(payload).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): { email: string } | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [base64Payload, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Payload)
      .digest('base64url');

    // Timing-safe signature check
    const bufA = Buffer.from(signature);
    const bufB = Buffer.from(expectedSig);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const data = JSON.parse(jsonStr);

    if (data.expiresAt && Date.now() > data.expiresAt) {
      return null;
    }

    return { email: data.email };
  } catch {
    return null;
  }
}

export function isAuthorizedRequest(request: NextRequest): boolean {
  // 1. Check Session Cookie
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken && verifySessionToken(cookieToken)) {
    return true;
  }

  // 2. Check Agent API Key header (X-API-Key or Authorization Bearer)
  const apiKeyHeader = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');

  if (apiKeyHeader && apiKeyHeader === AGENT_API_KEY) {
    return true;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === AGENT_API_KEY) {
      return true;
    }
  }

  return false;
}
