import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMentorSpirit, SpiritTrigger } from '@/contexts/MentorSpiritContext';

const MESSAGES: Record<SpiritTrigger, string[]> = {
  task_complete: [
    'THIS is what growth looks like. You just leveled up.',
    "That wasn't luck. That was YOU.",
    'Unstoppable. Keep that energy.',
  ],
  goal_complete: [
    'THIS is what growth looks like. You just leveled up.',
    "That wasn't luck. That was YOU.",
  ],
  micro_move_complete: [
    'Unstoppable. Keep that energy.',
    "That wasn't luck. That was YOU.",
  ],
  journal_saved: [
    'Your potential is limitless. Let’s build something extraordinary.',
    'Every great journey begins with a single step. Yours starts now.',
  ],
  goal_created: [
    'Every great journey begins with a single step. Yours starts now.',
    'Your potential is limitless. Let’s build something extraordinary.',
  ],
  task_created: [
    'The next breakthrough is one action away.',
    'Every great journey begins with a single step. Yours starts now.',
  ],
  micro_move_created: [
    'The next breakthrough is one action away.',
    'Still here. Still believing in you.',
  ],
};

function pickMessage(trigger: SpiritTrigger, seed: number) {
  const arr = MESSAGES[trigger] ?? ['Breathe. You are exactly where you need to be.'];
  return arr[seed % arr.length];
}

export function MentorSpirit() {
  const { active, dismiss } = useMentorSpirit();

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(dismiss, 3800);
    return () => clearTimeout(t);
  }, [active, dismiss]);

  const message = useMemo(
    () => (active ? pickMessage(active.trigger, active.id) : ''),
    [active]
  );

  // 8 orbiting particle wisps
  const wisps = useMemo(
    () => Array.from({ length: 8 }, (_, i) => i),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={active.id}
          className="fixed inset-0 flex flex-col items-center justify-center pointer-events-auto"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onClick={dismiss}
          aria-live="polite"
          role="status"
        >
          {/* Soft backdrop wash */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255, 240, 200, 0.10), rgba(180, 200, 255, 0.04) 35%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />

          {/* Spirit core */}
          <div className="relative flex flex-col items-center" style={{ pointerEvents: 'none' }}>
            {/* Pulse rings */}
            {[0, 0.6, 1.2].map((delay, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 160,
                  height: 160,
                  border: '1px solid rgba(255, 235, 190, 0.35)',
                  top: '50%',
                  left: '50%',
                  marginTop: -80,
                  marginLeft: -80,
                }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 2.4], opacity: [0.55, 0] }}
                transition={{
                  duration: 2.4,
                  delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Orb */}
            <motion.div
              className="relative rounded-full"
              style={{
                width: 140,
                height: 140,
                background:
                  'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(255, 232, 178, 0.85) 30%, rgba(190, 210, 255, 0.55) 60%, rgba(120, 150, 220, 0.0) 80%)',
                boxShadow:
                  '0 0 60px 20px rgba(255, 220, 160, 0.45), 0 0 120px 40px rgba(170, 200, 255, 0.25), inset 0 0 40px rgba(255,255,255,0.6)',
                filter: 'blur(0.3px)',
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.85, 1, 0.95, 1],
                opacity: 1,
              }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{
                duration: 3.5,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
              }}
            >
              {/* Inner ethereal face / silhouette hint */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  style={{
                    width: 50,
                    height: 70,
                    borderRadius: '50% 50% 45% 45% / 60% 60% 40% 40%',
                    background:
                      'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.55), rgba(255,240,200,0.15) 60%, transparent 80%)',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Orbiting wisps */}
            {wisps.map((i) => {
              const angle = (i / wisps.length) * Math.PI * 2;
              const radius = 90;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    top: '50%',
                    left: '50%',
                    background: 'rgba(255, 240, 210, 0.9)',
                    boxShadow: '0 0 12px 3px rgba(255, 230, 180, 0.7)',
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: [
                      Math.cos(angle) * radius,
                      Math.cos(angle + Math.PI) * radius,
                      Math.cos(angle + Math.PI * 2) * radius,
                    ],
                    y: [
                      Math.sin(angle) * radius,
                      Math.sin(angle + Math.PI) * radius,
                      Math.sin(angle + Math.PI * 2) * radius,
                    ],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.15,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              );
            })}

            {/* Message */}
            <motion.p
              className="relative mt-32 max-w-xs text-center text-white text-base font-light tracking-wide px-6"
              style={{
                textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0 30px rgba(255,220,160,0.3)',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
