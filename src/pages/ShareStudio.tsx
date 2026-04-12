import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles, Check, Image, LayoutGrid, Link2, QrCode, ImageIcon, Columns, Layers, ClipboardCopy, Handshake, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/SensoryContext';
import { toast } from 'sonner';
import { SharePrivacyControls } from '@/components/share/SharePrivacyControls';
import { PlatformSelector } from '@/components/share/PlatformSelector';
import { ShareThemeSelector } from '@/components/share/ShareThemeSelector';
import { TemplateSelector } from '@/components/share/TemplateSelector';
import { AIInsightControls, type InsightStyle } from '@/components/share/AIInsightControls';
import { suggestTemplate, type ShareTemplateName } from '@/components/share/templates';
import { CompositionCard, exportCompositionToBlob } from '@/components/share/CompositionCard';
import { normalizeShareContent, type NormalizeInput } from '@/components/share/composition/normalizeShareContent';
import { computeCompositionSpec } from '@/components/share/composition/computeCompositionSpec';
import type { SharePlatform } from '@/components/share/platformProfiles';
import { PLATFORM_PROFILES } from '@/components/share/platformProfiles';
import type { BentoBaseVariant } from '@/components/share/bento/layoutEngine';
import { getEnvironmentTone } from '@/components/share/environmentTone';
import {
  ShareCardData, PrivacySettings, ShareTheme,
  DEFAULT_PRIVACY, generateDemoCards, getRandomPhrase, THEMES,
  nativeShare, copyToClipboard, copyImageToClipboard, trackShareEvent, saveShareCard,
  CARD_TYPE_LABELS, getPrivacyLevel, CARD_TYPE_ICONS,
  CardType, ImageLayout, buildShareCaption,
} from '@/services/shareService';
import { getPhilosophyLine, mapLifeDomain } from '@/services/shareLanguageEngine';
import { createShareLink } from '@/services/smartLinkService';
import { fetchActivePartners, fetchActiveAssetForPartner, type Partner, type PartnerAsset } from '@/services/partnerService';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { triggerHaptic } from '@/engines/hapticEngine';


type FlowStep = 'studio' | 'success';

function templateToStrategy(template: ShareTemplateName): BentoBaseVariant {
  switch (template) {
    case 'bento_hero': case 'story': case 'media_spotlight': return 'hero';
    case 'bento_split': case 'classic': case 'momentum': return 'split';
    case 'bento_reflection': case 'reflection': return 'reflection';
    case 'bento_minimal': case 'minimal': return 'minimal';
    default: return 'hero';
  }
}

function mapImageLayoutForNormalize(layout: ImageLayout): 'hero' | 'split' | 'background' | 'none' {
  switch (layout) {
    case 'hero_image': return 'hero';
    case 'split_image': return 'split';
    case 'background_image': return 'background';
    default: return 'none';
  }
}

/* ─── Crystal glass inline styles — ultra translucent ─── */
const GLASS = {
  capsule: {
    borderRadius: 999,
    background: 'rgba(255, 255, 255, 0.02)',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.015) 100%)',
    backdropFilter: 'blur(40px) saturate(150%)',
    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.12)',
  } as React.CSSProperties,
};

