import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles, Check, Image, LayoutGrid, Link2, QrCode, ImageIcon, Columns, Layers, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SharePrivacyControls } from '@/components/share/SharePrivacyControls';
import { ShareFormatSelector } from '@/components/share/ShareFormatSelector';
import { ShareThemeSelector } from '@/components/share/ShareThemeSelector';
import { TemplateSelector } from '@/components/share/TemplateSelector';
import { AIInsightControls, type InsightStyle } from '@/components/share/AIInsightControls';
import { TEMPLATE_COMPONENTS, suggestTemplate, type ShareTemplateName } from '@/components/share/templates';
import {
  ShareCardData, PrivacySettings, ShareFormat, ShareTheme,
  DEFAULT_PRIVACY, generateDemoCards, getRandomPhrase, THEMES,
  nativeShare, copyToClipboard, copyImageToClipboard, trackShareEvent, saveShareCard,
  CARD_TYPE_LABELS, getPrivacyLevel, CARD_TYPE_ICONS,
  CardType, ImageLayout, buildShareCaption,
} from '@/services/shareService';
import { getPhilosophyLine, mapLifeDomain } from '@/services/shareLanguageEngine';
import { createShareLink } from '@/services/smartLinkService';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type FlowStep = 'studio' | 'preview' | 'success';

const formatAspect: Record<ShareFormat, string> = {
  story: 'aspect-[9/16]',
  feed: 'aspect-[4/5]',
  square: 'aspect-square',
  linkedin: 'aspect-[4/5]',
  tiktok: 'aspect-[9/16]',
};

