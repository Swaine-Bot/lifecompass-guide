import { useEffect } from 'react';
import { useMentorMessage } from '@/contexts/MentorMessageContext';

const IDLE_MS = 15_000;

/** Triggers a gentle mentor check-in after 15s of inactivity. */
export function useIdleMentorMessage() {
  const { show } = useMentorMessage();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => show('onIdle'), IDLE_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      'pointerdown',
      'keydown',
      'scroll',
      'touchstart',
      'wheel',
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [show]);
}
