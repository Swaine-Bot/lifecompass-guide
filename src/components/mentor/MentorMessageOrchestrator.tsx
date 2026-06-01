import { useEffect } from 'react';
import { useMentorSpirit } from '@/contexts/MentorSpiritContext';
import { useMentorMessage } from '@/contexts/MentorMessageContext';
import { useIdleMentorMessage } from '@/hooks/useIdleMentorMessage';

/**
 * Bridges existing milestone triggers (Spirit) into the MentorMessage toast
 * and registers idle detection. Renders nothing.
 */
export function MentorMessageOrchestrator() {
  const { active } = useMentorSpirit();
  const { show } = useMentorMessage();

  useIdleMentorMessage();

  useEffect(() => {
    if (!active) return;
    show('onMilestone');
  }, [active, show]);

  return null;
}
