const loadParams = require("../../lib/loadParams");

module.exports = async function () {
  const params = await loadParams();

  return {
    title: "Smithville Hall of Fame",
    establishedYear: 2010,
    nav: [
      { label: "Inductees", url: "/inductees/" },
      { label: "Classes", url: "/classes/" },
      { label: "Scholarships", url: "/scholarships/" },
    ],
    nominateUrl: "/nominate/",
    // All three open in a new tab rather than embedding, so none of them get a
    // placeholder URL: a blank cell in the sheet hides that page's CTA instead
    // of opening a dead link in a fresh tab.
    nominationFormUrl: params.nomination_form_url || null,
    contributionFormUrl: params.donation_form_url || null,
    scholarshipFormUrl: params.scholarship_form_url || null,
  };
};
