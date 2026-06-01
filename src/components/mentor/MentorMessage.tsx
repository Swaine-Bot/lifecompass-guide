import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMentorMessage } from '@/contexts/MentorMessageContext';

const DISPLAY_MS = 5200;
const TYPE_SPEED = 24; // ms per character

export function MentorMessage() {
  const { current, dismiss } = useMentorMessage();
  const [typed, setTyped] = useState('');
  const shakeKey = useRef<number>(0);

  // Typewriter
  useEffect(() => {
    if (!current) {
      setTyped('');
      return;
    }
    setTyped('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(current.text.slice(0, i));
      if (i >= current.text.length) clearInterval(interval);
    }, TYPE_SPEED);
    return () => clearInterval(interval);
  }, [current]);

  // Auto-dismiss
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, DISPLAY_MS);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  if (current?.category === 'onStruggle') shakeKey.current++;
  const isStruggle = current?.category === 'onStruggle';

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          role="status"
          aria-live="polite"
          className="fixed pointer-events-auto"
          style={{
            zIndex: 60, // above content, below modals (which are typically 100+)
            right: 'max(env(safe-area-inset-right, 0px), 16px)',
            bottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 6rem)',
            maxWidth: 'min(360px, calc(100vw - 32px))',
          }}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={
            isStruggle
              ? { opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -4, 4, 0] }
              : { opacity: 1, y: 0, scale: 1 }
          }
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl px-4 py-3 pr-9 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)_inset]"
          >
            {/* Floating breathing orb avatar */}
            <motion.div
              className="relative shrink-0 mt-0.5"
              animate={{ y: [0, -3, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.95) 0%, rgba(255,225,170,0.85) 35%, rgba(180,200,255,0.55) 70%, rgba(120,150,220,0) 100%)',
                  boxShadow:
                    '0 0 18px 4px rgba(255,215,150,0.45), 0 0 36px 10px rgba(170,200,255,0.18), inset 0 0 10px rgba(255,255,255,0.6)',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(255,235,190,0.35)' }}
                animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>

            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] leading-snug text-white font-light tracking-wide"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
              >
                {typed}
                {current && typed.length < current.text.length && (
                  <span className="inline-block w-[2px] h-3 ml-0.5 align-middle bg-white/70 animate-pulse" />
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss mentor message"
              className="absolute top-2 right-2 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
