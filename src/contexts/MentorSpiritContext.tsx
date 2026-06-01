import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

export type SpiritTrigger =
  | 'task_complete'
  | 'goal_complete'
  | 'micro_move_complete'
  | 'journal_saved'
  | 'goal_created'
  | 'task_created'
  | 'micro_move_created';

interface SpiritState {
  id: number;
  trigger: SpiritTrigger;
}

interface Ctx {
  active: SpiritState | null;
  summon: (trigger: SpiritTrigger) => void;
  dismiss: () => void;
}

const MentorSpiritContext = createContext<Ctx | null>(null);

export function MentorSpiritProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SpiritState | null>(null);

  const summon = useCallback((trigger: SpiritTrigger) => {
    setActive({ id: Date.now(), trigger });
  }, []);

  const dismiss = useCallback(() => setActive(null), []);

  return (
    <MentorSpiritContext.Provider value={{ active, summon, dismiss }}>
      {children}
    </MentorSpiritContext.Provider>
  );
}

export function useMentorSpirit() {
  const ctx = useContext(MentorSpiritContext);
  // Safe no-op fallback so callers never crash if provider is missing
  if (!ctx) {
    return {
      active: null,
      summon: (_: SpiritTrigger) => {},
      dismiss: () => {},
    } as Ctx;
  }
  return ctx;
}
