// Paste the Google Apps Script Web App URL here after deploying.
// It should look like: https://script.google.com/macros/s/AKfy.../exec
export const CONTACT_SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyS3ELfcfvEljtkrKlyKxWtE7erB1zyrriOqec65uByNMT8c_BRe4_W_pnopt_bJqBJ/exec";

export const hasContactSheetEndpoint = () =>
  CONTACT_SHEET_ENDPOINT.startsWith("https://script.google.com/");