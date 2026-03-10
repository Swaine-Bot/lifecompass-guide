import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, Download, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  CARD_TYPE_LABELS,
} from '@/services/shareService';
import { cn } from '@/lib/utils';

export default function ShareStudio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const demoCards = useMemo(() => generateDemoCards(), []);

  const [selectedCard, setSelectedCard] = useState<ShareCardData>(demoCards[0]);
  const [theme, setTheme] = useState<ShareTheme>('executive');
  const [format, setFormat] = useState<ShareFormat>('square');
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [phrase, setPhrase] = useState(getRandomPhrase());
  const [sharing, setSharing] = useState(false);

  const privacyLevel = !privacy.includeName && !privacy.includeExactNumbers ? 'anonymous' : privacy.includeName ? 'public' : 'hide_numbers';

  const handleShare = async () => {
    if (!user) return;
    setSharing(true);
    try {
      const text = `${selectedCard.title}${selectedCard.subtitle ? '\n' + selectedCard.subtitle : ''}\n\n${phrase}\n\nlifestack.app`;
      const shared = await nativeShare(text, `LifeStack — ${selectedCard.title}`);
      
      await trackShareEvent(user.id, selectedCard.cardType, shared ? 'native' : 'clipboard', format, privacyLevel);
      await saveShareCard(user.id, selectedCard, theme, privacyLevel, phrase);
      
      if (!shared) {
        await copyToClipboard(text);
        toast.success('Copied to clipboard & saved to Vault');
      } else {
        toast.success('Shared & saved to Vault');
      }
    } catch {
      toast.error('Share failed');
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    const text = `${selectedCard.title}${selectedCard.subtitle ? '\n' + selectedCard.subtitle : ''}\n\n${phrase}\n\nlifestack.app`;
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Copied to clipboard');
    else toast.error('Copy failed');
  };

  const handleSave = async () => {
    if (!user) return;
    const { error } = await saveShareCard(user.id, selectedCard, theme, privacyLevel, phrase);
    if (error) toast.error('Save failed');
    else toast.success('Saved to Vault');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-serif font-bold">Share Studio</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Card Type Selector */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Card Type</span>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {demoCards.map((card) => (
                <button
                  key={card.cardType}
                  onClick={() => setSelectedCard(card)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                    selectedCard.cardType === card.cardType
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-muted-foreground hover:border-border'
                  )}
                >
                  {CARD_TYPE_LABELS[card.cardType]}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <ShareCardTemplate
              data={selectedCard}
              theme={theme}
              format={format}
              privacy={privacy}
              phrase={phrase}
              userName={privacy.includeName ? 'You' : undefined}
            />
          </div>
        </div>

        {/* Regenerate Phrase */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhrase(getRandomPhrase())}
            className="text-xs text-muted-foreground"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Regenerate phrase
          </Button>
        </div>

        {/* Theme & Format */}
        <Card className="p-4 space-y-4 bg-card/70 border-border/50 backdrop-blur-xl">
          <ShareThemeSelector theme={theme} onChange={setTheme} />
          <ShareFormatSelector format={format} onChange={setFormat} />
        </Card>

        {/* Privacy Controls */}
        <Card className="p-4 bg-card/70 border-border/50 backdrop-blur-xl">
          <SharePrivacyControls privacy={privacy} onChange={setPrivacy} />
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={handleShare} disabled={sharing} className="w-full" variant="default">
            <Share2 className="w-4 h-4 mr-2" />
            {sharing ? 'Sharing...' : 'Share Now'}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleCopy} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </Button>
            <Button onClick={handleSave} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Save to Vault
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
