import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles, Check, Image, LayoutGrid, Link2, QrCode, ImageIcon, Columns, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShareCardTemplate } from '@/components/share/ShareCardTemplate';
import { SharePrivacyControls } from '@/components/share/SharePrivacyControls';
import { ShareFormatSelector } from '@/components/share/ShareFormatSelector';
import { ShareThemeSelector } from '@/components/share/ShareThemeSelector';
import {
  ShareCardData, PrivacySettings, ShareFormat, ShareTheme,
  DEFAULT_PRIVACY, generateDemoCards, getRandomPhrase,
  nativeShare, copyToClipboard, trackShareEvent, saveShareCard,
  CARD_TYPE_LABELS, getPrivacyLevel, CARD_TYPE_ICONS,
  CardType, ImageLayout,
} from '@/services/shareService';
import { getPhilosophyLine, mapLifeDomain } from '@/services/shareLanguageEngine';
import { createShareLink, buildSmartUrl } from '@/services/smartLinkService';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type FlowStep = 'studio' | 'preview' | 'success';

export default function ShareStudio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  const demoCards = useMemo(() => generateDemoCards(), []);

  const prefill = (location.state as any)?.prefill as ShareCardData | undefined;
  const shareOrigin = (location.state as any)?.origin as string | undefined;

  const [selectedCard, setSelectedCard] = useState<ShareCardData>(prefill || demoCards[0]);
  const [theme, setTheme] = useState<ShareTheme>('obsidian_gold');
  const [format, setFormat] = useState<ShareFormat>('square');
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [phrase, setPhrase] = useState(getRandomPhrase());
  const [sharing, setSharing] = useState(false);
  const [step, setStep] = useState<FlowStep>('studio');
  const [activeTab, setActiveTab] = useState('template');

  // Link & QR settings
  const [includeSmartLink, setIncludeSmartLink] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(
    shareOrigin === 'app_invite' // default ON for invites
  );
  const [generatedSmartUrl, setGeneratedSmartUrl] = useState<string | null>(null);

  // Saved cards
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const privacyLevel = getPrivacyLevel(privacy);

  const renderCardBlob = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const { renderCardToCanvas } = await import('@/services/shareService');
      const canvas = await renderCardToCanvas(cardRef.current, format);
      return await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      );
    } catch {
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

  const handleShare = useCallback(async () => {
    if (!user) return;
    setSharing(true);
    try {
      // Generate smart link
      const smartUrl = await generateSmartLink();

      // Build caption
      const captionParts = [
        `${selectedCard.title}${selectedCard.subtitle ? '\n' + selectedCard.subtitle : ''}`,
        phrase,
      ];
      const text = captionParts.join('\n\n');

      // Render card image
      const blob = await renderCardBlob();

      // Share with image + URL
      const shared = await nativeShare(
        text,
        `LifeStack — ${selectedCard.title}`,
        blob ?? undefined,
        smartUrl ?? undefined
      );

      await trackShareEvent(user.id, selectedCard.cardType, shared ? 'native' : 'clipboard', format, privacyLevel);
      await saveShareCard(user.id, selectedCard, theme, privacyLevel, phrase);

      if (!shared) {
        const clipText = smartUrl ? `${text}\n\n${smartUrl}` : text;
        await copyToClipboard(clipText);
        toast.success('Copied to clipboard & saved');
      }
      setStep('success');
    } catch {
      toast.error('Share failed');
    } finally {
      setSharing(false);
    }
  }, [user, selectedCard, phrase, format, privacyLevel, theme, renderCardBlob, generateSmartLink]);

  const handleCopy = useCallback(async () => {
    const text = `${selectedCard.title}${selectedCard.subtitle ? '\n' + selectedCard.subtitle : ''}\n\n${phrase}`;
    const smartUrl = generatedSmartUrl || (await generateSmartLink());
    const fullText = smartUrl ? `${text}\n\n${smartUrl}` : `${text}\n\nlifestack.app`;
    const ok = await copyToClipboard(fullText);
    if (ok) toast.success('Copied to clipboard');
    else toast.error('Copy failed');
  }, [selectedCard, phrase, generatedSmartUrl, generateSmartLink]);

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

  // ─── Success Screen ───
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[hsl(var(--success))]/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-[hsl(var(--success))]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Shared Successfully</h2>
          <p className="text-sm text-muted-foreground">Your card has been saved and shared. You're in control of what the world sees.</p>
          {generatedSmartUrl && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Your share link:</p>
              <button
                onClick={() => { copyToClipboard(generatedSmartUrl); toast.success('Link copied'); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                <Link2 className="w-3 h-3" />
                {generatedSmartUrl}
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
          <ShareCardTemplate
            ref={cardRef}
            data={selectedCard}
            theme={theme}
            format={format}
            privacy={privacy}
            phrase={phrase}
            userName={privacy.includeName ? 'You' : undefined}
          />

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

          {/* Link info */}
          {includeSmartLink && (
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
              <Link2 className="w-3 h-3" />
              Smart link will be generated and attached on share
            </div>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            Sharing is user-controlled. Nothing is posted without your action.
          </p>

          <div className="space-y-2">
            <Button onClick={handleShare} disabled={sharing} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              {sharing ? 'Sharing...' : 'Share Now'}
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1.5" />Save
              </Button>
              <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1.5" />Copy
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

  // ─── My Saved Cards ───
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
            <ShareCardTemplate
              ref={cardRef}
              data={selectedCard}
              theme={theme}
              format={format}
              privacy={privacy}
              phrase={phrase}
              userName={privacy.includeName ? 'You' : undefined}
            />
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
          <TabsList className="w-full grid grid-cols-5 bg-secondary/50">
            <TabsTrigger value="template" className="text-xs">Template</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs">Privacy</TabsTrigger>
            <TabsTrigger value="format" className="text-xs">Format</TabsTrigger>
            <TabsTrigger value="link" className="text-xs">Link</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Type</span>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {demoCards.map((card) => (
                  <button
                    key={card.cardType}
                    onClick={() => setSelectedCard(card)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all border',
                      selectedCard.cardType === card.cardType
                        ? 'border-primary bg-primary/10'
                        : 'border-border/30 hover:border-border/60'
                    )}
                  >
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
            </Card>
          </TabsContent>

          <TabsContent value="style" className="mt-3">
            <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl space-y-4">
              <ShareThemeSelector theme={theme} onChange={setTheme} />
            </Card>
          </TabsContent>

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
                <p className="text-[10px] text-muted-foreground mt-1">
                  Smart links route viewers to the app or store based on their device.
                </p>
              </div>

              {/* Smart Link toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-primary" />
                    Include smart link
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Attach a shareable URL that opens the app or redirects to the store.
                  </p>
                </div>
                <Switch checked={includeSmartLink} onCheckedChange={setIncludeSmartLink} />
              </div>

              {/* QR Code toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                    Show QR code on card
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Best for screenshots, reposts, and printed formats.
                  </p>
                </div>
                <Switch checked={includeQrCode} onCheckedChange={setIncludeQrCode} />
              </div>

              {/* Copy link button */}
              {includeSmartLink && (
                <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full">
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {generatedSmartUrl ? 'Copy Share Link' : 'Generate & Copy Link'}
                </Button>
              )}

              {generatedSmartUrl && (
                <p className="text-[10px] text-muted-foreground text-center break-all">
                  {generatedSmartUrl}
                </p>
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
