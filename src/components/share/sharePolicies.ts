/**
 * Share Policies — platform-aware payload rules.
 *
 * Determines what gets sent via navigator.share for each share mode.
 * Social card shares are IMAGE-ONLY to prevent iOS apps (Facebook, Instagram,
 * LinkedIn, TikTok) from preferring URL/text over the PNG file.
 */

export type ShareMode = 'social_image_only' | 'generic_file_share' | 'link_only';

export interface SharePolicy {
  mode: ShareMode;
  /** Include files array in navigator.share payload */
  includeFiles: boolean;
  /** Include text/title in navigator.share payload */
  includeText: boolean;
  /** Include url in navigator.share payload */
  includeUrl: boolean;
  /** After successful image share, copy caption to clipboard */
  copyCaptionAfterShare: boolean;
  /** After successful image share, copy link to clipboard */
  copyLinkAfterShare: boolean;
}

const SOCIAL_IMAGE_ONLY: SharePolicy = {
  mode: 'social_image_only',
  includeFiles: true,
  includeText: false,
  includeUrl: false,
  copyCaptionAfterShare: true,
  copyLinkAfterShare: false,
};

const LINK_ONLY: SharePolicy = {
  mode: 'link_only',
  includeFiles: false,
  includeText: true,
  includeUrl: true,
  copyCaptionAfterShare: false,
  copyLinkAfterShare: false,
};

/**
 * Returns the share policy for card sharing.
 * Card shares are ALWAYS image-only to prevent URL contamination
 * that causes iOS apps to ignore the image file.
 */
export function getCardSharePolicy(): SharePolicy {
  return SOCIAL_IMAGE_ONLY;
}

/**
 * Returns the share policy for explicit link sharing.
 */
export function getLinkSharePolicy(): SharePolicy {
  return LINK_ONLY;
}
