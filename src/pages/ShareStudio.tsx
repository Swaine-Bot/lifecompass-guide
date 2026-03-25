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

type FlowStep = 'studio' | 'success';

/** Map ShareTemplateName to BentoBaseVariant strategy */
function templateToStrategy(template: ShareTemplateName): BentoBaseVariant {
  switch (template) {
    case 'bento_hero': case 'story': case 'media_spotlight': return 'hero';
    case 'bento_split': case 'classic': case 'momentum': return 'split';
    case 'bento_reflection': case 'reflection': return 'reflection';
    case 'bento_minimal': case 'minimal': return 'minimal';
    default: return 'hero';
  }
}

/** Map ImageLayout to ImageTreatment string */
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

  // Template / Strategy
  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplateName>(
    suggestTemplate(shareOrigin, hasMedia)
  );

  // AI Insight
  const [aiInsightEnabled, setAiInsightEnabled] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightStyle, setInsightStyle] = useState<InsightStyle>('reflective');

  // Link & QR
  const [includeSmartLink, setIncludeSmartLink] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(shareOrigin === 'app_invite');
  const [generatedSmartUrl, setGeneratedSmartUrl] = useState<string | null>(null);

  // Image settings
  const hasPostImage = !!(selectedCard.imageUrl || (selectedCard.imageUrls && selectedCard.imageUrls.length > 0));
  const [includePostImage, setIncludePostImage] = useState(true);
  const [imageLayout, setImageLayout] = useState<ImageLayout>(selectedCard.imageLayout || 'hero_image');
  const [showImageCount, setShowImageCount] = useState(true);

  // Sponsor / Partner
  const [sponsorEnabled, setSponsorEnabled] = useState(!!prefill?.sponsor);
  const [sponsorName, setSponsorName] = useState(prefill?.sponsor?.name || '');
  const [sponsorMessage, setSponsorMessage] = useState(prefill?.sponsor?.message || '');
  const [sponsorType, setSponsorType] = useState<'sponsored' | 'powered' | 'partnership' | 'rewards' | 'productivity'>(
    prefill?.sponsor?.attributionType || 'sponsored'
  );

  // Saved cards
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const privacyLevel = getPrivacyLevel(privacy);
  const themeObj = THEMES[theme];
  const strategy = templateToStrategy(selectedTemplate);

  // Build sponsor data object
  const sponsorData = useMemo(() => {
    if (!sponsorEnabled || !sponsorName.trim()) return undefined;
    return { name: sponsorName.trim(), message: sponsorMessage.trim() || undefined, attributionType: sponsorType };
  }, [sponsorEnabled, sponsorName, sponsorMessage, sponsorType]);

  // Merge sponsor into card data
  const cardWithSponsor = useMemo(() => ({ ...selectedCard, sponsor: sponsorData }), [selectedCard, sponsorData]);

  // ── Normalized content (single source of truth) ──
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

  /** Main share — renders via deterministic canvas, then IMAGE-ONLY native share */
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
          <p className="text-sm text-foreground/60">Your card has been shared as a rendered image.</p>
          {generatedSmartUrl && (
            <div className="space-y-2">
              <p className="text-xs text-foreground/50">Your share link:</p>
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
              <Image className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-foreground/50">No cards generated yet</p>
            </div>
          ) : (
            savedCards.map((card) => (
              <Card key={card.id} variant="glass" className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <p className="text-xs text-foreground/50">
                      {card.card_type?.replace(/_/g, ' ')} · {card.theme} · {new Date(card.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] px-2 py-0.5 rounded-full font-medium',
                    card.is_shared ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-secondary text-foreground/50'
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
    <div className="min-h-screen bg-background">
      {/* ═══ PREMIUM HEADER ═══ */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-foreground/60 hover:text-foreground">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="icon-orb-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground leading-tight">Share Studio</h1>
                <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/50 font-medium">Compose & publish</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadSavedCards} className="text-xs gap-1.5 border-white/[0.08] bg-card/40 hover:bg-card/60">
            <LayoutGrid className="w-3.5 h-3.5" />My Cards
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-32">
        {/* ═══ PREVIEW CANVAS ═══ */}
        <div className="relative">
          {/* Ambient glow behind card */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="w-64 h-64 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, hsl(43 74% 52%), transparent 70%)' }} />
          </div>
          <div className="relative flex justify-center py-4">
            <CompositionCard
              content={normalizedContent}
              platform={platform}
              maxPreviewWidth={Math.min(320, window.innerWidth - 48)}
            />
          </div>
        </div>

        {/* ═══ REGENERATE ACTION ═══ */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const domain = mapLifeDomain(selectedCard.domain);
              const newPhilosophy = getPhilosophyLine(domain);
              setSelectedCard(prev => ({ ...prev, philosophy: newPhilosophy }));
              setPhrase(getRandomPhrase());
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-card/40 backdrop-blur-sm text-xs text-foreground/70 hover:text-foreground hover:border-white/[0.12] transition-all"
          >
            <RefreshCw className="w-3 h-3" />Regenerate language
          </button>
        </div>

        {/* ═══ CONTROL TABS ═══ */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="rounded-xl border border-white/[0.06] bg-card/50 backdrop-blur-xl p-1">
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
          <TabsContent value="template" className="mt-3">
            <Card variant="glass" className="p-5 space-y-5">
              <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />

              {!hasPrefill && (
                <div className="border-t border-white/[0.06] pt-4">
                  <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Card Type</span>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {demoCards.map((card) => (
                      <button key={card.cardType} onClick={() => setSelectedCard(card)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border',
                          selectedCard.cardType === card.cardType
                            ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/20' : 'border-white/[0.06] hover:border-white/[0.12] bg-card/30'
                        )}>
                        <span className="text-lg">{CARD_TYPE_ICONS[card.cardType as CardType]}</span>
                        <div className="min-w-0">
                          <p className={cn('text-xs font-medium', selectedCard.cardType === card.cardType ? 'text-primary' : 'text-foreground')}>
                            {CARD_TYPE_LABELS[card.cardType as CardType]}
                          </p>
                          <p className="text-[10px] text-foreground/40 truncate">{card.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasPrefill && (
                <div className="border-t border-white/[0.06] pt-4">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-primary/40 bg-primary/10 ring-1 ring-primary/20">
                    <span className="text-lg">{CARD_TYPE_ICONS[selectedCard.cardType as CardType]}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary">
                        {CARD_TYPE_LABELS[selectedCard.cardType as CardType]}
                      </p>
                      <p className="text-[10px] text-foreground/40 truncate">{selectedCard.title}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* AI Insight Tab */}
          <TabsContent value="ai" className="mt-3">
            <Card variant="glass" className="p-5">
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
            </Card>
          </TabsContent>

          <TabsContent value="style" className="mt-3">
            <Card variant="glass" className="p-5 space-y-4">
              <ShareThemeSelector theme={theme} onChange={setTheme} />
            </Card>
          </TabsContent>

          {hasPostImage && (
            <TabsContent value="image" className="mt-3">
              <Card variant="glass" className="p-5 space-y-5">
                <div>
                  <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Post Image</span>
                  <p className="text-[10px] text-foreground/40 mt-1">Control how the image appears on your share card.</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />Include post image
                  </Label>
                  <Switch checked={includePostImage} onCheckedChange={setIncludePostImage} />
                </div>
                {includePostImage && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Layout</Label>
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
                              ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/20'
                              : 'border-white/[0.06] text-foreground/60 hover:border-white/[0.12] bg-card/30'
                          )}>
                          {opt.icon}
                          <span className="text-[10px] font-medium">{opt.label}</span>
                          <span className="text-[8px] text-foreground/40">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          <TabsContent value="privacy" className="mt-3">
            <Card variant="glass" className="p-5">
              <SharePrivacyControls privacy={privacy} onChange={setPrivacy} />
            </Card>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="mt-3">
            <Card variant="glass" className="p-5">
              <PlatformSelector platform={platform} onChange={setPlatform} />
            </Card>
          </TabsContent>

          <TabsContent value="link" className="mt-3">
            <Card variant="glass" className="p-5 space-y-5">
              <div>
                <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Link & Destination</span>
                <p className="text-[10px] text-foreground/40 mt-1">Smart links route viewers to the app or store.</p>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-primary" />Include smart link
                </Label>
                <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-primary" />Show QR code on card
                </Label>
                <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
              </div>
              {includeSmartLink && (
                <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full">
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {generatedSmartUrl ? 'Copy Share Link' : 'Generate & Copy Link'}
                </Button>
              )}
              {generatedSmartUrl && (
                <p className="text-[10px] text-foreground/40 text-center break-all">{generatedSmartUrl}</p>
              )}
            </Card>
          </TabsContent>

          {/* Sponsor / Partner Tab */}
          <TabsContent value="sponsor" className="mt-3">
            <Card variant="glass" className="p-5 space-y-5">
              <div>
                <span className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.1em]">Sponsor / Partner</span>
                <p className="text-[10px] text-foreground/40 mt-1">Add a premium partner attribution to this card.</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2 min-w-0 flex-1">
                  <Handshake className="w-3.5 h-3.5 text-primary shrink-0" />Enable partner zone
                </Label>
                <Switch checked={sponsorEnabled} onCheckedChange={setSponsorEnabled} className="shrink-0" />
              </div>
              {sponsorEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground/50">Partner name</Label>
                    <Input
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="e.g. Discovery Vitality"
                      className="bg-card/40 border-white/[0.08]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground/50">Attribution type</Label>
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
                              ? 'border-primary/40 bg-primary/10 text-primary'
                              : 'border-white/[0.06] text-foreground/50 hover:border-white/[0.12]'
                          )}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-foreground/50">Message / CTA (optional)</Label>
                    <Input
                      value={sponsorMessage}
                      onChange={(e) => setSponsorMessage(e.target.value)}
                      placeholder="e.g. Earn rewards for healthy habits"
                      className="bg-card/40 border-white/[0.08]"
                    />
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* ═══ ACTIONS ═══ */}
        <div className="space-y-2.5 pt-2">
          <Button onClick={handleShare} disabled={sharing} className="w-full h-11 text-sm font-semibold gap-2">
            <Share2 className="w-4 h-4" />{sharing ? 'Rendering & Sharing…' : 'Share'}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm" className="border-white/[0.08] bg-card/30 hover:bg-card/50">
              <Download className="w-3.5 h-3.5 mr-1.5" />Save
            </Button>
            <Button onClick={handleCopy} variant="outline" size="sm" className="border-white/[0.08] bg-card/30 hover:bg-card/50">
              <ClipboardCopy className="w-3.5 h-3.5 mr-1.5" />Copy
            </Button>
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="border-white/[0.08] bg-card/30 hover:bg-card/50">
              <Link2 className="w-3.5 h-3.5 mr-1.5" />Link
            </Button>
          </div>
          <Button onClick={handleSave} variant="outline" className="w-full border-white/[0.08] bg-card/30 hover:bg-card/50">
            <Download className="w-4 h-4 mr-2" />Save to Vault
          </Button>
        </div>
      </div>
    </div>
  );
}
