// Sends website enquiries to Google Forms from the server, because a browser
// no-cors request cannot read the reply and so reports success even when Google
// rejects the submission.

const FORM_BASE = 'https://docs.google.com/forms/d/e';
const MAX_FIELD_LENGTH = 5000;

type FormConfig = {
  id: string;
  fields: Record<string, { entry: string; required: boolean }>;
};

export const INQUIRY_FORMS: Record<string, FormConfig> = {
  sponsor: {
    id: '1FAIpQLSeER8z1nKUCUfuRZdIUDEQ0qvHIvp-XtwufQHALyt3hWUBtVA',
    fields: {
      organizationName: { entry: 'entry.1917539462', required: true },
      contactName: { entry: 'entry.2112366391', required: true },
      email: { entry: 'entry.1606284375', required: true },
      phone: { entry: 'entry.1557446055', required: true },
      sponsorshipLevel: { entry: 'entry.861380879', required: true },
      message: { entry: 'entry.1857964256', required: false },
    },
  },
  contact: {
    id: '1FAIpQLScgqIxs2teuYvIhtwK0GEK11tej62oaGtGy6UTPTLvipxKPlg',
    fields: {
      name: { entry: 'entry.1210353107', required: true },
      email: { entry: 'entry.21661433', required: true },
      message: { entry: 'entry.747707509', required: true },
    },
  },
};

export function buildInquiryBody(formName: unknown, values: unknown): URLSearchParams | null {
  if (typeof formName !== 'string' || !Object.hasOwn(INQUIRY_FORMS, formName)) return null;
  if (!values || typeof values !== 'object') return null;

  const body = new URLSearchParams();
  for (const [name, field] of Object.entries(INQUIRY_FORMS[formName].fields)) {
    const raw = (values as Record<string, unknown>)[name];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if ((field.required && !value) || value.length > MAX_FIELD_LENGTH) return null;
    if (value) body.append(field.entry, value);
  }
  return body;
}

// Google answers 200 only when it saved the response. A rejected choice gets 400,
// and a form that requires sign-in gets 401 or a redirect.
export async function submitInquiry(
  formName: string,
  body: URLSearchParams,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const response = await fetchImpl(`${FORM_BASE}/${INQUIRY_FORMS[formName].id}/formResponse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    redirect: 'manual',
    signal: AbortSignal.timeout(10000),
  });
  return response.status === 200;
}

// Browser helper: true only when the server confirms Google saved the enquiry.
export async function sendInquiry(form: 'sponsor' | 'contact', values: Record<string, string>): Promise<boolean> {
  const response = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form, values }),
  });
  return response.ok;
}
