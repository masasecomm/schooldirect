import { Navigate, useLocation } from "react-router-dom";
import {
  findNamibiaSchoolByLegacySlug,
  findSouthAfricanSchoolByLegacySlug,
  schoolHref,
} from "@/lib/schools";

/**
 * Catches legacy single-segment URLs and 301-style redirects (replace) to the
 * canonical school URL. Handles two patterns:
 *
 *  1. Namibia long-tail:
 *     `/a-a-denk-memorial-school-kalkrand-fees-registration-forms-contact-details-website-facebook-principal-code-results-telephone/`
 *     -> `/namibia/a-a-denk-memorial-school-namibia`
 *
 *  2. South Africa long-tail (any combo of marketing tokens, e.g.):
 *     `/nhliziyonhle-primary-school-fees-registration-contact/`
 *     -> `/south-africa/<province>/nhliziyonhle-primary-school-500230251`
 *
 * If no match is found, falls through to <NotFound /> via a render.
 */
const LegacyNamibiaRedirect = ({ fallback }: { fallback: React.ReactNode }) => {
  const location = useLocation();
  const raw = decodeURIComponent(location.pathname.replace(/^\/+|\/+$/g, ""));

  // Only single-segment slugs qualify as legacy URLs.
  if (raw && !raw.includes("/")) {
    const na = findNamibiaSchoolByLegacySlug(raw);
    if (na) return <Navigate to={schoolHref(na)} replace />;
    const sa = findSouthAfricanSchoolByLegacySlug(raw);
    if (sa) return <Navigate to={schoolHref(sa)} replace />;
  }
  return <>{fallback}</>;
};

export default LegacyNamibiaRedirect;