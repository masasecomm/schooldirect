// Paste the Google Apps Script Web App URL here after deploying.
// It should look like: https://script.google.com/macros/s/AKfy.../exec
export const CONTACT_SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxVo7m7uDlYe7kzYrr-ubyZSj82V_6aOOXpf0ixQu29OURnCxL4XoNAQTabGr-Hb7H3/exec";

export const hasContactSheetEndpoint = () =>
  CONTACT_SHEET_ENDPOINT.startsWith("https://script.google.com/");