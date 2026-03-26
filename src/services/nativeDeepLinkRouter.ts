/**
 * Native Deep Link Router
 * 
 * Resolves incoming deep-link URLs (custom scheme or universal links)
 * into React Router-compatible paths and navigates accordingly.
 */

/** Known app routes that can be deep-linked into */
const KNOWN_ROUTES = [
  '/auth',
  '/update-password',
  '/reset-password',
  '/onboarding',
  '/home',
  '/goals',
  '/habits',
  '/calendar',
  '/journal',
  '/mentor',
  '/library',
  '/community',
  '/life-events',
  '/mirror',
  '/cinematics',
  '/vault',
  '/share-studio',
  '/insights',
  '/settings',
  '/pricing',
  '/admin',
];

/** Dynamic route patterns */
const DYNAMIC_PATTERNS: Array<{ pattern: RegExp; prefix: string }> = [
  { pattern: /^\/s\/[\w-]+/, prefix: '/s/' },
  { pattern: /^\/goals\/[\w-]+/, prefix: '/goals/' },
  { pattern: /^\/habits\/new/, prefix: '/habits/new' },
  { pattern: /^\/goals\/new/, prefix: '/goals/new' },
  { pattern: /^\/journal\/playback\/[\w-]+/, prefix: '/journal/playback/' },
];

/**
 * Known domains for the app (universal links).
 * Custom scheme: lifestack://
 */
const APP_DOMAINS = [
  'lifecompass-guide.lovable.app',
  'lifestack.app',
];

const CUSTOM_SCHEME = 'lifestack://';

type NavigateFn = (path: string) => void;

let navigateFn: NavigateFn | null = null;

/**
 * Register the React Router navigate function.
 * Must be called once from a component inside <BrowserRouter>.
 */
export function registerNavigate(fn: NavigateFn): void {
  navigateFn = fn;
}

/**
 * Extract the app-relative path from a deep-link URL.
 * 
 * Handles:
 * - Custom scheme: lifestack:///home → /home
 * - Universal links: https://lifecompass-guide.lovable.app/home → /home
 * - Auth callbacks with hash fragments (access_token, type=recovery, etc.)
 */
export function extractPathFromUrl(rawUrl: string): string | null {
  try {
    // Custom scheme
    if (rawUrl.startsWith(CUSTOM_SCHEME)) {
      const afterScheme = rawUrl.slice(CUSTOM_SCHEME.length).replace(/^\/+/, '/');
      return afterScheme || '/home';
    }

    const url = new URL(rawUrl);

    // Verify domain
    if (!APP_DOMAINS.includes(url.hostname)) {
      console.warn('[DeepLink] Unknown domain:', url.hostname);
      return null;
    }

    // Preserve hash for auth callbacks (e.g., #access_token=...)
    const path = url.pathname || '/';
    const hash = url.hash || '';
    const search = url.search || '';

    return `${path}${search}${hash}`;
  } catch {
    console.warn('[DeepLink] Failed to parse URL:', rawUrl);
    return null;
  }
}

/**
 * Check if the deep link is a Supabase auth callback.
 * Auth callbacks contain hash fragments with access_token, type, etc.
 */
export function isAuthCallback(path: string): boolean {
  // Hash-based auth callbacks: #access_token=...&type=recovery
  if (path.includes('#access_token=') || path.includes('#error=')) {
    return true;
  }
  // Query-based callbacks from newer Supabase versions
  if (path.includes('access_token=') || path.includes('token_hash=')) {
    return true;
  }
  return false;
}

/**
 * Handle an auth callback deep link.
 * Supabase client auto-detects hash fragments in the URL,
 * so we just need to ensure the right page is displayed.
 */
export function resolveAuthCallbackRoute(path: string): string {
  // Check for password recovery flow
  if (path.includes('type=recovery')) {
    return '/update-password' + (path.includes('#') ? path.substring(path.indexOf('#')) : '');
  }
  // Check for email verification / signup confirmation
  if (path.includes('type=signup') || path.includes('type=email')) {
    return '/home';
  }
  // Default: go home (session will be established by Supabase client)
  return '/home';
}

/**
 * Check if a path is a recognized app route.
 */
export function isKnownRoute(path: string): boolean {
  const cleanPath = path.split('#')[0].split('?')[0];
  
  if (KNOWN_ROUTES.includes(cleanPath)) return true;
  
  for (const dp of DYNAMIC_PATTERNS) {
    if (dp.pattern.test(cleanPath)) return true;
  }
  
  return false;
}

/**
 * Main entry point: resolve a raw deep-link URL and navigate.
 * Called from nativeAppService's appUrlOpen handler.
 */
export function handleDeepLink(rawUrl: string): void {
  console.log('[DeepLink] raw_url:', rawUrl);
  
  const path = extractPathFromUrl(rawUrl);
  if (!path) {
    console.warn('[DeepLink] Could not extract path');
    return;
  }

  // Auth callbacks need special handling
  if (isAuthCallback(path)) {
    const targetRoute = resolveAuthCallbackRoute(path);
    console.log('[DeepLink] Auth callback → navigating to:', targetRoute);
    
    // For auth callbacks, we need to set the URL hash so Supabase client
    // can detect and process the tokens. On native, we do this via
    // window.location.hash manipulation before navigation.
    if (path.includes('#')) {
      const hashPart = path.substring(path.indexOf('#'));
      window.location.hash = hashPart;
    }
    
    if (navigateFn) navigateFn(targetRoute);
    return;
  }

  // Normal routes
  const cleanPath = path.split('#')[0].split('?')[0];
  if (isKnownRoute(cleanPath)) {
    console.log('[DeepLink] Known route → navigating to:', path);
    if (navigateFn) navigateFn(path);
  } else {
    console.warn('[DeepLink] Unknown route, defaulting to /home:', path);
    if (navigateFn) navigateFn('/home');
  }
}
