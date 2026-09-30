/**
 * setup-registration-form.gs — adds the 2027 availability questions to the
 * Challengers registration Google Form and prints the entry IDs the website
 * needs.
 *
 * This is a Google Apps Script, not a Node script. It does not run from this
 * repo — paste it into script.google.com. See GOOGLE_FORMS_SETUP.md.
 *
 * WHY THIS EXISTS
 * components/Registration.tsx posts directly to the Google Form using hardcoded
 * `entry.NNNNN` field names. Three questions were added to the website that the
 * Google Form does not have yet, so their answers are currently dropped. This
 * script creates them and reads back their entry IDs in one go.
 *
 * TWO RULES THAT WILL COST YOU A DAY IF IGNORED
 *
 * 1. The choice strings below must match WEEKEND_OPTIONS / WORK_PATTERN_OPTIONS
 *    in lib/registrationAdvice.ts character for character. Google rejects a
 *    response whose multiple-choice value is not one of the listed choices, and
 *    the website submits through a hidden iframe, so a rejection is completely
 *    silent — the player still sees "thank you". Plain ASCII on both sides.
 *
 * 2. Do NOT mark these questions Required in the Google Form. A required
 *    question with no matching entry id on the website rejects EVERY
 *    submission, including the nine fields that work today. The website already
 *    enforces required client-side. This script creates them optional; leave
 *    them that way.
 *
 * HOW TO RUN
 *   1. script.google.com -> New project. Paste this file in.
 *   2. Run `listMyForms` first. Authorise when prompted (it needs Drive + Forms;
 *      your Workspace account can grant this to itself, no admin approval).
 *      Copy the edit URL of the registration form from the log.
 *   3. Paste it into FORM_EDIT_URL below.
 *   4. Run `addRegistrationQuestions`. Read the log.
 *   5. Copy the three `entry.NNNNN` values into ENTRY_IDS in
 *      components/Registration.tsx. Done.
 *
 * Re-running is safe: questions are matched by title and never duplicated, so
 * `addRegistrationQuestions` doubles as "just print me the entry IDs again".
 */

/** Paste the form's EDIT url here — the .../forms/d/<id>/edit one.
 *  The website uses the public .../forms/d/e/<other id>/formResponse url; they
 *  are different ids and this script needs the edit one. `listMyForms` finds it. */
var FORM_EDIT_URL = 'PASTE_THE_EDIT_URL_HERE';

/** Question titles. Changing a title after the fact creates a NEW question with
 *  a NEW entry id and orphans the old answers, so treat these as fixed. */
var Q_WORK_PATTERN = 'In 2027 you will be';
var Q_WEEKEND = 'Do you work weekends?';
var Q_GAMES = 'Matches you can genuinely commit to (out of 26)';

/** Must equal WORK_PATTERN_OPTIONS in lib/registrationAdvice.ts. */
var WORK_PATTERN_CHOICES = [
  'Working full time',
  'Working part time',
  'Shift work or a rotating roster',
  'Studying',
  'Something else',
];

/** Must equal WEEKEND_OPTIONS in lib/registrationAdvice.ts. */
var WEEKEND_CHOICES = [
  'No, my weekends are generally free',
  'Some weekends, one or two a month',
  'Yes, I work most weekends',
];

/** Step 2 — find the form and its edit URL. */
function listMyForms() {
  var files = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
  var found = 0;
  Logger.log('Google Forms in this account:');
  while (files.hasNext()) {
    var f = files.next();
    found++;
    Logger.log('  %s\n    %s', f.getName(), f.getUrl());
  }
  if (found === 0) {
    Logger.log('No forms found. Are you signed in as the account that OWNS the form?');
  }
  Logger.log('\nPaste the right one into FORM_EDIT_URL, then run addRegistrationQuestions.');
}

