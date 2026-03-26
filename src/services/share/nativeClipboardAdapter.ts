/**
 * Native Clipboard Adapter
 * 
 * Routes clipboard operations through Capacitor on native,
 * browser APIs on web.
 */

import { supportsNativeClipboard } from '@/lib/nativeCapabilities';

/**
 * Copy text to clipboard. Works on both web and native.
 */
export async function copyText(text: string): Promise<boolean> {
  if (supportsNativeClipboard()) {
    try {
      const { Clipboard } = await import('@capacitor/clipboard');
      await Clipboard.write({ string: text });
      return true;
    } catch {
      return false;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy image to clipboard.
 * On native: saves to filesystem and copies text fallback (image clipboard not reliable).
 * On web: uses ClipboardItem API.
 */
export async function copyImage(blob: Blob): Promise<boolean> {
  if (supportsNativeClipboard()) {
    // Native platforms don't reliably support image clipboard.
    // Return false so callers can fall back to file save.
    return false;
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
