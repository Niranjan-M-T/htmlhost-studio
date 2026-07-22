import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'htmlhost_session';
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'studio_agent_sec_8849204829';
const SESSION_SECRET = process.env.SESSION_SECRET || 'htmlhost_studio_secret_session_key_9948201';

// Edge-compatible HMAC token verification for Next.js Middleware
async function isValidSession(token: string): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  try {
    const [base64Payload, signature] = token.split('.');

    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(base64Payload));
    
    // Convert arraybuffer to base64url
    const bytes = new Uint8Array(sigBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedSig) return false;

    // Check expiration
    const jsonStr = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(jsonStr);

    if (data.expiresAt && Date.now() > data.expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static view links (/view/*)
  if (pathname.startsWith('/view/')) {
    return NextResponse.next();
  }

  // 2. Allow login page & auth login API
  if (pathname === '/login' || pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  // 3. Check Session Cookie
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  const hasValidSession = cookieToken ? await isValidSession(cookieToken) : false;

  // 4. Check API Key for AI Agents
  const apiKeyHeader = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');

  let hasValidApiKey = false;
  if (apiKeyHeader && apiKeyHeader === AGENT_API_KEY) {
    hasValidApiKey = true;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === AGENT_API_KEY) {
      hasValidApiKey = true;
    }
  }

  const isAuthorized = hasValidSession || hasValidApiKey;

  // Protect API / MCP endpoints
  if (pathname.startsWith('/api/')) {
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access. Valid session or X-API-Key required.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Protect Web Pages (/ and /project/*)
  if (!hasValidSession) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
