import { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUniversalShare } from '@/hooks/useUniversalShare';
import { engagementEventService } from '@/services/engagementEventService';

interface GoalDeclarationPromptProps {
  goalTitle: string;
  goalCategory?: string;
  targetDate?: string;
  onDismiss: () => void;
}

export function GoalDeclarationPrompt({ goalTitle, goalCategory, targetDate, onDismiss }: GoalDeclarationPromptProps) {
  const { openShareStudio } = useUniversalShare();

  const handleCreate = () => {
    openShareStudio({
      type: 'goal_created',
      title: goalTitle,
      domain: goalCategory || 'growth',
      subtitle: targetDate ? `Target: ${targetDate}` : undefined,
      statLabel: 'Goal Declared',
    });
    engagementEventService.log('goal_declaration_shared', 'broadcast', { category: goalCategory });
    onDismiss();
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Share your commitment?</p>
        <p className="text-xs text-muted-foreground">Create a Declaration Card for "{goalTitle}"</p>
      </div>
      <Button size="sm" variant="gold" className="gap-1 shrink-0" onClick={handleCreate}>
        <Share2 className="w-3.5 h-3.5" />
        Declare
      </Button>
      <Button size="sm" variant="ghost" className="shrink-0 px-2" onClick={onDismiss}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
