import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles, Check, Image, LayoutGrid, Link2, QrCode, ImageIcon, Columns, Layers, ClipboardCopy, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  // Environment tone — drives BOTH studio atmosphere AND card rendering
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
      if (!blob) {
        toast.error('Failed to render share card — please try again');
        return;
      }
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
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lifestack-${platform}-share.png`;
          a.click();
          URL.revokeObjectURL(url);
          await copyToClipboard(caption);
          toast.success('Card saved to downloads. Caption copied for pasting.');
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
      if (ok) {
        toast.success('Card image copied to clipboard!');
        return;
      }
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
    if (url) {
      await copyToClipboard(url);
      toast.success('Share link copied');
    } else {
      toast.error('Could not generate link');
    }
  }, [generatedSmartUrl, generateSmartLink]);

  const handleDownload = useCallback(async () => {
    try {
      const blob = await exportCompositionToBlob(normalizedContent, platform);
      if (!blob) { toast.error('Render failed'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifestack-${platform}-${selectedCard.cardType}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Image saved');
    } catch {
      toast.error('Download failed');
    }
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
      .from('share_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setSavedCards(data || []);
    setShowSaved(true);
  }, [user]);

  // ─── Success Screen ───
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(var(--success))]/10 flex items-center justify-center ring-1 ring-[hsl(var(--success))]/20">
            <Check className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Shared Successfully</h2>
          <p className="text-sm text-foreground/70">Your card has been shared as a rendered image.</p>
          {generatedSmartUrl && (
            <div className="space-y-2">
              <p className="text-xs text-foreground/60">Your share link:</p>
              <button onClick={() => { copyToClipboard(generatedSmartUrl); toast.success('Link copied'); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/60 backdrop-blur-xl border border-white/[0.06] text-xs text-foreground hover:bg-card/80 transition-colors">
                <Link2 className="w-3 h-3 text-primary" />{generatedSmartUrl}
              </button>
            </div>
          )}
          <div className="space-y-2">
            <Button onClick={() => { setStep('studio'); setGeneratedSmartUrl(null); }} className="w-full">Create Another</Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">Done</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Saved Cards ───
  if (showSaved) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowSaved(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-serif font-bold text-foreground">My Shared Cards</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {savedCards.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-10 h-10 text-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-foreground/60">No cards generated yet</p>
            </div>
          ) : (
            savedCards.map((card) => (
              <Card key={card.id} variant="glass" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <p className="text-xs text-foreground/60">
                      {card.card_type?.replace(/_/g, ' ')} · {card.theme} · {new Date(card.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] px-2 py-0.5 rounded-full font-medium',
                    card.is_shared ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-secondary text-foreground/60'
                  )}>
                    {card.is_shared ? 'Shared' : 'Saved'}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // ─── Main Studio ───
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ══ ENVIRONMENT — the source of truth for ALL visuals ══ */}
      <img
        src={cinematicBg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(24px) saturate(1.15) brightness(0.35)', transform: 'scale(1.15)' }}
      />
      {/* Environment atmosphere layers — derived from tone */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: envTone.studioOverlay.primary }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: envTone.studioOverlay.warmBloom }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: envTone.studioOverlay.coolBloom }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: envTone.studioOverlay.vignette }} />

      {/* ═══ Content Layer ═══ */}
      <div className="relative z-10 min-h-screen">
        {/* ═══ HEADER — dissolved into environment ═══ */}
        <div className="sticky top-0 z-40" style={{ background: 'transparent' }}>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white/40 hover:text-white/70 -ml-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${envTone.keyLight.color}, transparent)`,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                  <Sparkles className="w-3.5 h-3.5 text-primary/80" />
                </div>
                <div>
                  <h1 className="text-sm font-serif font-bold text-white/80 leading-tight">Share Studio</h1>
                  <p className="text-[8px] uppercase tracking-[0.16em] text-white/30 font-medium">Compose · Publish</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSavedCards}
              className="text-[10px] gap-1.5 text-white/35 hover:text-white/60 h-7"
            >
              <LayoutGrid className="w-3 h-3" />Cards
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-36">
          {/* ═══ PREVIEW — the artifact exists IN the environment ═══ */}
          <div className="relative flex justify-center py-6">
            {/* Broad atmospheric glow — card emerges from the world */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full"
                style={{
                  background: `radial-gradient(ellipse at 50% 45%, ${envTone.keyLight.color.replace(/[\d.]+\)$/, '0.08)')}, transparent 65%)`,
                  filter: 'blur(60px)',
                }} />
            </div>
            <div className="relative">
              <CompositionCard
                content={normalizedContent}
                platform={platform}
                maxPreviewWidth={Math.min(300, window.innerWidth - 64)}
              />
            </div>
          </div>

          {/* Canvas dimensions — barely there */}
          <p className="text-center text-[7px] text-white/15 uppercase tracking-[0.25em] font-medium -mt-2">
            {PLATFORM_PROFILES[platform].label} · {PLATFORM_PROFILES[platform].width}×{PLATFORM_PROFILES[platform].height}
          </p>

          {/* ═══ REGENERATE — environment-tinted ═══ */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const domain = mapLifeDomain(selectedCard.domain);
                const newPhilosophy = getPhilosophyLine(domain);
                setSelectedCard(prev => ({ ...prev, philosophy: newPhilosophy }));
                setPhrase(getRandomPhrase());
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all text-[10px] font-medium
                text-white/40 hover:text-white/65"
              style={{
                background: `rgba(255,255,255,0.025)`,
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <RefreshCw className="w-3 h-3" />Regenerate language
            </button>
          </div>

          {/* ═══ INSTRUMENT PANEL — subdued, environment-aware ═══ */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="rounded-xl p-1"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
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
            <TabsContent value="template" className="mt-4">
              <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />

                {!hasPrefill && (
                  <div className="border-t border-white/[0.04] pt-5">
                    <span className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.12em]">Card Type</span>
                    <div className="grid grid-cols-2 gap-2.5 mt-3">
                      {demoCards.map((card) => (
                        <button key={card.cardType} onClick={() => setSelectedCard(card)}
                          className={cn(
                            'flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all border',
                            selectedCard.cardType === card.cardType
                              ? 'border-primary/30 bg-primary/8 ring-1 ring-primary/15'
                              : 'border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]'
                          )}>
                          <span className="text-lg">{CARD_TYPE_ICONS[card.cardType as CardType]}</span>
                          <div className="min-w-0">
                            <p className={cn('text-xs font-medium', selectedCard.cardType === card.cardType ? 'text-primary' : 'text-white/75')}>
                              {CARD_TYPE_LABELS[card.cardType as CardType]}
                            </p>
                            <p className="text-[10px] text-white/35 truncate">{card.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasPrefill && (
                  <div className="border-t border-white/[0.04] pt-5">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-primary/30 bg-primary/8 ring-1 ring-primary/15">
                      <span className="text-lg">{CARD_TYPE_ICONS[selectedCard.cardType as CardType]}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-primary">
                          {CARD_TYPE_LABELS[selectedCard.cardType as CardType]}
                        </p>
                        <p className="text-[10px] text-white/35 truncate">{selectedCard.title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Insight Tab */}
            <TabsContent value="ai" className="mt-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
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

            <TabsContent value="style" className="mt-4">
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <ShareThemeSelector theme={theme} onChange={setTheme} />
              </div>
            </TabsContent>

            {hasPostImage && (
              <TabsContent value="image" className="mt-4">
                <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <span className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.12em]">Post Image</span>
                    <p className="text-[10px] text-white/30 mt-1">Control how the image appears on your share card.</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-white/75 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-primary/70" />Include post image
                    </Label>
                    <Switch checked={includePostImage} onCheckedChange={setIncludePostImage} />
                  </div>
                  {includePostImage && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.12em]">Layout</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { value: 'hero_image' as ImageLayout, label: 'Hero', icon: <ImageIcon className="w-4 h-4" />, desc: 'Image dominates' },
                          { value: 'split_image' as ImageLayout, label: 'Split', icon: <Columns className="w-4 h-4" />, desc: '50/50 balance' },
                          { value: 'background_image' as ImageLayout, label: 'Background', icon: <Layers className="w-4 h-4" />, desc: 'Atmospheric' },
                        ]).map((opt) => (
                          <button key={opt.value} onClick={() => setImageLayout(opt.value)}
                            className={cn(
                              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                              imageLayout === opt.value
                                ? 'border-primary/30 bg-primary/8 text-primary ring-1 ring-primary/15'
                                : 'border-white/[0.04] text-white/45 hover:border-white/[0.08] bg-white/[0.02]'
                            )}>
                            {opt.icon}
                            <span className="text-[10px] font-medium">{opt.label}</span>
                            <span className="text-[8px] text-white/30">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            <TabsContent value="privacy" className="mt-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <SharePrivacyControls privacy={privacy} onChange={setPrivacy} />
              </div>
            </TabsContent>

            <TabsContent value="platform" className="mt-4">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <PlatformSelector platform={platform} onChange={setPlatform} />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-4">
              <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <span className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.12em]">Link & Destination</span>
                  <p className="text-[10px] text-white/30 mt-1">Smart links route viewers to the app or store.</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-white/75 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-primary/70" />Include smart link
                  </Label>
                  <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-white/75 flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-primary/70" />Show QR code on card
                  </Label>
                  <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
                </div>
                {includeSmartLink && (
                  <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full border-white/[0.06] text-white/60">
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {generatedSmartUrl ? 'Copy Share Link' : 'Generate & Copy Link'}
                  </Button>
                )}
                {generatedSmartUrl && (
                  <p className="text-[10px] text-white/30 text-center break-all">{generatedSmartUrl}</p>
                )}
              </div>
            </TabsContent>

            {/* Sponsor / Partner Tab */}
            <TabsContent value="sponsor" className="mt-4">
              <div className="rounded-2xl p-5 space-y-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <span className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.12em]">Sponsor / Partner</span>
                  <p className="text-[10px] text-white/30 mt-1">Add a premium partner attribution to this card.</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm font-medium text-white/75 flex items-center gap-2 min-w-0 flex-1">
                    <Handshake className="w-3.5 h-3.5 text-primary/70 shrink-0" />Enable partner zone
                  </Label>
                  <Switch checked={sponsorEnabled} onCheckedChange={setSponsorEnabled} className="shrink-0" />
                </div>
                {sponsorEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/40">Partner name</Label>
                      <Input
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="e.g. Discovery Vitality"
                        className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/40">Attribution type</Label>
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
                              'px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all',
                              sponsorType === opt.value
                                ? 'border-primary/30 bg-primary/8 text-primary'
                                : 'border-white/[0.04] text-white/40 hover:border-white/[0.08]'
                            )}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-white/40">Message / CTA (optional)</Label>
                      <Input
                        value={sponsorMessage}
                        onChange={(e) => setSponsorMessage(e.target.value)}
                        placeholder="e.g. Earn rewards for healthy habits"
                        className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* ═══ PRIMARY ACTION — environment-reactive glow ═══ */}
          <div className="space-y-2 pt-2">
            <Button onClick={handleShare} disabled={sharing} variant="gold"
              className="w-full h-13 text-sm font-semibold gap-2 rounded-xl"
              style={{
                boxShadow: `0 0 40px -10px ${envTone.keyLight.color.replace(/[\d.]+\)$/, '0.25)')}, 0 8px 32px -8px rgba(0,0,0,0.4)`,
              }}
            >
              <Share2 className="w-4 h-4" />{sharing ? 'Rendering & Sharing…' : 'Share Card'}
            </Button>

            {/* Secondary utilities — whisper level */}
            <div className="grid grid-cols-3 gap-1.5">
              <Button onClick={handleDownload} variant="ghost" size="sm"
                className="text-white/30 hover:text-white/55 h-8 text-[10px]">
                <Download className="w-3 h-3 mr-1" />Save
              </Button>
              <Button onClick={handleCopy} variant="ghost" size="sm"
                className="text-white/30 hover:text-white/55 h-8 text-[10px]">
                <ClipboardCopy className="w-3 h-3 mr-1" />Copy
              </Button>
              <Button onClick={handleCopyLink} variant="ghost" size="sm"
                className="text-white/30 hover:text-white/55 h-8 text-[10px]">
                <Link2 className="w-3 h-3 mr-1" />Link
              </Button>
            </div>
            <Button onClick={handleSave} variant="ghost"
              className="w-full text-white/25 hover:text-white/50 h-7 text-[10px]">
              <Download className="w-3 h-3 mr-1.5" />Save to Vault
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
