import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Flame, Target, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareCardPreview } from '@/components/viral/ShareCardPreview';
import { MilestonePayload, dismissMilestone } from '@/services/milestoneDetection';
import { engagementEventService } from '@/services/engagementEventService';

interface MilestonePromptModalProps {
  milestone: MilestonePayload;
  open: boolean;
  onClose: () => void;
}

const milestoneIcons: Record<string, typeof Trophy> = {
  streak: Flame,
  level_up: Trophy,
  goal_complete: Target,
};

const subtitlePhrases = [
  'Proof of progress unlocked.',
  'Momentum earned.',
  'Discipline logged.',
  'Chapter complete.',
  'Built, not wished for.',
];

export function MilestonePromptModal({ milestone, open, onClose }: MilestonePromptModalProps) {
  const [showShareFlow, setShowShareFlow] = useState(false);
  const Icon = milestoneIcons[milestone.type] || Trophy;
  const phrase = subtitlePhrases[Math.floor(Math.random() * subtitlePhrases.length)];

  const handleDismiss = () => {
    dismissMilestone(milestone.triggerKey);
    engagementEventService.log('milestone_prompt_dismissed', 'broadcast', {
      type: milestone.type,
      triggerKey: milestone.triggerKey,
    });
    onClose();
  };

  const handleCreateCard = () => {
    dismissMilestone(milestone.triggerKey);
    engagementEventService.log('milestone_prompt_accepted', 'broadcast', {
      type: milestone.type,
      triggerKey: milestone.triggerKey,
    });
    setShowShareFlow(true);
    onClose();
  };

  // Log when shown
  if (open) {
    engagementEventService.log('milestone_prompt_shown', 'broadcast', {
      type: milestone.type,
      triggerKey: milestone.triggerKey,
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-card">
          <DialogHeader className="text-center space-y-4 pt-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/60 font-medium mb-2">
                {milestone.type.replace(/_/g, ' ')}
              </p>
              <DialogTitle className="font-serif text-2xl font-bold leading-tight">
                {milestone.title}
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground italic">{phrase}</p>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <Button variant="gold" className="w-full" onClick={handleCreateCard}>
              <Share2 className="w-4 h-4 mr-2" />
              Create Share Card
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showShareFlow && (
        <ShareCardPreview
          cardType={milestone.shareCardType}
          title={milestone.title}
          subtitle={milestone.subtitle}
          statValue={milestone.value}
          statLabel={milestone.type.replace(/_/g, ' ')}
          sourceType={milestone.sourceType}
          sourceId={milestone.sourceId}
          onClose={() => setShowShareFlow(false)}
        />
      )}
    </>
  );
}
