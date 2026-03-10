import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  resolveShareLink,
  logShareLinkEvent,
  detectPlatform,
  IOS_APP_STORE_URL,
  ANDROID_PLAY_STORE_URL,
  LIFESTACK_DOMAIN,
  type ResolvedShareLink,
  type DetectedPlatform,
} from '@/services/smartLinkService';

const CARD_TYPE_EMOJI: Record<string, string> = {
  streak: '🔥',
  milestone: '🏆',
  mentor_insight: '🧠',
  progress: '📈',
  weekly_recap: '📅',
  level_up: '⚡',
  feed_post: '📝',
  feed_post_insight: '🧠',
  feed_post_offer: '💎',
  feed_post_suggestions: '💡',
};

export default function SharedContent() {
  const { slug } = useParams<{ slug: string }>();
  const [link, setLink] = useState<ResolvedShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<DetectedPlatform>('desktop');

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);

    if (!slug) { setLoading(false); return; }

    resolveShareLink(slug).then(async (resolved) => {
      setLink(resolved);
      setLoading(false);

      if (resolved) {
        await logShareLinkEvent(resolved.id, 'link_opened', p);
      }
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,5%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(43,74%,52%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,5%)] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-serif font-bold text-[hsl(40,15%,92%)]">Link Unavailable</h1>
          <p className="text-sm text-[hsl(220,10%,50%)]">
            This share link has expired or has been revoked.
          </p>
          <Button
            onClick={() => window.location.href = LIFESTACK_DOMAIN}
            className="bg-[hsl(43,74%,52%)] text-[hsl(220,20%,5%)] hover:bg-[hsl(43,74%,45%)]"
          >
            Go to LifeStack
          </Button>
        </div>
      </div>
    );
  }

  const emoji = CARD_TYPE_EMOJI[link.cardType || ''] || '✨';

  const handleOpenApp = async () => {
    await logShareLinkEvent(link.id, `opened_in_${platform}_app`, platform);
    // Attempt deep link — if app isn't installed, this will fail silently
    // Then redirect to store after a brief delay
    const deepLink = `lifestack://${link.sourceType}/${link.sourceId || ''}`;
    window.location.href = deepLink;

    setTimeout(() => {
      if (platform === 'ios') window.location.href = IOS_APP_STORE_URL;
      else if (platform === 'android') window.location.href = ANDROID_PLAY_STORE_URL;
    }, 1500);
  };

  const handleAppStore = async () => {
    await logShareLinkEvent(link.id, 'redirected_to_app_store', 'ios');
    window.location.href = IOS_APP_STORE_URL;
  };

  const handlePlayStore = async () => {
    await logShareLinkEvent(link.id, 'redirected_to_google_play', 'android');
    window.location.href = ANDROID_PLAY_STORE_URL;
  };

  return (
    <div className="min-h-screen bg-[hsl(220,20%,5%)] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Hero card area */}
        <div className="rounded-2xl border border-[hsl(220,15%,15%)] bg-gradient-to-br from-[hsl(220,18%,8%)] to-[hsl(225,20%,11%)] p-8 text-center space-y-4">
          <span className="text-4xl">{emoji}</span>
          <h1 className="text-2xl font-serif font-bold text-[hsl(40,15%,92%)]">
            {link.title || 'Shared from LifeStack'}
          </h1>
          {link.subtitle && link.visibilityMode === 'public' && (
            <p className="text-sm text-[hsl(220,10%,50%)] leading-relaxed">
              {link.subtitle}
            </p>
          )}
          {link.visibilityMode !== 'public' && (
            <p className="text-sm text-[hsl(220,10%,40%)] italic">
              Open in the LifeStack app to view the full content.
            </p>
          )}
          <div className="inline-block px-3 py-1 rounded-full border border-[hsl(220,15%,22%)] bg-[hsl(220,15%,14%)]">
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[hsl(43,74%,52%)]">
              {link.cardType?.replace(/_/g, ' ') || 'LifeStack'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-serif font-bold text-[hsl(40,15%,92%)]">
            Design your life with intention.
          </h2>
          <p className="text-sm text-[hsl(220,10%,50%)] leading-relaxed">
            LifeStack is your life companion and AI mentor for goals, habits, reflection, and long-term progress.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {(platform === 'ios' || platform === 'android') && (
            <Button
              onClick={handleOpenApp}
              className="w-full bg-[hsl(43,74%,52%)] text-[hsl(220,20%,5%)] hover:bg-[hsl(43,74%,45%)] font-semibold"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open in App
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleAppStore}
              variant="outline"
              className="border-[hsl(220,15%,22%)] text-[hsl(40,15%,92%)] hover:bg-[hsl(220,15%,14%)]"
            >
              <Download className="w-4 h-4 mr-1.5" />
              App Store
            </Button>
            <Button
              onClick={handlePlayStore}
              variant="outline"
              className="border-[hsl(220,15%,22%)] text-[hsl(40,15%,92%)] hover:bg-[hsl(220,15%,14%)]"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Google Play
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[hsl(220,10%,30%)] tracking-wide uppercase">
          LifeStack — Your Life, Designed
        </p>
      </div>
    </div>
  );
}
