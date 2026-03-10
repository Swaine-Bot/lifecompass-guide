import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { engagementEventService } from '@/services/engagementEventService';

interface InvitePromptProps {
  context: string;
  onDismiss: () => void;
}

export function InvitePrompt({ context, onDismiss }: InvitePromptProps) {
  const { openShareStudio } = useUniversalShare();

  const handleInvite = () => {
    openShareStudio({ type: 'app_invite', title: 'Invite to LifeStack' });
    engagementEventService.log('invite_shared', 'broadcast', { context });
    onDismiss();
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border/50 animate-fade-in">
      <UserPlus className="w-4 h-4 text-primary shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">Know someone who'd benefit from LifeStack?</p>
      <Button size="sm" variant="outline" className="gap-1 shrink-0 text-xs" onClick={handleInvite}>
        Invite
      </Button>
      <Button size="sm" variant="ghost" className="shrink-0 px-1" onClick={onDismiss}>
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}
