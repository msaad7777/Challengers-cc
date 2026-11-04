import { NextResponse } from 'next/server';
import { buildInquiryBody, submitInquiry } from '@/lib/inquiry-forms';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const body = buildInquiryBody(payload?.form, payload?.values);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const saved = await submitInquiry(payload.form, body);
    if (!saved) console.error(`Google Forms rejected a ${payload.form} enquiry`);
    return NextResponse.json({ ok: saved }, { status: saved ? 200 : 502 });
  } catch (error) {
    console.error(`Could not reach Google Forms for a ${payload.form} enquiry`, error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
