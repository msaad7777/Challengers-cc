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
  player: {
    id: '1FAIpQLSfVYSWAYY8wgl_KIjsNwENzf2w57xp4ZcMBWXLeXRkY7L4DxQ',
    fields: {
      name: { entry: 'entry.1407381676', required: true },
      email: { entry: 'entry.112847984', required: true },
      phone: { entry: 'entry.578432831', required: true },
      skillLevel: { entry: 'entry.980943308', required: true },
      willingToPlay: { entry: 'entry.1652603126', required: true },
      playingRole: { entry: 'entry.1089654944', required: true },
      jerseySize: { entry: 'entry.1146547898', required: false },
      jerseyType: { entry: 'entry.1555965869', required: false },
      trouserWaistSize: { entry: 'entry.1033675185', required: false },
      // The Google Form has no questions for these, so only C3H records them.
      workPattern: { entry: '', required: false },
      weekendAvailability: { entry: '', required: false },
      gamesCommitted: { entry: '', required: false },
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

// Keeps only the form's known fields, or returns null if the request is invalid.
export function cleanInquiryValues(formName: unknown, values: unknown): Record<string, string> | null {
  if (typeof formName !== 'string' || !Object.hasOwn(INQUIRY_FORMS, formName)) return null;
  if (!values || typeof values !== 'object') return null;

  const clean: Record<string, string> = {};
  for (const [name, field] of Object.entries(INQUIRY_FORMS[formName].fields)) {
    const raw = (values as Record<string, unknown>)[name];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if ((field.required && !value) || value.length > MAX_FIELD_LENGTH) return null;
    if (value) clean[name] = value;
  }
  return clean;
}

export function buildInquiryBody(formName: unknown, values: unknown): URLSearchParams | null {
  const clean = cleanInquiryValues(formName, values);
  if (!clean) return null;

  const body = new URLSearchParams();
  for (const [name, value] of Object.entries(clean)) {
    const { entry } = INQUIRY_FORMS[formName as string].fields[name];
    if (entry) body.append(entry, value);
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
export async function sendInquiry(form: 'sponsor' | 'player' | 'contact', values: Record<string, string>): Promise<boolean> {
  const response = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ form, values }),
  });
  return response.ok;
}
