/**
 * Native File Save Adapter
 * 
 * Routes download/save operations through Capacitor Filesystem
 * on native, or anchor-click download on web.
 */

import { supportsNativeFilesystem } from '@/lib/nativeCapabilities';

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
    const path = await saveFileNative(blob, filename);
    return path ? { success: true, path } : { success: false };
  }
  return saveFileWeb(blob, filename);
}

/**
 * Save a blob to the native filesystem.
 * @param temp - If true, saves to cache (for share-then-delete flows)
 * @returns file URI or null
 */
export async function saveFileNative(
  blob: Blob,
  filename: string,
  temp: boolean = false,
): Promise<string | null> {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const base64 = await blobToBase64(blob);

    const dir = temp ? Directory.Cache : Directory.Documents;
    const result = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: dir,
      recursive: true,
    });
    return result.uri;
  } catch (e) {
    console.warn('[NativeFileSave] Write failed:', e);
    return null;
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
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
