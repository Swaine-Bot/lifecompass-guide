import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles, Check, Image, LayoutGrid, Link2, QrCode, ImageIcon, Columns, Layers, ClipboardCopy, Handshake } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { triggerHaptic } from '@/engines/hapticEngine';
import cinematicBg from '@/assets/cinematic-hero-mountains.jpg';

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

/* ─── Shared crystal glass inline styles ─── */
const GLASS = {
  header: {
    background: 'rgba(255, 255, 255, 0.025)',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
  } as React.CSSProperties,
  capsule: {
    borderRadius: 999,
    background: 'rgba(255, 255, 255, 0.035)',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
    backdropFilter: 'blur(40px) saturate(150%)',
    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
  } as React.CSSProperties,
  tabBar: {
    borderRadius: 999,
    background: 'rgba(255, 255, 255, 0.03)',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.015) 100%)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.02)',
  } as React.CSSProperties,
  actionBar: {
    borderRadius: 34,
    background: 'rgba(255, 255, 255, 0.03)',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.015) 100%)',
    backdropFilter: 'blur(40px) saturate(150%)',
    WebkitBackdropFilter: 'blur(40px) saturate(150%)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)',
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

  const [sponsorEnabled, setSponsorEnabled] = useState(!!prefill?.sponsor);
  const [sponsorName, setSponsorName] = useState(prefill?.sponsor?.name || '');
  const [sponsorMessage, setSponsorMessage] = useState(prefill?.sponsor?.message || '');
  const [sponsorType, setSponsorType] = useState<'sponsored' | 'powered' | 'partnership' | 'rewards' | 'productivity'>(
    prefill?.sponsor?.attributionType || 'sponsored'
  );

  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const privacyLevel = getPrivacyLevel(privacy);
  const themeObj = THEMES[theme];
  const strategy = templateToStrategy(selectedTemplate);
  const envTone = useMemo(() => getEnvironmentTone(theme), [theme]);

  const sponsorData = useMemo(() => {
    if (!sponsorEnabled || !sponsorName.trim()) return undefined;
    return { name: sponsorName.trim(), message: sponsorMessage.trim() || undefined, attributionType: sponsorType };
  }, [sponsorEnabled, sponsorName, sponsorMessage, sponsorType]);

  const cardWithSponsor = useMemo(() => ({ ...selectedCard, sponsor: sponsorData }), [selectedCard, sponsorData]);

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
    });
  }, [cardWithSponsor, privacy, themeObj, platform, phrase, aiInsight, aiInsightEnabled, includePostImage, imageLayout, showImageCount, strategy]);

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
      <div className="min-h-screen relative overflow-hidden">
        <img src={cinematicBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'saturate(1.2) brightness(0.3)', transform: 'scale(1.08)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.65) 100%)',
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
            <h2 className="text-2xl font-serif font-bold text-white/90">Shared Successfully</h2>
            <p className="text-sm text-white/50">Your card has been shared as a rendered image.</p>
            {generatedSmartUrl && (
              <div className="space-y-2">
                <p className="text-[9px] text-white/25 uppercase tracking-[0.2em]">Your share link</p>
                <button onClick={() => { copyToClipboard(generatedSmartUrl); toast.success('Link copied'); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs text-white/60 hover:text-white/80 transition-colors"
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
                className="w-full text-white/35 hover:text-white/55" style={{ borderRadius: 999 }}>
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
      <div className="min-h-screen relative overflow-hidden">
        <img src={cinematicBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'saturate(1.2) brightness(0.3)', transform: 'scale(1.08)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(0,0,0,0.6) 100%)',
        }} />
        <div className="relative z-10">
          <div className="sticky top-0 z-40" style={GLASS.header}>
            <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setShowSaved(false)}
                className="text-white/35 hover:text-white/55" style={{ borderRadius: 999 }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-sm font-serif font-bold text-white/80">My Shared Cards</h1>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-5 py-6 space-y-3">
            {savedCards.length === 0 ? (
              <div className="text-center py-20">
                <Image className="w-10 h-10 text-white/15 mx-auto mb-3" />
                <p className="text-sm text-white/35">No cards generated yet</p>
              </div>
            ) : (
              savedCards.map((card) => (
                <div key={card.id} className="studio-glass-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/85">{card.title}</p>
                      <p className="text-[10px] text-white/30">
                        {card.card_type?.replace(/_/g, ' ')} · {card.theme} · {new Date(card.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={cn(
                      'text-[9px] px-3 py-1 font-medium',
                      card.is_shared ? 'text-[hsl(142,71%,45%)]' : 'text-white/35'
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

  // ─── Main Studio — Full-Screen Immersive Environment ───
  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >

      {/* ══ LAYER 1: Atmospheric Background ══ */}
      <img src={cinematicBg} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'saturate(1.3) brightness(0.28)', transform: 'scale(1.1)' }}
      />
      {/* Dark overlay — darkens during release ritual */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isReleasing ? 1.15 : 1 }}
        transition={{ duration: 0.12 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none studio-env-vignette" style={{
        background: 'radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(0,0,0,0.55) 100%)',
      }} />
      {/* Ambient gold light — upper left */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 15% 8%, rgba(200,160,60,0.04) 0%, transparent 45%)',
      }} />
      {/* Cool accent — lower right */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 85% 90%, rgba(100,140,200,0.015) 0%, transparent 40%)',
      }} />

      {/* ══ LAYER 2: Glass Chamber — one continuous surface ══ */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* ─── Ghost Header — glass orb back, minimal title, My Cards pill ─── */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-3" style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          <div className="flex items-center gap-3.5">
            {/* Glass orb back button */}
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center transition-all hover:scale-105"
              style={{
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}>
              <ArrowLeft className="h-3.5 w-3.5 text-white/50" />
            </button>
            <div>
              <h1 className="text-[12px] font-serif font-bold text-white/70 tracking-wide">Share Studio</h1>
              <p className="text-[9px] text-white/25 tracking-wider">Shape the moment before release</p>
            </div>
          </div>
          <button onClick={loadSavedCards}
            className="studio-secondary-action flex items-center gap-1.5 px-3.5 py-1.5 text-[9px] font-medium text-white/30 hover:text-white/55">
            <LayoutGrid className="w-3 h-3" />My Cards
          </button>
        </div>

        {/* ─── Continuous content flow ─── */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-5 pb-40">

          {/* ══ LAYER 3: Preview — dominant floating artifact ══ */}
          <div className="relative flex justify-center py-20">
            {/* Deep shadow pool */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none" style={{
              width: 280, height: 40, borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }} />
            {/* Primary halo — theme-colored */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="studio-stage-halo" style={{
                width: 420, height: 420, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeObj.accentHex}10 0%, ${themeObj.accentHex}06 30%, transparent 60%)`,
                filter: 'blur(50px)',
              }} />
            </div>
            {/* Secondary ambient halo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 560, height: 450, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 45%)',
                filter: 'blur(60px)',
              }} />
            </div>
            {/* Gold diffusion light */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,160,60,0.025) 0%, transparent 55%)',
                filter: 'blur(40px)',
                transform: 'translateY(-20px)',
              }} />
            </div>
            {/* The card itself — floating artifact with release ritual animation */}
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
                maxPreviewWidth={Math.min(300, window.innerWidth - 64)}
              />
            </motion.div>
          </div>

          {/* Regenerate — whisper-level */}
          <div className="flex justify-center -mt-6 mb-10">
            <button
              onClick={() => {
                const domain = mapLifeDomain(selectedCard.domain);
                const newPhilosophy = getPhilosophyLine(domain);
                setSelectedCard(prev => ({ ...prev, philosophy: newPhilosophy }));
                setPhrase(getRandomPhrase());
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 transition-all text-[9px] font-medium
                text-white/18 hover:text-white/40 active:scale-[0.97]"
              style={{ borderRadius: 999 }}
            >
              <RefreshCw className="w-3 h-3" />Regenerate
            </button>
          </div>

          {/* ═══ MODE RIBBON — floating glass selector ═══ */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-10">
              <div className="inline-flex gap-0.5 px-2 py-1.5" style={{
                borderRadius: 999,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.04)',
                backdropFilter: 'blur(28px) saturate(140%)',
                WebkitBackdropFilter: 'blur(28px) saturate(140%)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              }}>
                <TabsList className="bg-transparent flex gap-0 p-0">
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
                      className="studio-mode-dot"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {/* ═══ REFINEMENT ZONES — continuous, no containers ═══ */}

            <TabsContent value="template" className="studio-content-zone">
              <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />
              {!hasPrefill && (
                <div className="pt-6">
                  <span className="text-[8px] font-semibold text-white/20 uppercase tracking-[0.2em]">Card Type</span>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {demoCards.map((card) => (
                      <button key={card.cardType} onClick={() => setSelectedCard(card)}
                        className={cn(
                          'studio-option-pill flex items-center gap-2.5 px-3.5 py-3 text-left transition-all',
                          selectedCard.cardType === card.cardType && 'active'
                        )}>
                        <span className="text-base opacity-70">{CARD_TYPE_ICONS[card.cardType as CardType]}</span>
                        <div className="min-w-0">
                          <p className={cn('text-[11px] font-medium', selectedCard.cardType === card.cardType ? 'text-primary/80' : 'text-white/45')}>
                            {CARD_TYPE_LABELS[card.cardType as CardType]}
                          </p>
                          <p className="text-[9px] text-white/18 truncate">{card.title}</p>
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
                      <p className="text-[11px] font-medium text-primary/80">{CARD_TYPE_LABELS[selectedCard.cardType as CardType]}</p>
                      <p className="text-[9px] text-white/18 truncate">{selectedCard.title}</p>
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
                  <Label className="text-[11px] font-medium text-white/50 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-primary/40" />Include image
                  </Label>
                  <Switch checked={includePostImage} onCheckedChange={setIncludePostImage} />
                </div>
                {includePostImage && (
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'hero_image' as ImageLayout, label: 'Hero', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                      { value: 'split_image' as ImageLayout, label: 'Split', icon: <Columns className="w-3.5 h-3.5" /> },
                      { value: 'background_image' as ImageLayout, label: 'Atmos', icon: <Layers className="w-3.5 h-3.5" /> },
                    ]).map((opt) => (
                      <button key={opt.value} onClick={() => setImageLayout(opt.value)}
                        className={cn(
                          'studio-option-pill flex flex-col items-center gap-1 p-3 transition-all',
                          imageLayout === opt.value && 'active'
                        )}>
                        <span className={imageLayout === opt.value ? 'text-primary/70' : 'text-white/25'}>{opt.icon}</span>
                        <span className={cn('text-[9px] font-medium', imageLayout === opt.value ? 'text-primary/60' : 'text-white/25')}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
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
                <Label className="text-[11px] font-medium text-white/50 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-primary/40" />Smart link
                </Label>
                <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
              </div>
              <div className="studio-switch-row">
                <Label className="text-[11px] font-medium text-white/50 flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-primary/40" />QR code
                </Label>
                <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
              </div>
              {includeSmartLink && (
                <button onClick={handleCopyLink}
                  className="w-full text-[10px] text-white/30 hover:text-white/50 py-2.5 transition-colors flex items-center justify-center gap-1.5">
                  <Copy className="w-3 h-3" />
                  {generatedSmartUrl ? 'Copy link' : 'Generate link'}
                </button>
              )}
              {generatedSmartUrl && (
                <p className="text-[9px] text-white/15 text-center break-all">{generatedSmartUrl}</p>
              )}
            </TabsContent>

            <TabsContent value="sponsor" className="studio-content-zone space-y-4">
              <div className="studio-switch-row">
                <Label className="text-[11px] font-medium text-white/50 flex items-center gap-2 min-w-0 flex-1">
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
                    className="bg-transparent border-white/[0.04] text-white/70 placeholder:text-white/15 text-[11px] h-9"
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
                          sponsorType === opt.value ? 'text-primary/60' : 'text-white/22 hover:text-white/35'
                        )}
                        style={{ borderRadius: 999 }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={sponsorMessage}
                    onChange={(e) => setSponsorMessage(e.target.value)}
                    placeholder="CTA (optional)"
                    className="bg-transparent border-white/[0.04] text-white/70 placeholder:text-white/15 text-[11px] h-9"
                    style={{ borderRadius: 999 }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* ═══ ACTION STAGE ═══ */}
          <div className="pt-12 space-y-5">
            {/* Primary — Release */}
            <Button onClick={handleShare} disabled={sharing} variant="gold"
              className="studio-primary-action w-full h-14 text-[13px] font-semibold gap-2.5"
            >
              <Share2 className="w-4 h-4" />{sharing ? 'Composing…' : 'Release'}
            </Button>

            {/* Secondary actions — equal glass pills */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={handleCopy}
                className="studio-secondary-action flex items-center gap-1.5 px-4 py-2 text-[10px] font-medium text-white/30 hover:text-white/55">
                <ClipboardCopy className="w-3 h-3" />Copy
              </button>
              <button onClick={handleDownload}
                className="studio-secondary-action flex items-center gap-1.5 px-4 py-2 text-[10px] font-medium text-white/30 hover:text-white/55">
                <Download className="w-3 h-3" />Save
              </button>
              <button onClick={handleCopyLink}
                className="studio-secondary-action flex items-center gap-1.5 px-4 py-2 text-[10px] font-medium text-white/30 hover:text-white/55">
                <Link2 className="w-3 h-3" />Link
              </button>
            </div>

            {/* Tertiary — Save to Vault */}
            <div className="flex justify-center pt-2">
              <button onClick={handleSave}
                className="text-white/[0.10] hover:text-white/25 transition-all text-[9px] flex items-center gap-1.5 tracking-wider uppercase">
                <Download className="w-2.5 h-2.5" />Save to Vault
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
