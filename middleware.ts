import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'htmlhost_session';
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'CHANGE_THIS_AGENT_API_KEY_IN_COOLIFY';
const SESSION_SECRET = process.env.SESSION_SECRET || 'CHANGE_THIS_SESSION_SECRET_IN_COOLIFY';

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

  // 3. Bypass redirects during build-time static generation / pre-rendering
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.includes('Next.jsPrerender') || request.headers.has('x-middleware-preflight')) {
    return NextResponse.next();
  }

  // 4. Check Session Cookie
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  const hasValidSession = cookieToken ? await isValidSession(cookieToken) : false;

  // 5. Check API Key for AI Agents
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