export default function ShareStudio() {
  useEnvironment('share_studio');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const demoCards = useMemo(() => generateDemoCards(), []);

  const prefill = (location.state as any)?.prefill as ShareCardData | undefined;
  const shareOrigin = (location.state as any)?.origin as string | undefined;
  const hasPrefill = !!prefill;
  const hasMedia = !!(prefill?.imageUrl || (prefill?.imageUrls && prefill.imageUrls.length > 0));

  const [selectedCard, setSelectedCard] = useState<ShareCardData>(prefill || demoCards[0]);
  const [theme, setTheme] = useState<ShareTheme>('obsidian_gold');
  const [platform, setPlatform] = useState<SharePlatform>('instagram_feed');
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [phrase, setPhrase] = useState(getRandomPhrase());
  const [sharing, setSharing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [step, setStep] = useState<FlowStep>('studio');
  const [activeTab, setActiveTab] = useState('template');

  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplateName>(
    suggestTemplate(shareOrigin, hasMedia)
  );

  const [aiInsightEnabled, setAiInsightEnabled] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightStyle, setInsightStyle] = useState<InsightStyle>('reflective');

  const [includeSmartLink, setIncludeSmartLink] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(shareOrigin === 'app_invite');
  const [generatedSmartUrl, setGeneratedSmartUrl] = useState<string | null>(null);

  const hasPostImage = !!(selectedCard.imageUrl || (selectedCard.imageUrls && selectedCard.imageUrls.length > 0));
  const [includePostImage, setIncludePostImage] = useState(true);
  const [imageLayout, setImageLayout] = useState<ImageLayout>(selectedCard.imageLayout || 'hero_image');
  const [showImageCount, setShowImageCount] = useState(true);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const [sponsorEnabled, setSponsorEnabled] = useState(!!prefill?.sponsor);
  const [sponsorName, setSponsorName] = useState(prefill?.sponsor?.name || '');
  const [sponsorMessage, setSponsorMessage] = useState(prefill?.sponsor?.message || '');
  const [sponsorType, setSponsorType] = useState<'sponsored' | 'powered' | 'partnership' | 'rewards' | 'productivity'>(
    prefill?.sponsor?.attributionType || 'sponsored'
  );

  // ─── Partner Pipeline State ───
  const [availablePartners, setAvailablePartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [activePartnerAsset, setActivePartnerAsset] = useState<PartnerAsset | null>(null);
  const [loadingPartnerAsset, setLoadingPartnerAsset] = useState(false);

  // Load available partners on mount
  useEffect(() => {
    fetchActivePartners().then(setAvailablePartners).catch(() => {});
  }, []);

  // When partner is selected, fetch their active share_card asset
  useEffect(() => {
    if (!selectedPartnerId) {
      setActivePartnerAsset(null);
      return;
    }
    setLoadingPartnerAsset(true);
    const partner = availablePartners.find(p => p.id === selectedPartnerId);
    if (partner) {
      // Auto-fill sponsor fields from partner
      setSponsorEnabled(true);
      setSponsorName(partner.name);

      // Determine disclosure type
      const disclosureMap: Record<string, typeof sponsorType> = {
        'Sponsored': 'sponsored', 'Powered': 'powered', 'Partnership': 'partnership',
        'In Partnership With': 'partnership', 'Rewards': 'rewards', 'Productivity': 'productivity',
      };
      setSponsorType(disclosureMap[partner.disclosure_label] || 'sponsored');

      // Set default CTA from partner
      if (partner.default_cta_label) setSponsorMessage(partner.default_cta_label);
    }

    fetchActiveAssetForPartner(selectedPartnerId, 'share_card')
      .then(asset => {
        setActivePartnerAsset(asset);
        if (asset) {
          // Apply asset-level overrides
          if (asset.disclosure_override) {
            const disclosureMap: Record<string, typeof sponsorType> = {
              'Sponsored': 'sponsored', 'Powered': 'powered', 'Partnership': 'partnership',
              'Rewards': 'rewards', 'Productivity': 'productivity',
            };
            setSponsorType(disclosureMap[asset.disclosure_override] || 'sponsored');
          }
          if (asset.cta_label_override) setSponsorMessage(asset.cta_label_override);
        }
      })
      .catch(() => setActivePartnerAsset(null))
      .finally(() => setLoadingPartnerAsset(false));
  }, [selectedPartnerId, availablePartners]);

  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const privacyLevel = getPrivacyLevel(privacy);
  const themeObj = THEMES[theme];
  const strategy = templateToStrategy(selectedTemplate);
  const envTone = useMemo(() => getEnvironmentTone(theme), [theme]);

  const sponsorData = useMemo(() => {
    if (!sponsorEnabled || !sponsorName.trim()) return undefined;
    return {
      name: sponsorName.trim(),
      message: sponsorMessage.trim() || undefined,
      attributionType: sponsorType,
      logoUrl: activePartnerAsset?.file_url || undefined,
      cta: (() => {
        if (activePartnerAsset?.cta_label_override) return activePartnerAsset.cta_label_override;
        const partner = availablePartners.find(p => p.id === selectedPartnerId);
        return partner?.default_cta_label || undefined;
      })(),
    };
  }, [sponsorEnabled, sponsorName, sponsorMessage, sponsorType, activePartnerAsset, availablePartners, selectedPartnerId]);

  const cardWithSponsor = useMemo(() => ({ ...selectedCard, sponsor: sponsorData, imagePosition }), [selectedCard, sponsorData, imagePosition]);

  const normalizedContent = useMemo(() => {
    return normalizeShareContent({
      data: cardWithSponsor,
      privacy,
      theme: themeObj,
      platform,
      phrase,
      aiInsight,
      aiInsightEnabled,
      includeImage: includePostImage,
      imageLayout: mapImageLayoutForNormalize(imageLayout),
      showImageCount,
      strategy,
      imagePosition,
    });
  }, [cardWithSponsor, privacy, themeObj, platform, phrase, aiInsight, aiInsightEnabled, includePostImage, imageLayout, showImageCount, strategy, imagePosition]);

  const previewWidth = Math.min(280, window.innerWidth - 80);
  const previewSpec = useMemo(() => computeCompositionSpec(normalizedContent, platform), [normalizedContent, platform]);
  const previewScale = previewWidth / previewSpec.width;
  const mediaOverlayStyle = useMemo<React.CSSProperties | null>(() => {
    if (!hasPostImage || !includePostImage || !previewSpec.panels.media.visible) return null;

    const media = previewSpec.panels.media;
    return {
      left: media.x * previewScale,
      top: media.y * previewScale,
      width: media.width * previewScale,
      height: media.height * previewScale,
      borderRadius: imageLayout === 'hero_image'
        ? '34px 34px 0 0'
        : imageLayout === 'split_image'
          ? '34px 0 0 34px'
          : 34,
    };
  }, [hasPostImage, includePostImage, previewSpec, previewScale, imageLayout]);

  const generateSmartLink = useCallback(async (): Promise<string | null> => {
    if (!user || !includeSmartLink) return null;
    try {
      const result = await createShareLink({
        userId: user.id,
        sourceType: selectedCard.sourceType || selectedCard.cardType,
        sourceId: selectedCard.sourceId,
        title: selectedCard.title,
        subtitle: selectedCard.subtitle,
        cardType: selectedCard.cardType,
        landingPageType: selectedCard.sourceType === 'app_invite' ? 'invite' : 'generic',
        visibilityMode: privacyLevel === 'anonymous' ? 'private' : 'public',
      });
      if (result.error) return null;
      setGeneratedSmartUrl(result.smartUrl);
      return result.smartUrl;
    } catch {
      return null;
    }
  }, [user, includeSmartLink, selectedCard, privacyLevel]);

  const handleShare = useCallback(async () => {
    if (!user) return;
    setSharing(true);
    try {
      const blob = await exportCompositionToBlob(normalizedContent, platform);
      if (!blob) { toast.error('Failed to render share card — please try again'); return; }
      const smartUrl = await generateSmartLink();
      const caption = buildShareCaption(selectedCard, phrase, aiInsight, aiInsightEnabled, smartUrl);
      const nativePreset = PLATFORM_PROFILES[platform].nativeSharePreset;

      // ── Pre-share ritual: decision → commitment → release ──
      setIsReleasing(true);
      triggerHaptic('confirmation');
      await new Promise(r => setTimeout(r, 160));
      setIsReleasing(false);

      const result = await nativeShare(blob, nativePreset);
      await trackShareEvent(user.id, selectedCard.cardType, result.shared ? `native_${nativePreset}` : result.method, platform, privacyLevel);
      await saveShareCard(user.id, selectedCard, theme, privacyLevel, phrase);
      if (result.shared) {
        await copyToClipboard(caption);
        toast.success('Card shared! Caption copied for pasting.', { duration: 4000 });
        setStep('success');
      } else if (result.method === 'cancelled') {
        // User cancelled
      } else {
        const imgCopied = await copyImageToClipboard(blob);
        if (imgCopied) {
          await copyToClipboard(caption);
          toast.success('Card image copied to clipboard — paste it into any app! Caption also copied.');
        } else {
          const { saveFile } = await import('@/services/share/nativeFileSaveAdapter');
          const saveResult = await saveFile(blob, `lifestack-${platform}-share.png`);
          if (saveResult.success) {
            await copyToClipboard(caption);
            toast.success('Card saved. Caption copied for pasting.');
          } else {
            toast.error('Save failed');
          }
        }
        setStep('success');
      }
    } catch (err) {
      console.error('[ShareStudio] Share failed:', err);
      toast.error('Share failed — try the Copy or Download buttons');
    } finally {
      setSharing(false);
      setIsReleasing(false);
    }
  }, [user, selectedCard, phrase, platform, privacyLevel, theme, aiInsight, aiInsightEnabled, normalizedContent, generateSmartLink]);

  const handleCopy = useCallback(async () => {
    const blob = await exportCompositionToBlob(normalizedContent, platform);
    if (blob) {
      const ok = await copyImageToClipboard(blob);
      if (ok) { toast.success('Card image copied to clipboard!'); return; }
    }
    const smartUrl = generatedSmartUrl || (await generateSmartLink());
    const caption = buildShareCaption(selectedCard, phrase, aiInsight, aiInsightEnabled, smartUrl);
    const ok = await copyToClipboard(caption);
    if (ok) toast.success('Caption copied to clipboard');
    else toast.error('Copy failed');
  }, [normalizedContent, platform, selectedCard, phrase, generatedSmartUrl, generateSmartLink, aiInsight, aiInsightEnabled]);

  const handleCopyLink = useCallback(async () => {
    let url = generatedSmartUrl;
    if (!url) url = await generateSmartLink();
    if (url) { await copyToClipboard(url); toast.success('Share link copied'); }
    else toast.error('Could not generate link');
  }, [generatedSmartUrl, generateSmartLink]);

  const handleDownload = useCallback(async () => {
    try {
      const blob = await exportCompositionToBlob(normalizedContent, platform);
      if (!blob) { toast.error('Render failed'); return; }
      const { saveFile } = await import('@/services/share/nativeFileSaveAdapter');
      const result = await saveFile(blob, `lifestack-${platform}-${selectedCard.cardType}-${Date.now()}.png`);
      if (result.success) toast.success('Image saved');
      else toast.error('Download failed');
    } catch { toast.error('Download failed'); }
  }, [normalizedContent, platform, selectedCard.cardType]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    const { error } = await saveShareCard(user.id, selectedCard, theme, privacyLevel, phrase);
    if (error) toast.error('Save failed');
    else toast.success('Saved to Vault');
  }, [user, selectedCard, theme, privacyLevel, phrase]);

  const loadSavedCards = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('share_cards').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20);
    setSavedCards(data || []);
    setShowSaved(true);
  }, [user]);

  // ─── Success Screen ───
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)',
        }} />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 mx-auto flex items-center justify-center"
              style={{
                borderRadius: 999,
                background: 'rgba(34, 197, 94, 0.06)',
                border: '1px solid rgba(34, 197, 94, 0.12)',
                backdropFilter: 'blur(60px)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 40px rgba(34,197,94,0.08)',
              }}>
              <Check className="w-8 h-8" style={{ color: 'hsl(142, 71%, 45%)' }} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">Shared Successfully</h2>
            <p className="text-sm text-white">Your card has been shared as a rendered image.</p>
            {generatedSmartUrl && (
              <div className="space-y-2">
                <p className="text-[9px] text-white uppercase tracking-[0.2em]">Your share link</p>
                <button onClick={() => { copyToClipboard(generatedSmartUrl); toast.success('Link copied'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs text-white hover:text-white transition-colors"
                  style={GLASS.capsule}>
                  <Link2 className="w-3 h-3 text-primary" />{generatedSmartUrl}
                </button>
              </div>
            )}
            <div className="space-y-3 pt-2">
              <Button onClick={() => { setStep('studio'); setGeneratedSmartUrl(null); }}
                variant="gold" className="w-full h-12" style={{ borderRadius: 999 }}>
                Create Another
              </Button>
              <Button onClick={() => navigate(-1)} variant="ghost"
                className="w-full text-white hover:text-white" style={{ borderRadius: 999 }}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Saved Cards ───
  if (showSaved) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)',
        }} />
        <div className="relative z-10">
          <div className="sticky top-0 z-40" style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(40px) saturate(160%)',
            WebkitBackdropFilter: 'blur(40px) saturate(160%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setShowSaved(false)}
                className="text-white hover:text-white" style={{ borderRadius: 999 }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-sm font-serif font-bold text-white">My Shared Cards</h1>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-5 py-6 space-y-3">
            {savedCards.length === 0 ? (
              <div className="text-center py-20">
                <Image className="w-10 h-10 text-white mx-auto mb-3" />
                <p className="text-sm text-white">No cards generated yet</p>
              </div>
            ) : (
              savedCards.map((card) => (
                <div key={card.id} className="studio-glass-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{card.title}</p>
                      <p className="text-[10px] text-white">
                        {card.card_type?.replace(/_/g, ' ')} · {card.theme} · {new Date(card.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={cn(
                      'text-[9px] px-3 py-1 font-medium',
                      card.is_shared ? 'text-[hsl(142,71%,45%)]' : 'text-white'
                    )} style={{
                      borderRadius: 999,
                      background: card.is_shared ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${card.is_shared ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)'}`,
                    }}>
                      {card.is_shared ? 'Shared' : 'Saved'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Studio — Pure glass overlay on existing environment ───
  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >

      {/* ══ Subtle dimming — focus layer, NOT a background ══ */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ opacity: isReleasing ? 0.85 : 1 }}
        transition={{ duration: 0.12 }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* ══ Content — pure glass interface over the existing world ══ */}
      <div className="relative z-10 min-h-full flex flex-col">

        {/* ─── Ghost Header — nearly invisible, no panel feel ─── */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-5" style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          paddingBottom: '12px',
          background: 'rgba(255, 255, 255, 0.012)',
          backdropFilter: 'blur(48px) saturate(160%)',
          WebkitBackdropFilter: 'blur(48px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div className="flex items-center gap-3.5">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center transition-all hover:scale-105"
              style={{
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}>
              <ArrowLeft className="h-3.5 w-3.5 text-white" />
            </button>
            <div>
              <h1 className="text-[12px] font-serif font-bold text-white tracking-wide"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}>Share Studio</h1>
              <p className="text-[9px] text-white tracking-wider"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Shape the moment before release</p>
            </div>
          </div>
          <button onClick={loadSavedCards}
            className="studio-secondary-action flex items-center gap-1.5 px-3.5 py-1.5 text-[9px] font-medium text-white hover:text-white">
            <LayoutGrid className="w-3 h-3" />My Cards
          </button>
        </div>

        {/* ─── Continuous content flow — no container boundaries ─── */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-5 pb-40">

          {/* ══ PREVIEW STAGE — floating relic in a luminous glass cradle ══ */}
          <div className="relative flex justify-center py-16">
            {/* Warm environmental halo — world warming the chamber */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 500, height: 460, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,160,60,0.03) 0%, rgba(200,160,60,0.01) 35%, transparent 65%)',
                filter: 'blur(50px)',
              }} />
            </div>
            {/* Cool internal reflection — artifact cooling the stage */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 350, height: 380, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(120,160,220,0.015) 0%, transparent 50%)',
                filter: 'blur(40px)',
                transform: 'translateY(10px)',
              }} />
            </div>
            {/* Theme-colored halo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="studio-stage-halo" style={{
                width: 380, height: 380, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeObj.accentHex}0C 0%, ${themeObj.accentHex}04 35%, transparent 60%)`,
                filter: 'blur(45px)',
              }} />
            </div>
            {/* Shadow pool beneath artifact */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none" style={{
              width: 240, height: 32, borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
              filter: 'blur(18px)',
            }} />
            {/* Glass cradle — the ceremonial stage */}
            <div className="studio-preview-cradle p-6 relative">
              {/* The card itself — floating artifact */}
              <motion.div
                className="relative studio-card-float"
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{
                  scale: isReleasing ? 0.986 : 1,
                  opacity: 1,
                }}
                transition={isReleasing
                  ? { scale: { duration: 0.09, ease: 'easeIn' } }
                  : { scale: { duration: 0.36, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.36 } }
                }
              >
                <CompositionCard
                  content={normalizedContent}
                  platform={platform}
                  maxPreviewWidth={previewWidth}
                />
                {mediaOverlayStyle && (
                  <div
                    className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
                    style={mediaOverlayStyle}
                    onPointerDown={(e) => {
                      const el = e.currentTarget;
                      el.setPointerCapture(e.pointerId);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startPos = { ...imagePosition };
                      const onMove = (ev: PointerEvent) => {
                        const dx = ev.clientX - startX;
                        const dy = ev.clientY - startY;
                        const sensitivity = 0.3;
                        const x = Math.max(0, Math.min(100, startPos.x - dx * sensitivity));
                        const y = Math.max(0, Math.min(100, startPos.y - dy * sensitivity));
                        setImagePosition({ x: Math.round(x), y: Math.round(y) });
                      };
                      const onUp = () => {
                        el.removeEventListener('pointermove', onMove);
                        el.removeEventListener('pointerup', onUp);
                      };
                      el.addEventListener('pointermove', onMove);
                      el.addEventListener('pointerup', onUp);
                    }}
                  >
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full opacity-50 hover:opacity-90 transition-opacity pointer-events-none"
                      style={{
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <Move className="w-2 h-2 text-white/70" />
                      <span className="text-[7px] text-white/70 font-medium">Drag to reposition</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Regenerate — whisper-level */}
          <div className="flex justify-center -mt-4 mb-10">
            <button
              onClick={() => {
                const domain = mapLifeDomain(selectedCard.domain);
                const newPhilosophy = getPhilosophyLine(domain);
                setSelectedCard(prev => ({ ...prev, philosophy: newPhilosophy }));
                setPhrase(getRandomPhrase());
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 transition-all text-[9px] font-medium
                text-white hover:text-white active:scale-[0.97]"
              style={{ borderRadius: 999, textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}
            >
              <RefreshCw className="w-3 h-3" />Regenerate
            </button>
          </div>

          {/* ═══ MODE RIBBON — horizontally scrollable glass band ═══ */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="relative mb-10 -mx-5">
              {/* Left fade edge */}
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 100%)' }} />
              {/* Right fade edge */}
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.45) 0%, transparent 100%)' }} />

              <div
                className="overflow-x-auto overflow-y-hidden scrollbar-hide"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <div className="inline-flex gap-0.5 px-7 py-1.5 min-w-max" style={{
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.018)',
                  backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(44px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(44px) saturate(160%)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 30px rgba(255,255,255,0.01)',
                }}>
                  <TabsList className="bg-transparent flex gap-0 p-0 w-auto">
                    {[
                      { value: 'template', label: 'Template' },
                      { value: 'ai', label: 'AI' },
                      { value: 'style', label: 'Style' },
                      ...(hasPostImage ? [{ value: 'image', label: 'Image' }] : []),
                      { value: 'sponsor', label: 'Partner' },
                      { value: 'privacy', label: 'Privacy' },
                      { value: 'platform', label: 'Platform' },
                      { value: 'link', label: 'Link' },
                    ].map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}
                        className="studio-mode-dot flex-shrink-0 whitespace-nowrap"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            </div>

            {/* ═══ REFINEMENT FIELD — continuous, no containers ═══ */}

            <TabsContent value="template" className="studio-content-zone">
              <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />
              {!hasPrefill && (
                <div className="pt-6">
                  <span className="text-[8px] font-semibold text-white uppercase tracking-[0.2em]"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>Card Type</span>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {demoCards.map((card) => (
                      <button key={card.cardType} onClick={() => setSelectedCard(card)}
                        className={cn(
                          'studio-option-pill flex items-center gap-2.5 px-3.5 py-3 text-left transition-all',
                          selectedCard.cardType === card.cardType && 'active'
                        )}>
                        <span className="text-base opacity-70">{CARD_TYPE_ICONS[card.cardType as CardType]}</span>
                        <div className="min-w-0">
                          <p className={cn('text-[11px] font-medium', selectedCard.cardType === card.cardType ? 'text-primary/80' : 'text-white')}
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                            {CARD_TYPE_LABELS[card.cardType as CardType]}
                          </p>
                          <p className="text-[9px] text-white truncate">{card.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hasPrefill && (
                <div className="pt-6">
                  <div className="studio-option-pill active flex items-center gap-2.5 px-3.5 py-3">
                    <span className="text-base opacity-70">{CARD_TYPE_ICONS[selectedCard.cardType as CardType]}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-primary/80"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                        {CARD_TYPE_LABELS[selectedCard.cardType as CardType]}
                      </p>
                      <p className="text-[9px] text-white truncate">{selectedCard.title}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="studio-content-zone">
              <AIInsightControls
                enabled={aiInsightEnabled}
                onToggle={setAiInsightEnabled}
                insight={aiInsight}
                onInsightChange={setAiInsight}
                style={insightStyle}
                onStyleChange={setInsightStyle}
                contentTitle={selectedCard.title}
                contentSubtitle={selectedCard.subtitle}
                contentType={selectedCard.sourceType || selectedCard.cardType}
              />
            </TabsContent>

            <TabsContent value="style" className="studio-content-zone">
              <ShareThemeSelector theme={theme} onChange={setTheme} />
            </TabsContent>

            {hasPostImage && (
              <TabsContent value="image" className="studio-content-zone space-y-5">
                <div className="studio-switch-row">
                  <Label className="text-[11px] font-medium text-white flex items-center gap-2"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                    <ImageIcon className="w-3.5 h-3.5 text-primary/40" />Include image
                  </Label>
                  <Switch checked={includePostImage} onCheckedChange={setIncludePostImage} />
                </div>
                {includePostImage && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'hero_image' as ImageLayout, label: 'Hero', desc: 'Media dominant', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                        { value: 'split_image' as ImageLayout, label: 'Split', desc: '50/50 vertical', icon: <Columns className="w-3.5 h-3.5" /> },
                        { value: 'background_image' as ImageLayout, label: 'Atmos', desc: 'Immersive BG', icon: <Layers className="w-3.5 h-3.5" /> },
                      ]).map((opt) => (
                        <button key={opt.value} onClick={() => setImageLayout(opt.value)}
                          className={cn(
                            'studio-option-pill flex flex-col items-center gap-1 p-3 transition-all',
                            imageLayout === opt.value && 'active'
                          )}>
                          <span className={imageLayout === opt.value ? 'text-primary/70' : 'text-white'}>{opt.icon}</span>
                          <span className={cn('text-[9px] font-medium', imageLayout === opt.value ? 'text-primary/60' : 'text-white')}>{opt.label}</span>
                          <span className="text-[7px] text-white/40">{opt.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Image Reposition Control */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Move className="w-3 h-3 text-primary/40" />
                        <span className="text-[10px] font-medium text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                          Reposition image
                        </span>
                        <button
                          onClick={() => setImagePosition({ x: 50, y: 50 })}
                          className="ml-auto text-[8px] text-white/40 hover:text-white/70 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                      <div
                        className="relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                        style={{
                          height: 140,
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(0,0,0,0.3)',
                        }}
                        onPointerDown={(e) => {
                          const el = e.currentTarget;
                          const rect = el.getBoundingClientRect();
                          el.setPointerCapture(e.pointerId);

                          const handleMove = (ev: PointerEvent) => {
                            const x = Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100));
                            const y = Math.max(0, Math.min(100, ((ev.clientY - rect.top) / rect.height) * 100));
                            setImagePosition({ x: Math.round(x), y: Math.round(y) });
                          };

                          handleMove(e.nativeEvent);
                          const onMove = (ev: PointerEvent) => handleMove(ev);
                          const onUp = () => {
                            el.removeEventListener('pointermove', onMove);
                            el.removeEventListener('pointerup', onUp);
                          };
                          el.addEventListener('pointermove', onMove);
                          el.addEventListener('pointerup', onUp);
                        }}
                      >
                        <img
                          src={selectedCard.imageUrl || selectedCard.imageUrls?.[0]}
                          alt=""
                          className="w-full h-full pointer-events-none"
                          style={{
                            objectFit: 'cover',
                            objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                          }}
                        />
                        {/* Subtle grid overlay */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: `
                            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
                          `,
                          backgroundSize: '33.33% 33.33%',
                        }} />
                        {/* Focal point indicator */}
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: `${imagePosition.x}%`,
                            top: `${imagePosition.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.7)',
                            boxShadow: '0 0 12px rgba(0,0,0,0.5), 0 0 4px rgba(255,255,255,0.2)',
                          }}
                        />
                        {/* Reposition hint overlay */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                          <Move className="w-2.5 h-2.5 text-white/60" />
                          <span className="text-[8px] text-white/60 font-medium">Drag to reposition</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            )}

            <TabsContent value="privacy" className="studio-content-zone">
              <SharePrivacyControls privacy={privacy} onChange={setPrivacy} />
            </TabsContent>

            <TabsContent value="platform" className="studio-content-zone">
              <PlatformSelector platform={platform} onChange={setPlatform} />
            </TabsContent>

            <TabsContent value="link" className="studio-content-zone space-y-4">
              <div className="studio-switch-row">
                <Label className="text-[11px] font-medium text-white flex items-center gap-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                  <Link2 className="w-3.5 h-3.5 text-primary/40" />Smart link
                </Label>
                <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
              </div>
              <div className="studio-switch-row">
                <Label className="text-[11px] font-medium text-white flex items-center gap-2"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                  <QrCode className="w-3.5 h-3.5 text-primary/40" />QR code
                </Label>
                <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
              </div>
              {includeSmartLink && (
                <button onClick={handleCopyLink}
                  className="w-full text-[10px] text-white hover:text-white py-2.5 transition-colors flex items-center justify-center gap-1.5"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                  <Copy className="w-3 h-3" />
                  {generatedSmartUrl ? 'Copy link' : 'Generate link'}
                </button>
              )}
              {generatedSmartUrl && (
                <p className="text-[9px] text-white text-center break-all">{generatedSmartUrl}</p>
              )}
            </TabsContent>

            <TabsContent value="sponsor" className="studio-content-zone space-y-4">
              <div className="studio-switch-row">
                <Label className="text-[11px] font-medium text-white flex items-center gap-2 min-w-0 flex-1"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                  <Handshake className="w-3.5 h-3.5 text-primary/40 shrink-0" />Partner zone
                </Label>
                <Switch checked={sponsorEnabled} onCheckedChange={setSponsorEnabled} className="shrink-0" />
              </div>
              {sponsorEnabled && (
                <div className="space-y-3">
                  <Input
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="Partner name"
                    className="bg-transparent border-white/[0.04] text-white placeholder:text-white text-[11px] h-9"
                    style={{ borderRadius: 999 }}
                  />
                  <div className="flex gap-1 flex-wrap">
                    {([
                      { value: 'sponsored' as const, label: 'Sponsored' },
                      { value: 'powered' as const, label: 'Powered' },
                      { value: 'partnership' as const, label: 'Partner' },
                      { value: 'rewards' as const, label: 'Rewards' },
                      { value: 'productivity' as const, label: 'Prod.' },
                    ]).map((opt) => (
                      <button key={opt.value} onClick={() => setSponsorType(opt.value)}
                        className={cn(
                          'px-2.5 py-1 text-[9px] font-medium transition-all',
                          sponsorType === opt.value ? 'text-primary/60' : 'text-white hover:text-white'
                        )}
                        style={{ borderRadius: 999, textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={sponsorMessage}
                    onChange={(e) => setSponsorMessage(e.target.value)}
                    placeholder="CTA (optional)"
                    className="bg-transparent border-white/[0.04] text-white placeholder:text-white text-[11px] h-9"
                    style={{ borderRadius: 999 }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* ═══ RELEASE FIELD — integrated into the chamber ═══ */}
          <div className="pt-12 space-y-5">
            {/* Primary — Ceremonial release bubble */}
            <Button onClick={handleShare} disabled={sharing} variant="gold"
              className="studio-primary-action w-full h-14 text-[13px] font-semibold gap-2.5"
            >
              <Share2 className="w-4 h-4" />{sharing ? 'Composing…' : 'Release'}
            </Button>

            {/* Secondary actions — whisper-level glass pills */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleCopy}
                className="studio-secondary-action flex items-center gap-1.5 px-4 py-2 text-[10px] font-medium text-white hover:text-white">
                <ClipboardCopy className="w-3 h-3" />Copy
              </button>
              <button onClick={handleDownload}
                className="studio-secondary-action flex items-center gap-1.5 px-4 py-2 text-[10px] font-medium text-white hover:text-white">
                <Download className="w-3 h-3" />Save
              </button>
              <button onClick={handleCopyLink}
                className="studio-secondary-action flex items-center gap-1.5 px-4 py-2 text-[10px] font-medium text-white hover:text-white">
                <Link2 className="w-3 h-3" />Link
              </button>
            </div>

            {/* Tertiary — Save to Vault */}
            <div className="flex justify-center pt-2">
              <button onClick={handleSave}
                className="text-white hover:text-white transition-all text-[9px] flex items-center gap-1.5 tracking-wider uppercase"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.55)' }}>
                <Download className="w-2.5 h-2.5" />Save to Vault
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
