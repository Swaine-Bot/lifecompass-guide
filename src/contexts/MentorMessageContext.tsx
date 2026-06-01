import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';

export type MentorMessageCategory = 'onLoad' | 'onMilestone' | 'onIdle' | 'onStruggle';

const POOL: Record<MentorMessageCategory, string[]> = {
  onLoad: [
    "Welcome back. Let's make today count.",
    "Good to see you. Take a breath — you're exactly where you need to be.",
    "A fresh moment. What will you build with it?",
  ],
  onMilestone: [
    "You're building something great. Keep going 🚀",
    "Look how far you've come. Be proud of this.",
    "Progress, not perfection. This is what it looks like.",
    "Another step forward. The path is becoming yours.",
  ],
  onIdle: [
    "Still here? No rush. I'll be right beside you.",
    "Take your time. Clarity often comes in the quiet.",
    "When you're ready, the next small move is enough.",
  ],
  onStruggle: [
    "Hey — slow down. You've got this. Try once more.",
    "Every expert was once a beginner. Breathe and try again.",
    "It's okay. Small adjustment, then forward.",
  ],
};

export interface MentorMessage {
  id: number;
  text: string;
  category: MentorMessageCategory;
}

interface Ctx {
  current: MentorMessage | null;
  show: (category: MentorMessageCategory, customText?: string) => void;
  dismiss: () => void;
}

const MentorMessageContext = createContext<Ctx | null>(null);

function pick(category: MentorMessageCategory) {
  const arr = POOL[category];
  return arr[Math.floor(Math.random() * arr.length)];
}

export function MentorMessageProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<MentorMessage | null>(null);
  const lastShownAt = useRef<number>(0);

  const show = useCallback((category: MentorMessageCategory, customText?: string) => {
    // throttle to avoid stacking
    const now = Date.now();
    if (now - lastShownAt.current < 1500) return;
    lastShownAt.current = now;
    setCurrent({ id: now, text: customText ?? pick(category), category });
  }, []);

  const dismiss = useCallback(() => setCurrent(null), []);

  // Welcome on mount
  useEffect(() => {
    const t = setTimeout(() => show('onLoad'), 900);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <MentorMessageContext.Provider value={{ current, show, dismiss }}>
      {children}
    </MentorMessageContext.Provider>
  );
}

export function useMentorMessage() {
  const ctx = useContext(MentorMessageContext);
  if (!ctx) {
    return {
      current: null,
      show: (_: MentorMessageCategory, __?: string) => {},
      dismiss: () => {},
    } as Ctx;
  }
  return ctx;
}