export default function ShareStudio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const demoCards = useMemo(() => generateDemoCards(), []);

  const prefill = (location.state as any)?.prefill as ShareCardData | undefined;
  const shareOrigin = (location.state as any)?.origin as string | undefined;
  const hasPrefill = !!prefill;
  const hasMedia = !!(prefill?.imageUrl || (prefill?.imageUrls && prefill.imageUrls.length > 0));

  const [selectedCard, setSelectedCard] = useState<ShareCardData>(prefill || demoCards[0]);
  const [theme, setTheme] = useState<ShareTheme>('obsidian_gold');
  const [format, setFormat] = useState<ShareFormat>('square');
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [phrase, setPhrase] = useState(getRandomPhrase());
  const [sharing, setSharing] = useState(false);
  const [step, setStep] = useState<FlowStep>('studio');
  const [activeTab, setActiveTab] = useState('template');

  // Template
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

  // Saved cards
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const privacyLevel = getPrivacyLevel(privacy);
  const themeObj = THEMES[theme];
  const TemplateComponent = TEMPLATE_COMPONENTS[selectedTemplate];

  /** Render the card DOM node to a high-res PNG blob */
  const renderCardBlob = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const { renderCardToCanvas } = await import('@/services/shareService');
      const canvas = await renderCardToCanvas(cardRef.current, format);
      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0)
      );
    } catch (err) {
      console.error('Card render failed:', err);
      return null;
    }
  }, [format]);

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

  /** Main share action — renders card as image and shares via native share sheet */
  const handleShare = useCallback(async () => {
    if (!user) return;
    setSharing(true);
    try {
      // Generate smart link
      const smartUrl = await generateSmartLink();

      // Build caption with AI insight links
      const caption = buildShareCaption(
        selectedCard, phrase, aiInsight, aiInsightEnabled, smartUrl
      );

      // Render the visual card as a PNG blob
      const blob = await renderCardBlob();

      if (!blob) {
        toast.error('Failed to render card. Try again.');
        setSharing(false);
        return;
      }

      // Try native share with the rendered image
      const shared = await nativeShare(
        caption,
        `LifeStack — ${selectedCard.title}`,
        blob,
        smartUrl ?? undefined
      );

      await trackShareEvent(user.id, selectedCard.cardType, shared ? 'native' : 'clipboard', format, privacyLevel);
      await saveShareCard(user.id, selectedCard, theme, privacyLevel, phrase);

      if (!shared) {
        // Fallback: copy image to clipboard if possible, otherwise copy text
        const imgCopied = await copyImageToClipboard(blob);
        if (imgCopied) {
          toast.success('Card image copied to clipboard!');
        } else {
          const clipText = smartUrl ? `${caption}` : caption;
          await copyToClipboard(clipText);
          toast.success('Caption copied to clipboard');
        }
      }
      setStep('success');
    } catch {
      toast.error('Share failed');
    } finally {
      setSharing(false);
    }
  }, [user, selectedCard, phrase, format, privacyLevel, theme, aiInsight, aiInsightEnabled, renderCardBlob, generateSmartLink]);

  const handleCopy = useCallback(async () => {
    // Copy rendered image to clipboard
    const blob = await renderCardBlob();
    if (blob) {
      const ok = await copyImageToClipboard(blob);
      if (ok) {
        toast.success('Card image copied to clipboard!');
        return;
      }
    }
    // Fallback to text
    const smartUrl = generatedSmartUrl || (await generateSmartLink());
    const caption = buildShareCaption(selectedCard, phrase, aiInsight, aiInsightEnabled, smartUrl);
    const ok = await copyToClipboard(caption);
    if (ok) toast.success('Caption copied to clipboard');
    else toast.error('Copy failed');
  }, [selectedCard, phrase, generatedSmartUrl, generateSmartLink, aiInsight, aiInsightEnabled, renderCardBlob]);

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
    if (!cardRef.current) return;
    try {
      const { renderCardToCanvas, downloadImage } = await import('@/services/shareService');
      const canvas = await renderCardToCanvas(cardRef.current, format);
      await downloadImage(canvas, `lifestack-${selectedCard.cardType}-${Date.now()}.png`);
      toast.success('Image saved');
    } catch {
      toast.error('Download failed');
    }
  }, [format, selectedCard.cardType]);

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

  // ─── Card Preview Component ───
  const CardPreview = ({ className }: { className?: string }) => (
    <div ref={cardRef}
      className={cn('share-card relative select-none', formatAspect[format], className)}
      style={{
        borderRadius: '16px',
        border: '1px solid hsla(0,0%,100%,0.04)',
        boxShadow: '0 0 80px -20px hsla(0,0%,0%,0.4)',
        overflow: 'hidden',
        /* Ensure the container has a fixed aspect-ratio-based height and clips all overflow */
      }}>
      <TemplateComponent
        data={selectedCard}
        theme={themeObj}
        format={format}
        privacy={privacy}
        phrase={phrase}
        userName={privacy.includeName ? 'You' : undefined}
        animate={true}
        aiInsight={aiInsightEnabled ? aiInsight : null}
        includeImage={includePostImage}
        imageLayout={imageLayout}
        showImageCount={showImageCount}
      />
    </div>
  );

  // ─── Success Screen ───
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(var(--success))]/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Shared Successfully</h2>
          <p className="text-sm text-muted-foreground">Your card has been shared as a rendered image.</p>
          {generatedSmartUrl && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Your share link:</p>
              <button onClick={() => { copyToClipboard(generatedSmartUrl); toast.success('Link copied'); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-xs text-foreground hover:bg-secondary transition-colors">
                <Link2 className="w-3 h-3" />{generatedSmartUrl}
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

  // ─── Preview Screen ───
  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setStep('studio')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-serif font-bold">Final Preview</h1>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 py-6 space-y-6 pb-32">
          <CardPreview />

          {/* What will be shared explanation */}
          <div className="rounded-lg border border-border/30 bg-secondary/30 p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">What gets shared</p>
            <p className="text-xs text-foreground">✅ Rendered card image (PNG)</p>
            <p className="text-xs text-muted-foreground">+ Caption text with your insight & link</p>
            {selectedCard.aiInsightLinks?.length ? (
              <p className="text-xs text-muted-foreground">+ AI insight links in caption</p>
            ) : null}
          </div>

          {/* Format chips */}
          <div className="flex gap-2 justify-center flex-wrap">
            {(['square', 'feed', 'story', 'linkedin', 'tiktok'] as ShareFormat[]).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  format === f ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground'
                )}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {includeSmartLink && (
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <Link2 className="w-3 h-3" />Smart link will be generated on share
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            Nothing is posted without your action.
          </p>

          <div className="space-y-2">
            <Button onClick={handleShare} disabled={sharing} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />{sharing ? 'Rendering & Sharing...' : 'Share Card Image'}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1.5" />Save
              </Button>
              <Button onClick={handleCopy} variant="outline" size="sm">
                <ClipboardCopy className="w-4 h-4 mr-1.5" />Copy
              </Button>
              <Button onClick={handleCopyLink} variant="outline" size="sm">
                <Link2 className="w-4 h-4 mr-1.5" />Link
              </Button>
            </div>
            <Button onClick={() => setStep('studio')} variant="ghost" size="sm" className="w-full text-muted-foreground">
              ← Back to Edit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Saved Cards ───
  if (showSaved) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowSaved(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-serif font-bold">My Shared Cards</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {savedCards.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">No cards generated yet</p>
            </div>
          ) : (
            savedCards.map((card) => (
              <Card key={card.id} className="p-4 bg-card/70 border-border/50 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {card.card_type?.replace(/_/g, ' ')} · {card.theme} · {new Date(card.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[9px] px-2 py-0.5 rounded-full font-medium',
                    card.is_shared ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-secondary text-muted-foreground'
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
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-serif font-bold">Share Studio</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadSavedCards} className="text-xs text-muted-foreground">
            <LayoutGrid className="w-4 h-4 mr-1" />My Cards
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-32">
        {/* Card Preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            <CardPreview />
          </div>
        </div>

        {/* Regenerate */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => {
            const domain = mapLifeDomain(selectedCard.domain);
            const newPhilosophy = getPhilosophyLine(domain);
            setSelectedCard(prev => ({ ...prev, philosophy: newPhilosophy }));
            setPhrase(getRandomPhrase());
          }} className="text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3 mr-1.5" />Regenerate language
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={cn("w-full bg-secondary/50", "grid", hasPostImage ? "grid-cols-7" : "grid-cols-6")}>
            <TabsTrigger value="template" className="text-xs">Template</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            {hasPostImage && <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>}
            <TabsTrigger value="privacy" className="text-xs">Privacy</TabsTrigger>
            <TabsTrigger value="format" className="text-xs">Format</TabsTrigger>
            <TabsTrigger value="link" className="text-xs">Link</TabsTrigger>
          </TabsList>

          {/* Template Tab */}
          <TabsContent value="template" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl space-y-4">
              <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />

              {!hasPrefill && (
                <>
                  <div className="border-t border-border/30 pt-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Type</span>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {demoCards.map((card) => (
                        <button key={card.cardType} onClick={() => setSelectedCard(card)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all border',
                            selectedCard.cardType === card.cardType
                              ? 'border-primary bg-primary/10' : 'border-border/30 hover:border-border/60'
                          )}>
                          <span className="text-lg">{CARD_TYPE_ICONS[card.cardType as CardType]}</span>
                          <div>
                            <p className={cn('text-xs font-medium', selectedCard.cardType === card.cardType ? 'text-primary' : 'text-foreground')}>
                              {CARD_TYPE_LABELS[card.cardType as CardType]}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{card.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {hasPrefill && (
                <div className="border-t border-border/30 pt-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary bg-primary/10">
                    <span className="text-lg">{CARD_TYPE_ICONS[selectedCard.cardType as CardType]}</span>
                    <div>
                      <p className="text-xs font-medium text-primary">
                        {CARD_TYPE_LABELS[selectedCard.cardType as CardType]}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{selectedCard.title}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* AI Insight Tab */}
          <TabsContent value="ai" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl">
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
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl space-y-4">
              <ShareThemeSelector theme={theme} onChange={setTheme} />
            </Card>
          </TabsContent>

          {hasPostImage && (
            <TabsContent value="image" className="mt-3">
              <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl space-y-5">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Post Image</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Control how the image appears on your share card.</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />Include post image
                    </Label>
                  </div>
                  <Switch checked={includePostImage} onCheckedChange={setIncludePostImage} />
                </div>
                {includePostImage && (
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Layout</Label>
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
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border/30 text-muted-foreground hover:border-border/60'
                          )}>
                          {opt.icon}
                          <span className="text-[10px] font-medium">{opt.label}</span>
                          <span className="text-[8px] opacity-60">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          <TabsContent value="privacy" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl">
              <SharePrivacyControls privacy={privacy} onChange={setPrivacy} />
            </Card>
          </TabsContent>

          <TabsContent value="format" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl">
              <ShareFormatSelector format={format} onChange={setFormat} />
            </Card>
          </TabsContent>

          <TabsContent value="link" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl space-y-5">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link & Destination</span>
                <p className="text-[10px] text-muted-foreground mt-1">Smart links route viewers to the app or store.</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-primary" />Include smart link
                  </Label>
                </div>
                <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-primary" />Show QR code on card
                  </Label>
                </div>
                <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
              </div>
              {includeSmartLink && (
                <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full">
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {generatedSmartUrl ? 'Copy Share Link' : 'Generate & Copy Link'}
                </Button>
              )}
              {generatedSmartUrl && (
                <p className="text-[10px] text-muted-foreground text-center break-all">{generatedSmartUrl}</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button onClick={() => setStep('preview')} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />Preview & Share
          </Button>
          <Button onClick={handleSave} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />Save to Vault
          </Button>
        </div>
      </div>
    </div>
  );
}
