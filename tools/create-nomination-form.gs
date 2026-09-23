/**
 * Creates the Hall of Fame nomination Google Form, plus the response
 * spreadsheet that backs it.
 *
 * Run this ONCE, from the Google account that should own the form:
 *   1. script.google.com -> New project
 *   2. Paste this file in, Save
 *   3. Run -> createNominationForm, and approve the permission prompt
 *   4. Copy the "Published (live) URL" from the execution log into the
 *      hall_of_fame_data sheet, params tab, nomination_form_url
 *
 * The site picks the URL up on the next build - no code change, no deploy.
 *
 * Re-running this makes a SECOND form. To change wording later, edit the
 * form in the Forms UI instead.
 */

// ---------------------------------------------------------------------------
// Check these before running. Only DEADLINE is a genuine unknown.
// ---------------------------------------------------------------------------

// Eligibility - copied from the aside on /nominate/ (src/nominate.njk) so the
// form and the page say the same thing. NOTE: that copy is itself unconfirmed
// mockup text (see docs/next-steps.md) - get the committee to sign off on it
// before you publish the form, and change it in both places if it is wrong.
var ELIGIBILITY =
  '- Five years removed from Smithville High School\n' +
  '- Athletes, coaches, whole teams and contributors are all eligible\n' +
  '- Posthumous nominations are welcome';

// Roughly when nominations close. The design doc is explicit that a vague ask
// gets few nominations, so replace this before you publish the form -
// 'Rolling, reviewed each spring' is a fine answer if there is no hard date,
// just do not leave it unsaid.
var DEADLINE = 'TODO: nomination deadline, or the review cadence.';

// Optional: a Drive folder ID to file the form and its responses into.
// Leave '' to drop them in the root of My Drive.
var DEST_FOLDER_ID = '';

var FORM_TITLE = 'Smithville Hall of Fame - Nomination';
var RESPONSES_SHEET_NAME = 'Hall of Fame nominations (responses)';

// Matches the sheet's Category column, so a nomination transcribes straight
// into the roster.
var CATEGORIES = ['Athlete', 'Coach', 'Contributor', 'Team'];

// Matches lib/sportIcons.js - spellings the site already knows how to icon.
var SPORTS = [
  'Baseball',
  'Basketball',
  'Cheerleading',
  'Cross country',
  'Football',
  'Golf',
  'Soccer',
  'Softball',
  'Track and field',
  'Volleyball',
  'Wrestling'
];

function createNominationForm() {
  var form = FormApp.create(FORM_TITLE);

  form.setDescription(
    'Help us find the people who belong in the Hall of Fame.\n\n' +
    'WHO IS ELIGIBLE\n' + ELIGIBILITY + '\n\n' +
    'WHAT HELPS\n' +
    'Anything concrete: records, championships, All-State or all-conference ' +
    'honors, newspaper clippings, yearbook pages, season stats, the years ' +
    'they played or coached, and people we can talk to. A photo of the ' +
    'nominee from their playing or coaching days is especially useful.\n\n' +
    'DEADLINE\n' + DEADLINE + '\n\n' +
    'You do not need to fill in everything. A name and roughly when they ' +
    'competed is enough for us to start looking.'
  );

  collectResponderEmail(form);
  form.setProgressBar(true)
      .setAllowResponseEdits(true)
      .setConfirmationMessage(
        'Thank you - your nomination is with the committee. If we need more ' +
        'detail, we will reach out to the email address on this response.'
      );

  // --- The nominee ---------------------------------------------------------

  form.addTextItem()
      .setTitle('Who are you nominating?')
      .setHelpText('For a team, use the team name - e.g. "1994 Girls Basketball Team".')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('What are you nominating them as?')
      .setChoiceValues(CATEGORIES)
      .showOtherOption(true)
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('Sport(s)')
      .setHelpText('Check every sport that applies - plenty of nominees played two or three.')
      .setChoiceValues(SPORTS)
      .showOtherOption(true);

  form.addTextItem()
      .setTitle('When were they at the school?')
      .setHelpText(
        'Graduation year if you know it, otherwise whatever you have - ' +
        '"Class of 87", "coached from about 1979 to 2001", "mid-90s" are all fine.'
      );

  // --- The case ------------------------------------------------------------

  form.addParagraphTextItem()
      .setTitle('Why do they belong in the Hall of Fame?')
      .setHelpText(
        'A few sentences is enough to start. Records, championships, honors, ' +
        'or the kind of impact that does not show up in a stat line.'
      )
      .setRequired(true);

  form.addParagraphTextItem()
      .setTitle('Anything we can look at to back it up?')
      .setHelpText(
        'Newspaper articles, links, yearbook or program pages, record books, ' +
        'or the name of someone who was there. Paste links or just describe ' +
        'what exists and where.'
      );

  form.addParagraphTextItem()
      .setTitle('If this is a team: who was on it?')
      .setHelpText('Players and coaches, separated by commas. Skip this for an individual.');

  form.addMultipleChoiceItem()
      .setTitle('Do you have a photo of the nominee we could use?')
      .setChoiceValues([
        'Yes - I can send one',
        'No, but I know where one exists',
        'No'
      ]);

  // --- You -----------------------------------------------------------------

  form.addPageBreakItem()
      .setTitle('About you')
      .setHelpText('So we can follow up - we often need one more detail to finish a nomination.');

  form.addTextItem().setTitle('Your name').setRequired(true);

  form.addTextItem()
      .setTitle('Phone number')
      .setHelpText('Optional. We already have your email from this form.');

  form.addTextItem()
      .setTitle('How do you know the nominee?')
      .setHelpText('Teammate, family, former player, watched them every Friday night - anything helps.');

  form.addParagraphTextItem().setTitle('Anything else we should know?');

  // --- Responses -----------------------------------------------------------

  var responses = SpreadsheetApp.create(RESPONSES_SHEET_NAME);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, responses.getId());

  if (DEST_FOLDER_ID) {
    var folder = DriveApp.getFolderById(DEST_FOLDER_ID);
    DriveApp.getFileById(form.getId()).moveTo(folder);
    DriveApp.getFileById(responses.getId()).moveTo(folder);
  }

  var live = form.getPublishedUrl();
  Logger.log('Published (live) URL -> paste into params.nomination_form_url:\n%s', live);
  Logger.log('Short URL: %s', form.shortenFormUrl(live));
  Logger.log('Edit the form: %s', form.getEditUrl());
  Logger.log('Responses spreadsheet: %s', responses.getUrl());

  return live;
}

// setCollectEmail was replaced by setEmailCollectionType; accounts are still
// being migrated, so try the new API and fall back to the old one.
function collectResponderEmail(form) {
  try {
    form.setEmailCollectionType(FormApp.EmailCollectionType.RESPONDER_INPUT);
  } catch (e) {
    form.setCollectEmail(true);
  }
}
