const loadParams = require("../../lib/loadParams");

// Placeholders for as long as the sheet's params tab leaves these blank.
const FALLBACK_GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/TBD/viewform?embedded=true";
const FALLBACK_CONTRIBUTION_FORM_URL = "https://docs.google.com/forms/d/e/TBD/viewform";

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
    googleFormUrl: params.nomination_form_url
      ? `${params.nomination_form_url}${params.nomination_form_url.includes("?") ? "&" : "?"}embedded=true`
      : FALLBACK_GOOGLE_FORM_URL,
    contributionFormUrl: params.donation_form_url || FALLBACK_CONTRIBUTION_FORM_URL,
    // No placeholder for this one - the scholarships page hides its apply CTA
    // entirely until the committee puts a real URL in the sheet.
    scholarshipFormUrl: params.scholarship_form_url || null,
  };
};
