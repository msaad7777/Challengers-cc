# Google Forms Setup Guide

This guide will help you set up the remaining Google Forms for your Challengers Cricket Club website.

## ✅ Already Configured

### Full Player Registration Form
**Status**: ✅ **ACTIVE**

**URL**: https://docs.google.com/forms/d/e/1FAIpQLSceV-DHzVm6ea2LCgDHjvKQEOSM6dWr6KR1ifDup7PrDTMiQw/viewform

**Current Fields**:
- Email (required)
- Name (required)
- Phone number (optional)
- Jersey Size (required): L, M, S, XL, XXL
- Jersey Type: Full Sleeve, Short Sleeve
- Trousers waist (required)
- Willing to play (required): LCL T30, LCL T20, Both

**Where it's used**:
- Hero section: "Register for 2026 Season" button
- Registration section: "Complete Full Registration" button

**Note**: This form opens in a new tab. You can update the questions in your Google Form anytime and changes will reflect automatically.

---

## ⏳ Forms That Need Setup

You have **3 more forms** to create for embedded functionality on your website:

### 1. Interest List Form (Quick Sign-up)
**Purpose**: Lightweight form for people who want to stay updated but aren't ready to fully register

**Location on website**: `/` (Homepage) → Registration section → Right column

**Recommended Fields**:
- Full Name (Short answer) - Required
- Email Address (Short answer) - Required
- Phone Number (Short answer) - Required
- Skill Level (Multiple choice) - Required
  - Options: Beginner, Intermediate, Advanced

**Setup Steps**:

1. **Create the form**: Go to https://forms.google.com and create a new form
2. **Add the fields** listed above
3. **Get the form ID**:
   - Your form URL will look like: `https://docs.google.com/forms/d/e/{FORM_ID}/viewform`
   - Copy the `FORM_ID` part

4. **Get entry IDs for each field**:
   - Open your form in **preview mode** (eye icon)
   - Right-click on the page and select **Inspect** (or press F12)
   - Click on the first input field
   - In the Elements tab, look for the `name` attribute
   - It will look like: `entry.1234567890`
   - Write down the entry ID for each field

5. **Update the code**:
   - Open: `/components/Registration.tsx`
   - Find lines 16-22
   - Replace:
     ```typescript
     const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/YOUR_INTEREST_FORM_ID/formResponse";
     const ENTRY_IDS = {
       name: "entry.1234567890",    // Replace
       email: "entry.0987654321",   // Replace
       phone: "entry.1122334455",   // Replace
       skillLevel: "entry.5544332211" // Replace
     };
     ```
   - With your actual form ID and entry IDs

---

### 2. Contact Form
**Purpose**: General inquiries and questions

**Location on website**: `/` (Homepage) → Contact section

**Recommended Fields**:
- Name (Short answer) - Required
- Email Address (Short answer) - Required
- Message (Paragraph) - Required

**Setup Steps**:

1. Create the form at https://forms.google.com
2. Add the three fields above
3. Get form ID and entry IDs (same process as Interest Form)
4. **Update the code**:
   - Open: `/components/Contact.tsx`
   - Find lines 15-20
   - Replace:
     ```typescript
     const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/YOUR_CONTACT_FORM_ID/formResponse";
     const ENTRY_IDS = {
       name: "entry.1111111111",    // Replace
       email: "entry.2222222222",   // Replace
       message: "entry.3333333333"  // Replace
     };
     ```

---

### 3. Sponsorship Inquiry Form
**Purpose**: Businesses interested in sponsoring the club

**Location on website**: `/sponsorship` → Bottom form section

**Recommended Fields**:
- Organization/Business Name (Short answer) - Required
- Contact Person Name (Short answer) - Required
- Email Address (Short answer) - Required
- Phone Number (Short answer) - Required
- Interested Sponsorship Level (Multiple choice) - Required
  - Options: Title Sponsor, Platinum Sponsor, Gold Sponsor, Community Partner, Custom Package
- Message / Additional Information (Paragraph) - Optional

**Setup Steps**:

1. Create the form at https://forms.google.com
2. Add the six fields above
3. Get form ID and entry IDs (same process as above)
4. **Update the code**:
   - Open: `/app/sponsorship/page.tsx`
   - Find lines 20-27
   - Replace:
     ```typescript
     const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/YOUR_SPONSORSHIP_FORM_ID/formResponse";
     const ENTRY_IDS = {
       organizationName: "entry.1111111111",    // Replace
       contactName: "entry.2222222222",         // Replace
       email: "entry.3333333333",               // Replace
       phone: "entry.4444444444",               // Replace
       sponsorshipLevel: "entry.5555555555",    // Replace
       message: "entry.6666666666"              // Replace
     };
     ```

---

## 🎯 How to Find Entry IDs (Detailed)

### Method 1: Browser Inspector (Recommended)

1. Open your Google Form in **preview mode**
2. Right-click anywhere on the page → **Inspect** (or F12)
3. Click on the **first input field** in your form
4. In the **Elements** panel, you'll see highlighted HTML
5. Look for: `<input ... name="entry.1234567890" ...>`
6. That number after `entry.` is your entry ID
7. Repeat for each field

### Method 2: Network Tab

1. Open your form in preview mode
2. Open Developer Tools (F12) → **Network** tab
3. Fill out one field and submit
4. Look for a request to `formResponse`
5. Click on it → **Payload** tab
6. You'll see all entry IDs and their corresponding values

---

## 📧 Email Notifications

Don't forget to enable email notifications in your Google Forms:

1. Open your form
2. Click **Responses** tab
3. Click the three dots (⋮) → **Get email notifications for new responses**

This way you'll be notified when someone submits any of your forms!

---

## ✨ Testing Your Forms

After updating the code:

1. **Restart your dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test each form**:
   - Fill out the form on your website
   - Submit it
   - Check your Google Form responses
   - Verify the data appears correctly

3. **Common issues**:
   - Form not submitting? Double-check the form ID
   - Data not appearing? Verify entry IDs match exactly
   - Getting errors? Make sure required fields are marked in both Google Form and code

---

## 🎨 Customizing Your Forms

You can customize your Google Forms:
- **Theme/Colors**: Click palette icon → Choose colors matching your site
- **Logo**: Add your CCC logo to forms
- **Confirmation message**: Edit "Thanks for submitting!" message
- **Collect emails**: Enable email collection in Settings

---

## 📝 Current Status Summary

| Form Type | Status | Action Needed |
|-----------|--------|---------------|
| **Full Registration** | ✅ Active | None - update questions in Google Form as needed |
| **Interest List** | ⏳ Pending | Create form + update Registration.tsx |
| **Contact Form** | ⏳ Pending | Create form + update Contact.tsx |
| **Sponsorship Form** | ⏳ Pending | Create form + update sponsorship/page.tsx |

---

## 🆘 Need Help?

If you get stuck:
1. Double-check entry IDs match exactly (including "entry." prefix)
2. Make sure form URL ends with `/formResponse` not `/viewform` in code
3. Restart dev server after making changes
4. Test in incognito mode to avoid caching issues

Email me the form URL if you need help finding entry IDs!

**Form ID Format**:
- ✅ Correct: `1FAIpQLSceV-DHzVm6ea2LCgDHjvKQEOSM6dWr6KR1ifDup7PrDTMiQw`
- ❌ Wrong: The full URL with `/viewform`

**Entry ID Format**:
- ✅ Correct: `entry.1234567890`
- ❌ Wrong: `1234567890` (missing "entry." prefix)
