/**
 * Native Share Adapter
 * 
 * Unified share entry point that routes to Capacitor Share
 * on native or navigator.share on web.
 */

import { supportsNativeShare } from '@/lib/nativeCapabilities';

interface ShareResult {
  shared: boolean;
  method: string;
}

/**
 * Share an image blob (PNG card) via the native share sheet or web API.
 */
export async function shareImage(
  imageBlob: Blob,
  filename: string = 'lifestack-share.png',
): Promise<ShareResult> {
  if (supportsNativeShare()) {
    return nativeShareImage(imageBlob, filename);
  }
  return webShareImage(imageBlob, filename);
}

/**
 * Share text content (caption, link) via the native share sheet or web API.
 */
export async function shareText(
  text: string,
  title?: string,
  url?: string,
): Promise<ShareResult> {
  if (supportsNativeShare()) {
    return nativeShareText(text, title, url);
  }
  return webShareText(text, title, url);
}

// ── Native (Capacitor) paths ──

async function nativeShareImage(blob: Blob, filename: string): Promise<ShareResult> {
  let tempFilePath: string | null = null;
  try {
    console.log('[NativeShare] start blob_size:', blob.size, 'filename:', filename);
    const { saveFileNative, cleanupTempFiles } = await import('./nativeFileSaveAdapter');
    tempFilePath = await saveFileNative(blob, filename, true);
    if (!tempFilePath) {
      console.warn('[NativeShare] file_save_failed');
      return { shared: false, method: 'file_save_failed' };
    }
    console.log('[NativeShare] temp_file:', tempFilePath);

    const { Share } = await import('@capacitor/share');
    await Share.share({ files: [tempFilePath] });

    // Schedule cleanup after share completes
    setTimeout(() => {
      if (tempFilePath) cleanupTempFiles([tempFilePath]);
    }, 5000);

    return { shared: true, method: 'native_share' };
  } catch (e: any) {
    // Clean up on error too
    if (tempFilePath) {
      import('./nativeFileSaveAdapter').then(({ cleanupTempFiles }) => {
        cleanupTempFiles([tempFilePath!]);
      });
    }
    if (e?.message?.includes('cancel') || e?.message?.includes('Cancel') || e?.message?.includes('dismissed')) {
      return { shared: false, method: 'cancelled' };
    }
    console.warn('[NativeShare] Image share failed:', e);
    return { shared: false, method: 'native_error' };
  }
}

async function nativeShareText(text: string, title?: string, url?: string): Promise<ShareResult> {
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ text, title, url, dialogTitle: title });
    return { shared: true, method: 'native_share' };
  } catch (e: any) {
    if (e?.message?.includes('cancel') || e?.message?.includes('Cancel') || e?.message?.includes('dismissed')) {
      return { shared: false, method: 'cancelled' };
    }
    return { shared: false, method: 'native_error' };
  }
}

// ── Web paths ──

async function webShareImage(blob: Blob, filename: string): Promise<ShareResult> {
  if (!navigator.share) {
    return { shared: false, method: 'unsupported' };
  }
  if (!blob || blob.size === 0) {
    return { shared: false, method: 'no_blob' };
  }

  const file = new File([blob], filename, { type: 'image/png' });
  try {
    const shareData: ShareData = { files: [file] };
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return { shared: true, method: 'native_file' };
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return { shared: false, method: 'cancelled' };
    console.warn('[WebShare] Image share failed:', err?.message);
  }
  return { shared: false, method: 'file_unsupported' };
}

async function webShareText(text: string, title?: string, url?: string): Promise<ShareResult> {
  if (!navigator.share) {
    return { shared: false, method: 'unsupported' };
  }
  try {
    const shareData: ShareData = { text, title, url };
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return { shared: true, method: 'native_text' };
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return { shared: false, method: 'cancelled' };
  }
  return { shared: false, method: 'unsupported' };
}
