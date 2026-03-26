import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles, Check, Image, LayoutGrid, Link2, QrCode, ImageIcon, Columns, Layers, ClipboardCopy, Handshake } from 'lucide-react';
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

/* ─── Shared glass inline styles ─── */
const GLASS = {
  header: {
    background: 'rgba(10, 16, 22, 0.10)',
    backdropFilter: 'blur(80px) saturate(160%)',
    WebkitBackdropFilter: 'blur(80px) saturate(160%)',
    borderBottom: '1px solid rgba(255,255,255,0.015)',
  } as React.CSSProperties,
  capsule: {
    borderRadius: 999,
    background: 'rgba(14, 22, 28, 0.15)',
    backdropFilter: 'blur(60px) saturate(145%)',
    WebkitBackdropFilter: 'blur(60px) saturate(145%)',
    border: '1px solid rgba(255,255,255,0.02)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  } as React.CSSProperties,
  tabBar: {
    borderRadius: 999,
    background: 'rgba(14, 22, 28, 0.15)',
    backdropFilter: 'blur(80px) saturate(160%)',
    WebkitBackdropFilter: 'blur(80px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.02)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
  } as React.CSSProperties,
  actionBar: {
    borderRadius: 28,
    background: 'rgba(14, 22, 28, 0.18)',
    backdropFilter: 'blur(60px) saturate(140%)',
    WebkitBackdropFilter: 'blur(60px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.02)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
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

  // ─── Main Studio — Cinematic Environment ───
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ══ ENVIRONMENT — full cinematic background ══ */}
      <img src={cinematicBg} alt="" aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'saturate(1.3) brightness(0.35)', transform: 'scale(1.08)' }}
      />

      {/* Multi-layer atmospheric depth */}
      <div className="absolute inset-0 pointer-events-none studio-env-vignette" style={{
        background: 'radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(0,0,0,0.6) 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 15% 8%, rgba(200,160,60,0.035) 0%, transparent 45%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 85% 90%, rgba(100,130,180,0.02) 0%, transparent 40%)',
      }} />

      {/* ═══ Content Layer ═══ */}
      <div className="relative z-10 min-h-screen">

        {/* ═══ HEADER — ghost glass ═══ */}
        <div className="sticky top-0 z-40" style={GLASS.header}>
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}
                className="text-white/25 hover:text-white/50 -ml-1" style={{ borderRadius: 999 }}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2.5">
                <div className="icon-orb-sm">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div>
                  <h1 className="text-sm font-serif font-bold text-white/80 leading-tight">Share Studio</h1>
                  <p className="text-[7px] uppercase tracking-[0.2em] text-white/18 font-medium">Compose · Publish</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={loadSavedCards}
              className="text-[10px] gap-1.5 text-white/20 hover:text-white/45 h-7" style={{ borderRadius: 999 }}>
              <LayoutGrid className="w-3 h-3" />Cards
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 py-4 space-y-6 pb-36">

          {/* ═══ PREVIEW STAGE — precious floating object ═══ */}
          <div className="relative flex justify-center py-14">
            {/* Multi-ring ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="studio-card-glow" style={{
                width: 320, height: 320, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeObj.accentHex}0A 0%, ${themeObj.accentHex}04 40%, transparent 70%)`,
                filter: 'blur(30px)',
              }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 200, height: 200, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeObj.accentHex}06 0%, transparent 60%)`,
                filter: 'blur(60px)',
              }} />
            </div>
            <div className="relative studio-card-float">
              <CompositionCard
                content={normalizedContent}
                platform={platform}
                maxPreviewWidth={Math.min(300, window.innerWidth - 64)}
              />
            </div>
          </div>

          {/* Canvas dims — ghost whisper */}
          <p className="text-center text-[7px] text-white/[0.06] uppercase tracking-[0.3em] font-medium -mt-4">
            {PLATFORM_PROFILES[platform].label} · {PLATFORM_PROFILES[platform].width}×{PLATFORM_PROFILES[platform].height}
          </p>

          {/* ═══ REGENERATE — floating glass capsule ═══ */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const domain = mapLifeDomain(selectedCard.domain);
                const newPhilosophy = getPhilosophyLine(domain);
                setSelectedCard(prev => ({ ...prev, philosophy: newPhilosophy }));
                setPhrase(getRandomPhrase());
              }}
              className="inline-flex items-center gap-2 px-6 py-3 transition-all text-[10px] font-medium
                text-white/30 hover:text-white/55 active:scale-[0.97]"
              style={GLASS.capsule}
            >
              <RefreshCw className="w-3 h-3" />Regenerate language
            </button>
          </div>

          {/* ═══ INSTRUMENT PANEL — atmospheric tab system ═══ */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-1.5" style={GLASS.tabBar}>
              <TabsList className="w-full bg-transparent flex overflow-x-auto scrollbar-hide gap-0.5">
                <TabsTrigger value="template" className="studio-tab">Template</TabsTrigger>
                <TabsTrigger value="ai" className="studio-tab">AI</TabsTrigger>
                <TabsTrigger value="style" className="studio-tab">Style</TabsTrigger>
                {hasPostImage && <TabsTrigger value="image" className="studio-tab">Image</TabsTrigger>}
                <TabsTrigger value="sponsor" className="studio-tab">Partner</TabsTrigger>
                <TabsTrigger value="privacy" className="studio-tab">Privacy</TabsTrigger>
                <TabsTrigger value="platform" className="studio-tab">Platform</TabsTrigger>
                <TabsTrigger value="link" className="studio-tab">Link</TabsTrigger>
              </TabsList>
            </div>

            {/* Template Tab */}
            <TabsContent value="template" className="mt-5">
              <div className="studio-glass-hero p-6 space-y-5">
                <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />
                {!hasPrefill && (
                  <div className="border-t border-white/[0.03] pt-5">
                    <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Card Type</span>
                    <div className="grid grid-cols-2 gap-2.5 mt-3">
                      {demoCards.map((card) => (
                        <button key={card.cardType} onClick={() => setSelectedCard(card)}
                          className={cn(
                            'studio-option-pill flex items-center gap-2.5 px-4 py-3.5 text-left transition-all',
                            selectedCard.cardType === card.cardType && 'active'
                          )}>
                          <span className="text-lg">{CARD_TYPE_ICONS[card.cardType as CardType]}</span>
                          <div className="min-w-0">
                            <p className={cn('text-xs font-medium', selectedCard.cardType === card.cardType ? 'text-primary' : 'text-white/60')}>
                              {CARD_TYPE_LABELS[card.cardType as CardType]}
                            </p>
                            <p className="text-[10px] text-white/20 truncate">{card.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {hasPrefill && (
                  <div className="border-t border-white/[0.03] pt-5">
                    <div className="studio-option-pill active flex items-center gap-2.5 px-4 py-3.5">
                      <span className="text-lg">{CARD_TYPE_ICONS[selectedCard.cardType as CardType]}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-primary">
                          {CARD_TYPE_LABELS[selectedCard.cardType as CardType]}
                        </p>
                        <p className="text-[10px] text-white/20 truncate">{selectedCard.title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Insight Tab */}
            <TabsContent value="ai" className="mt-5">
              <div className="studio-glass-hero p-6">
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
              </div>
            </TabsContent>

            <TabsContent value="style" className="mt-5">
              <div className="studio-glass-hero p-6 space-y-4">
                <ShareThemeSelector theme={theme} onChange={setTheme} />
              </div>
            </TabsContent>

            {hasPostImage && (
              <TabsContent value="image" className="mt-5">
                <div className="studio-glass-hero p-6 space-y-5">
                  <div>
                    <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Post Image</span>
                    <p className="text-[10px] text-white/18 mt-1">Control how the image appears on your share card.</p>
                  </div>
                  <div className="studio-switch-row">
                    <Label className="text-xs font-medium text-white/65 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-primary/60" />Include post image
                    </Label>
                    <Switch checked={includePostImage} onCheckedChange={setIncludePostImage} />
                  </div>
                  {includePostImage && (
                    <div className="space-y-3">
                      <Label className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Layout</Label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {([
                          { value: 'hero_image' as ImageLayout, label: 'Hero', icon: <ImageIcon className="w-4 h-4" />, desc: 'Image dominates' },
                          { value: 'split_image' as ImageLayout, label: 'Split', icon: <Columns className="w-4 h-4" />, desc: '50/50 balance' },
                          { value: 'background_image' as ImageLayout, label: 'Background', icon: <Layers className="w-4 h-4" />, desc: 'Atmospheric' },
                        ]).map((opt) => (
                          <button key={opt.value} onClick={() => setImageLayout(opt.value)}
                            className={cn(
                              'studio-option-pill flex flex-col items-center gap-1.5 p-3.5 transition-all',
                              imageLayout === opt.value && 'active'
                            )}>
                            {opt.icon}
                            <span className="text-[10px] font-medium">{opt.label}</span>
                            <span className="text-[8px] text-white/18">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            <TabsContent value="privacy" className="mt-5">
              <div className="studio-glass-hero p-6">
                <SharePrivacyControls privacy={privacy} onChange={setPrivacy} />
              </div>
            </TabsContent>

            <TabsContent value="platform" className="mt-5">
              <div className="studio-glass-hero p-6">
                <PlatformSelector platform={platform} onChange={setPlatform} />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-5">
              <div className="studio-glass-hero p-6 space-y-5">
                <div>
                  <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Link & Destination</span>
                  <p className="text-[10px] text-white/18 mt-1">Smart links route viewers to the app or store.</p>
                </div>
                <div className="studio-switch-row">
                  <Label className="text-xs font-medium text-white/65 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-primary/60" />Include smart link
                  </Label>
                  <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
                </div>
                <div className="studio-switch-row">
                  <Label className="text-xs font-medium text-white/65 flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-primary/60" />Show QR code on card
                  </Label>
                  <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
                </div>
                {includeSmartLink && (
                  <Button onClick={handleCopyLink} variant="outline" size="sm"
                    className="w-full text-white/45 h-10 hover:text-white/65"
                    style={{
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.02)',
                      borderColor: 'rgba(255,255,255,0.04)',
                    }}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {generatedSmartUrl ? 'Copy Share Link' : 'Generate & Copy Link'}
                  </Button>
                )}
                {generatedSmartUrl && (
                  <p className="text-[10px] text-white/18 text-center break-all">{generatedSmartUrl}</p>
                )}
              </div>
            </TabsContent>

            {/* Sponsor / Partner Tab */}
            <TabsContent value="sponsor" className="mt-5">
              <div className="studio-glass-hero p-6 space-y-5">
                <div>
                  <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Sponsor / Partner</span>
                  <p className="text-[10px] text-white/18 mt-1">Add a premium partner attribution to this card.</p>
                </div>
                <div className="studio-switch-row">
                  <Label className="text-xs font-medium text-white/65 flex items-center gap-2 min-w-0 flex-1">
                    <Handshake className="w-3.5 h-3.5 text-primary/60 shrink-0" />Enable partner zone
                  </Label>
                  <Switch checked={sponsorEnabled} onCheckedChange={setSponsorEnabled} className="shrink-0" />
                </div>
                {sponsorEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/25">Partner name</Label>
                      <Input
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="e.g. Discovery Vitality"
                        className="bg-white/[0.02] border-white/[0.03] text-white placeholder:text-white/12"
                        style={{ borderRadius: 20 }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/25">Attribution type</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([
                          { value: 'sponsored' as const, label: 'Sponsored by' },
                          { value: 'powered' as const, label: 'Powered by' },
                          { value: 'partnership' as const, label: 'Partnership' },
                          { value: 'rewards' as const, label: 'Rewards by' },
                          { value: 'productivity' as const, label: 'Prod. partner' },
                        ]).map((opt) => (
                          <button key={opt.value} onClick={() => setSponsorType(opt.value)}
                            className={cn(
                              'studio-option-pill px-2.5 py-2 text-[10px] font-medium transition-all',
                              sponsorType === opt.value && 'active'
                            )}
                            style={{ borderRadius: 14 }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/25">Message / CTA (optional)</Label>
                      <Input
                        value={sponsorMessage}
                        onChange={(e) => setSponsorMessage(e.target.value)}
                        placeholder="e.g. Earn rewards for healthy habits"
                        className="bg-white/[0.02] border-white/[0.03] text-white placeholder:text-white/12"
                        style={{ borderRadius: 20 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* ═══ PRIMARY ACTION — premium floating CTA ═══ */}
          <div className="space-y-3 pt-4">
            <Button onClick={handleShare} disabled={sharing} variant="gold"
              className="w-full h-14 text-sm font-semibold gap-2"
              style={{
                borderRadius: 999,
                boxShadow: '0 16px 48px rgba(200,160,60,0.18), 0 0 0 1px rgba(200,160,60,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <Share2 className="w-4 h-4" />{sharing ? 'Rendering & Sharing…' : 'Share Card'}
            </Button>

            {/* Secondary utilities — atmospheric glass row */}
            <div className="grid grid-cols-3 gap-2 p-1.5" style={GLASS.actionBar}>
              <Button onClick={handleDownload} variant="ghost" size="sm"
                className="text-white/25 hover:text-white/50 h-9 text-[10px]" style={{ borderRadius: 20 }}>
                <Download className="w-3 h-3 mr-1" />Save
              </Button>
              <Button onClick={handleCopy} variant="ghost" size="sm"
                className="text-white/25 hover:text-white/50 h-9 text-[10px]" style={{ borderRadius: 20 }}>
                <ClipboardCopy className="w-3 h-3 mr-1" />Copy
              </Button>
              <Button onClick={handleCopyLink} variant="ghost" size="sm"
                className="text-white/25 hover:text-white/50 h-9 text-[10px]" style={{ borderRadius: 20 }}>
                <Link2 className="w-3 h-3 mr-1" />Link
              </Button>
            </div>

            <Button onClick={handleSave} variant="ghost"
              className="w-full text-white/[0.08] hover:text-white/25 h-8 text-[10px]" style={{ borderRadius: 999 }}>
              <Download className="w-3 h-3 mr-1.5" />Save to Vault
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
