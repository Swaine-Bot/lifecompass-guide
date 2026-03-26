/**
 * Native File Save Adapter
 * 
 * Routes download/save operations through Capacitor Filesystem
 * on native, or anchor-click download on web.
 */

import { supportsNativeFilesystem } from '@/lib/nativeCapabilities';

/**
 * Sanitize a filename: remove unsafe characters, limit length.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 200);
}

/**
 * Generate a collision-safe filename with timestamp.
 */
function uniqueFilename(base: string): string {
  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')) : '';
  const name = base.includes('.') ? base.slice(0, base.lastIndexOf('.')) : base;
  const ts = Date.now();
  return sanitizeFilename(`${name}_${ts}${ext}`);
}

/**
 * Download/save a blob as a file.
 * Web: anchor click download.
 * Native: writes to device filesystem and returns the URI.
 */
export async function saveFile(
  blob: Blob,
  filename: string,
): Promise<{ success: boolean; path?: string }> {
  if (supportsNativeFilesystem()) {
    const path = await saveFileNative(blob, sanitizeFilename(filename));
    return path ? { success: true, path } : { success: false };
  }
  return saveFileWeb(blob, filename);
}

/**
 * Save a blob to the native filesystem.
 * @param temp - If true, saves to cache dir (for share-then-delete flows).
 *               Cache files use collision-safe naming.
 * @returns file URI or null
 * 
 * iOS: Documents → Files app → LifeStack folder
 * Android: Documents → accessible via file manager
 * Cache: temporary, OS may clean up
 */
export async function saveFileNative(
  blob: Blob,
  filename: string,
  temp: boolean = false,
): Promise<string | null> {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const base64 = await blobToBase64(blob);
    const safeName = temp ? uniqueFilename(filename) : sanitizeFilename(filename);
    const dir = temp ? Directory.Cache : Directory.Documents;

    // Ensure the LifeStack subfolder exists for persistent saves
    const path = temp ? safeName : `LifeStack/${safeName}`;

    const result = await Filesystem.writeFile({
      path,
      data: base64,
      directory: dir,
      recursive: true,
    });

    console.log('[NativeFileSave] wrote:', path, 'uri:', result.uri);
    return result.uri;
  } catch (e) {
    console.warn('[NativeFileSave] Write failed:', e);
    return null;
  }
}

/**
 * Clean up temp share files from cache.
 * Call after a share operation completes.
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  if (!supportsNativeFilesystem()) return;
  try {
    const { Filesystem } = await import('@capacitor/filesystem');
    for (const path of filePaths) {
      try {
        await Filesystem.deleteFile({ path });
      } catch {
        // File may already be cleaned up by OS
      }
    }
  } catch {
    // Non-critical
  }
}

function saveFileWeb(blob: Blob, filename: string): { success: boolean } {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch {
    return { success: false };
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get raw base64
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Failed to convert blob to base64'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
