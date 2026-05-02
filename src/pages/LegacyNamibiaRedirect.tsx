import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  findNamibiaSchoolByLegacySlug,
  schoolHref,
  LEGACY_NAMIBIA_SUFFIX,
} from "@/lib/schools";

/**
 * Catches legacy Namibia URLs like
 * `/a-a-denk-memorial-school-kalkrand-fees-registration-forms-contact-details-website-facebook-principal-code-results-telephone/`
 * and 301-style redirects (replace) to the canonical `/namibia/<name>-namibia` URL.
 * If no match is found, falls through to <NotFound /> via a render.
 */
const LegacyNamibiaRedirect = ({ fallback }: { fallback: React.ReactNode }) => {
  const location = useLocation();
  const raw = decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g, ""));
  const school = findNamibiaSchoolByLegacySlug(raw);
  useEffect(() => {
    // No-op: render-time <Navigate replace> handles the redirect.
  }, []);
  if (school) {
    return <Navigate to={schoolHref(school)} replace />;
  }
  return <>{fallback}</>;
};

/** Quick check used by the router to decide whether to mount this component. */
export const isLegacyNamibiaPath = (pathname: string): boolean => {
  const raw = decodeURIComponent(pathname.replace(/^\/+|\/+$/g, "")).toLowerCase();
  return raw.endsWith(LEGACY_NAMIBIA_SUFFIX.slice(1)) ||
    raw.endsWith(LEGACY_NAMIBIA_SUFFIX);
};

export default LegacyNamibiaRedirect;