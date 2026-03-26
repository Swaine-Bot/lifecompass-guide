/**
 * Auth redirect URL helper.
 * Returns the correct redirect URL for the current platform.
 * On native, uses the custom scheme. On web, uses window.location.origin.
 */

import { isNative } from './platform';

const CUSTOM_SCHEME_BASE = 'lifestack://';
const WEB_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Get the base redirect URL for auth callbacks.
 * Native: custom scheme (lifestack://)
 * Web: window.location.origin
 */
export function getAuthRedirectBase(): string {
  if (isNative()) {
    return CUSTOM_SCHEME_BASE;
  }
  return WEB_ORIGIN;
}

/**
 * Build a full auth redirect URL for a specific path.
 */
export function getAuthRedirectUrl(path: string = '/'): string {
  const base = getAuthRedirectBase();
  if (isNative()) {
    return `${base}${path.replace(/^\//, '')}`;
  }
  return `${base}${path}`;
}
