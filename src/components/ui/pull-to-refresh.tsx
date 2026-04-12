import { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export const PullToRefresh = ({ children, onRefresh, className }: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const controls = useAnimation();

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Check if the touch target is inside a nested scrollable element
    const target = e.target as HTMLElement;
    let el: HTMLElement | null = target;
    while (el && el !== containerRef.current) {
      // If any ancestor (before our container) is independently scrollable, don't intercept
      if (el.scrollHeight > el.clientHeight + 1) {
        return; // Let the nested scrollable handle it
      }
      el = el.parentElement;
    }
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Only prevent default if we're actually pulling (avoid passive listener issues)
      try { e.preventDefault(); } catch { /* passive listener on some Android vendors */ }
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, MAX_PULL);
      setPullDistance(distance);
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }

    setIsPulling(false);
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = progress * 360;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
        style={{
          top: -40,
        }}
        animate={{
          y: pullDistance,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <motion.div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-primary/10 border border-primary/30 backdrop-blur-sm shadow-lg"
          )}
          animate={{
            rotate: isRefreshing ? 360 : rotation,
          }}
          transition={isRefreshing ? {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          } : {
            duration: 0
          }}
        >
          <Star 
            className={cn(
              "w-5 h-5 text-primary",
              isRefreshing && "animate-pulse"
            )} 
            fill={progress >= 1 || isRefreshing ? "currentColor" : "none"}
          />
        </motion.div>
      </motion.div>

      {/* Content with pull effect */}
      <motion.div
        animate={{
          y: pullDistance,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
