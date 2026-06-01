import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';

export type MentorMessageCategory = 'onLoad' | 'onMilestone' | 'onIdle' | 'onStruggle';

const POOL: Record<MentorMessageCategory, string[]> = {
  onLoad: [
    "Your potential is limitless. Let's build something extraordinary.",
    "Every great journey begins with a single step. Yours starts now.",
  ],
  onMilestone: [
    "THIS is what growth looks like. You just leveled up.",
    "That wasn't luck. That was YOU.",
    "Unstoppable. Keep that energy.",
  ],
  onIdle: [
    "Still here. Still believing in you.",
    "The next breakthrough is one action away.",
  ],
  onStruggle: [
    "The hard moments are where legends are made. Push through.",
    "You haven't failed. You're learning at full speed.",
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
