// Paste the Google Apps Script Web App URL here after deploying.
// It should look like: https://script.google.com/macros/s/AKfy.../exec
export const CONTACT_SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbytvROkP0K9nlkbTwJkcIqrHKh0fdOuxTFHTPY3WcU-dIB80ZP3LNcklxIghItB-fTJ/exec";

export const hasContactSheetEndpoint = () =>
  CONTACT_SHEET_ENDPOINT.startsWith("https://script.google.com/");