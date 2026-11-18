/**
 * Helper to match routes across both /pms and legacy /admin prefixes,
 * preventing breaking changes for existing admin URLs.
 */
export function isRouteActive(
  targetHref?: string,
  currentPathname?: string | null
): boolean {
  if (!targetHref || !currentPathname) return false;

  // Exact match
  if (currentPathname === targetHref) return true;

  // Normalized path: convert /admin prefix to /pms for matching
  const normalizedCurrent = currentPathname.startsWith("/admin")
    ? currentPathname.replace(/^\/admin/, "/pms")
    : currentPathname;

  const normalizedTarget = targetHref.startsWith("/admin")
    ? targetHref.replace(/^\/admin/, "/pms")
    : targetHref;

  if (normalizedCurrent === normalizedTarget) return true;

  // Don't prefix-match root dashboards
  if (
    normalizedTarget === "/pms" ||
    normalizedTarget === "/pms/dashboard" ||
    normalizedTarget === "/admin" ||
    normalizedTarget === "/admin/dashboard"
  ) {
    return false;
  }

  // Prefix match (e.g. /pms/rooms/types matches /pms/rooms)
  if (normalizedCurrent.startsWith(`${normalizedTarget}/`)) {
    return true;
  }

  return false;
}
