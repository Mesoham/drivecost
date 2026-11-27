import { NextRequest, NextResponse } from 'next/server';

const SUPPORT_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL || 'chowdhurysoham007@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // 1. Use Resend if RESEND_API_KEY is configured in environment
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'DriveCost Support <onboarding@resend.dev>',
          to: [SUPPORT_EMAIL],
          reply_to: email,
          subject: `[DriveCost Support] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
        })
      });

      if (resendRes.ok) {
        return NextResponse.json({ ok: true, provider: 'resend' });
      }
    }

    // 2. Otherwise forward via FormSubmit AJAX endpoint directly to the founder's mailbox
    const formSubmitRes = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(SUPPORT_EMAIL)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: req.nextUrl.origin,
          Referer: `${req.nextUrl.origin}/contact-us`
        },
        body: JSON.stringify({
          name,
          email,
          _replyto: email,
          _subject: `[DriveCost Contact] ${subject}`,
          subject,
          message,
          _template: 'table'
        })
      }
    );

    const data = await formSubmitRes.json().catch(() => ({}));
    if (!formSubmitRes.ok || data?.success === 'false' || data?.success === false) {
      return NextResponse.json(
        { error: data?.message || 'Failed to deliver message. Please email directly.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, provider: 'formsubmit' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal error sending message.' },
      { status: 500 }
    );
  }
}