/** Step 4 — create the questions (if missing) and print every entry id. */
function addRegistrationQuestions() {
  if (FORM_EDIT_URL.indexOf('PASTE') === 0) {
    Logger.log('Set FORM_EDIT_URL first. Run listMyForms to find it.');
    return;
  }

  var form = FormApp.openByUrl(FORM_EDIT_URL);
  Logger.log('Form: %s', form.getTitle());

  var existing = {};
  form.getItems().forEach(function (item) {
    existing[item.getTitle()] = true;
  });

  var added = [];

  if (!existing[Q_WORK_PATTERN]) {
    form.addMultipleChoiceItem()
      .setTitle(Q_WORK_PATTERN)
      .setHelpText('Most of our fixtures are on weekends, so this helps us plan the season.')
      .setChoiceValues(WORK_PATTERN_CHOICES)
      .setRequired(false);
    added.push(Q_WORK_PATTERN);
  }

  if (!existing[Q_WEEKEND]) {
    form.addMultipleChoiceItem()
      .setTitle(Q_WEEKEND)
      .setHelpText('30 of our 33 fixtures in 2026 fell on a Saturday or Sunday.')
      .setChoiceValues(WEEKEND_CHOICES)
      .setRequired(false);
    added.push(Q_WEEKEND);
  }

  if (!existing[Q_GAMES]) {
    form.addTextItem()
      .setTitle(Q_GAMES)
      .setHelpText('A number from 0 to 26. The website fills this in automatically.')
      .setRequired(false);
    added.push(Q_GAMES);
  }

  Logger.log(added.length ? 'Added: ' + added.join(', ') : 'Nothing to add — all three already exist.');
  Logger.log('');
  printEntryIds();
}

/**
 * Print `title -> entry.NNNNN` for every question on the form.
 *
 * Apps Script has no direct "give me the entry id" call — item.getId() is a
 * different number. The reliable route is to build a prefilled response for one
 * item at a time and read the entry id back out of the generated URL.
 */
function printEntryIds() {
  var form = FormApp.openByUrl(FORM_EDIT_URL);

  Logger.log('--- Entry IDs -------------------------------------------------');
  form.getItems().forEach(function (item) {
    var itemResponse = sampleResponseFor(item);
    if (!itemResponse) {
      Logger.log('%s -> (not a question — skipped)', item.getTitle());
      return;
    }
    try {
      var url = form.createResponse().withItemResponse(itemResponse).toPrefilledUrl();
      var match = url.match(/entry\.(\d+)/);
      Logger.log("%s -> 'entry.%s'", item.getTitle(), match ? match[1] : '??');
    } catch (err) {
      Logger.log('%s -> could not read (%s)', item.getTitle(), err.message);
    }
  });
  Logger.log('---------------------------------------------------------------');
  Logger.log('Paste the three new ones into ENTRY_IDS in components/Registration.tsx:');
  Logger.log('  workPattern, weekendAvailability, gamesCommitted');
  Logger.log('Leave the nine existing ids alone — changing them breaks the live form.');
}

/** A throwaway valid answer for one item, so a prefilled URL can be generated. */
function sampleResponseFor(item) {
  var type = item.getType();
  try {
    if (type === FormApp.ItemType.TEXT) {
      return item.asTextItem().createResponse('sample');
    }
    if (type === FormApp.ItemType.PARAGRAPH_TEXT) {
      return item.asParagraphTextItem().createResponse('sample');
    }
    if (type === FormApp.ItemType.MULTIPLE_CHOICE) {
      var mc = item.asMultipleChoiceItem().getChoices();
      return mc.length ? item.asMultipleChoiceItem().createResponse(mc[0].getValue()) : null;
    }
    if (type === FormApp.ItemType.LIST) {
      var li = item.asListItem().getChoices();
      return li.length ? item.asListItem().createResponse(li[0].getValue()) : null;
    }
    if (type === FormApp.ItemType.CHECKBOX) {
      var cb = item.asCheckboxItem().getChoices();
      return cb.length ? item.asCheckboxItem().createResponse([cb[0].getValue()]) : null;
    }
    if (type === FormApp.ItemType.SCALE) {
      return item.asScaleItem().createResponse(item.asScaleItem().getLowerBound());
    }
  } catch (err) {
    return null;
  }
  return null;
}

/**
 * Optional hardening, once the entry ids are wired up.
 *
 * The website's honeypot and timing checks only stop bots that drive the page.
 * The form endpoint itself is public — anything can POST to it directly. These
 * two settings are the actual fix, and they are a trade-off, so they are NOT
 * applied automatically:
 *
 *   setRequireLogin(true)  — only signed-in Google users can submit. Kills
 *                            drive-by spam outright, but turns away anyone
 *                            without a Google account.
 *   setLimitOneResponsePerUser(true) — requires login to mean anything.
 *
 * Run this only if the spam is bad enough to justify the friction.
 */
function hardenAgainstSpam() {
  var form = FormApp.openByUrl(FORM_EDIT_URL);
  form.setRequireLogin(true);
  form.setLimitOneResponsePerUser(true);
  Logger.log('Sign-in now required. Re-run with both set to false to undo.');
  Logger.log('NOTE: registrations from people without a Google account will now fail.');
}
