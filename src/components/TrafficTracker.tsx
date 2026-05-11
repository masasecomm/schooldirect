import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  CONTACT_SHEET_ENDPOINT,
  hasContactSheetEndpoint,
} from "@/lib/contact-endpoint";

// Generate / reuse a lightweight anonymous visitor id (no PII).
const VISITOR_KEY = "sd_visitor_id";
const SESSION_KEY = "sd_session_id";

const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        (crypto?.randomUUID?.() as string | undefined) ??
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
};

const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (crypto?.randomUUID?.() as string | undefined) ??
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
};

const TrafficTracker = () => {
  const { pathname, search } = useLocation();
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasContactSheetEndpoint()) return;

    // Skip traffic from Lovable preview/editor environments.
    const host = window.location.hostname;
    if (
      host.endsWith("lovable.dev") ||
      host.endsWith("lovable.app") ||
      host.endsWith("lovableproject.com") ||
      host === "localhost" ||
      host === "127.0.0.1"
    ) {
      return;
    }

    const path = pathname + search;
    if (lastSent.current === path) return;
    lastSent.current = path;

    const payload = {
      type: "traffic",
      sheet: "Sheet2",
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      path,
      title: document.title,
      referrer: document.referrer || "",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
    };

    // Fire-and-forget; Apps Script accepts the POST even with no-cors.
    try {
      fetch(CONTACT_SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Ignore — analytics must never break the app.
    }
  }, [pathname, search]);

  return null;
};

export default TrafficTracker;