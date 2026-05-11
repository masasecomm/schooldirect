// Paste the Google Apps Script Web App URL here after deploying.
// It should look like: https://script.google.com/macros/s/AKfy.../exec
export const CONTACT_SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdyhey59-SXQp-gipAworwfxaOVA-GX5MMes7s_Z26vb6ax50OHLpKDyc0KiOXEeu8/exec";

export const hasContactSheetEndpoint = () =>
  CONTACT_SHEET_ENDPOINT.startsWith("https://script.google.com/");