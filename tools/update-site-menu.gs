/**
 * @OnlyCurrentDoc
 *
 * Adds a "Website" menu to the hall_of_fame_data sheet so the committee can
 * rebuild the site right after an edit instead of waiting for the nightly
 * run. It starts the same GitHub Actions workflow the nightly cron does
 * (.github/workflows/build-deploy.yml), via its workflow_dispatch trigger.
 *
 * Set up ONCE, by someone with edit access to the sheet:
 *   1. Open the sheet -> Extensions -> Apps Script
 *   2. Replace the contents of Code.gs with this file, Save
 *   3. Project Settings (gear icon) -> Script properties -> Add script property
 *        Property: GITHUB_TOKEN
 *        Value:    the fine-grained token (hof-smithville/site only,
 *                  Actions: Read and write - nothing else)
 *   4. Reload the sheet. The Website menu appears after a few seconds.
 *
 * The first time each person uses the menu, Google asks them to approve
 * the script ("Google hasn't verified this app" -> Advanced -> Go to ...).
 * That's expected for a private script and only happens once per person.
 *
 * The token is readable by anyone who can edit the sheet. Its only power is
 * starting/cancelling builds, which is why it's scoped that narrowly. When it
 * expires the menu says so; generate a new one and replace the property.
 */

var REPO = 'hof-smithville/site';
var WORKFLOW_FILE = 'build-deploy.yml';
var BRANCH = 'main';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Website')
    .addItem('Update website now', 'updateWebsiteNow')
    .addItem('Check last update', 'checkLastUpdate')
    .addToUi();
}

function updateWebsiteNow() {
  var ui = SpreadsheetApp.getUi();
  var res = githubRequest_('post', '/dispatches', { ref: BRANCH });
  if (!res) return;

  // 204 No Content is GitHub's success answer for a dispatch.
  if (res.getResponseCode() === 204) {
    ui.alert(
      'Website update started',
      'The website is updating with what is in this sheet right now.\n\n' +
        'It usually takes a few minutes. To see whether it is finished, ' +
        'use Website -> Check last update.',
      ui.ButtonSet.OK
    );
    return;
  }
  showGithubError_(res);
}

function checkLastUpdate() {
  var ui = SpreadsheetApp.getUi();
  var res = githubRequest_('get', '/runs?per_page=1');
  if (!res) return;
  if (res.getResponseCode() !== 200) {
    showGithubError_(res);
    return;
  }

  var run = JSON.parse(res.getContentText()).workflow_runs[0];
  if (!run) {
    ui.alert('No website updates have run yet.');
    return;
  }

  var when = Utilities.formatDate(
    new Date(run.created_at),
    Session.getScriptTimeZone(),
    "EEEE, MMM d 'at' h:mm a"
  );
  var message;
  if (run.status !== 'completed') {
    message = 'An update is running right now (started ' + when + '). Check back in a few minutes.';
  } else if (run.conclusion === 'success') {
    message = 'The last update finished successfully. It started ' + when + '.';
  } else {
    message =
      'The last update, started ' + when + ', did NOT finish (' + run.conclusion + ').\n\n' +
      'Try Website -> Update website now once more. If it fails again, ' +
      'contact the person who manages the website.';
  }
  ui.alert('Last website update', message, ui.ButtonSet.OK);
}

// Returns the HTTPResponse, or null (after telling the user) if there's no
// token configured.
function githubRequest_(method, path, body) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    SpreadsheetApp.getUi().alert(
      'The Website menu is not set up yet: the GITHUB_TOKEN script property is missing. ' +
        'Contact the person who manages the website.'
    );
    return null;
  }

  var options = {
    method: method,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  if (body) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }
  var url = 'https://api.github.com/repos/' + REPO + '/actions/workflows/' + WORKFLOW_FILE + path;
  return UrlFetchApp.fetch(url, options);
}

function showGithubError_(res) {
  var code = res.getResponseCode();
  var reason =
    code === 401
      ? 'The GitHub token has expired or was revoked. A new one needs to be created and saved in the script settings.'
      : code === 403 || code === 404
        ? 'The GitHub token does not have permission to update the website.'
        : 'GitHub returned an unexpected error.';
  Logger.log('GitHub ' + code + ': ' + res.getContentText());
  SpreadsheetApp.getUi().alert(
    'The website could not be updated',
    reason + '\n\nContact the person who manages the website. (Error ' + code + ')',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
