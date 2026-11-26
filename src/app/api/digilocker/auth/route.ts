import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function GET(req: NextRequest) {
  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const authBaseUrl =
    process.env.DIGILOCKER_AUTH_URL ||
    'https://api.digitallocker.gov.in/public/oauth2/1/authorize';

  const origin = req.nextUrl.origin;
  const redirectUri =
    process.env.DIGILOCKER_REDIRECT_URI || `${origin}/api/digilocker/callback`;

  if (!clientId) {
    return NextResponse.redirect(
      `${origin}/documents?digilocker_error=not_configured`
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );

  const authUrl = new URL(authBaseUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set('dl_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/'
  });
  res.cookies.set('dl_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/'
  });
  return res;
}
