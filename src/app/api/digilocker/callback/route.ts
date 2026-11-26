import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${origin}/documents?digilocker_error=${encodeURIComponent(error)}`
    );
  }

  const savedState = req.cookies.get('dl_oauth_state')?.value;
  const codeVerifier = req.cookies.get('dl_code_verifier')?.value;

  if (!code || !state || !savedState || state !== savedState || !codeVerifier) {
    return NextResponse.redirect(
      `${origin}/documents?digilocker_error=invalid_state`
    );
  }

  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
  const tokenUrl =
    process.env.DIGILOCKER_TOKEN_URL ||
    'https://api.digitallocker.gov.in/public/oauth2/1/token';
  const redirectUri =
    process.env.DIGILOCKER_REDIRECT_URI || `${origin}/api/digilocker/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/documents?digilocker_error=not_configured`
    );
  }

  try {
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData?.access_token) {
      return NextResponse.redirect(
        `${origin}/documents?digilocker_error=${encodeURIComponent(
          tokenData?.error_description || tokenData?.error || 'token_exchange_failed'
        )}`
      );
    }

    const res = NextResponse.redirect(
      `${origin}/documents?digilocker_connected=1`
    );
    res.cookies.set('dl_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Number(tokenData.expires_in) || 3600,
      path: '/'
    });
    res.cookies.delete('dl_oauth_state');
    res.cookies.delete('dl_code_verifier');
    return res;
  } catch (err: any) {
    return NextResponse.redirect(
      `${origin}/documents?digilocker_error=${encodeURIComponent(
        err?.message || 'network_error'
      )}`
    );
  }
}
