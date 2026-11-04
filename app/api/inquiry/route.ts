import { NextResponse } from 'next/server';
import { getIntakeStore, saveInquiry } from '@/lib/c3h-intake-store';
import { buildInquiryBody, cleanInquiryValues, submitInquiry } from '@/lib/inquiry-forms';

// Sends the enquiry to Google Forms and, for players and sponsors, saves a copy
// for directors in C3H. Either one succeeding means the club has the enquiry.
export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const form = payload?.form;
  const body = buildInquiryBody(form, payload?.values);
  const values = cleanInquiryValues(form, payload?.values);
  if (!body || !values) return NextResponse.json({ ok: false }, { status: 400 });

  const [sentToGoogle, savedForDirectors] = await Promise.all([
    sendToGoogle(form, body),
    form === 'player' || form === 'sponsor' ? saveForDirectors(form, values) : false,
  ]);
  const ok = sentToGoogle || savedForDirectors;
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}

async function sendToGoogle(form: string, body: URLSearchParams): Promise<boolean> {
  try {
    const saved = await submitInquiry(form, body);
    if (!saved) console.error(`Google Forms rejected a ${form} enquiry`);
    return saved;
  } catch (error) {
    console.error(`Could not reach Google Forms for a ${form} enquiry`, error);
    return false;
  }
}

async function saveForDirectors(form: 'player' | 'sponsor', values: Record<string, string>): Promise<boolean> {
  try {
    const store = await getIntakeStore();
    if (!store) return false;
    await saveInquiry(store, form, values);
    return true;
  } catch (error) {
    console.error(`Could not save a ${form} enquiry for directors`, error);
    return false;
  }
}
