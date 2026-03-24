import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  resolveEnvironment,
  type EnvironmentState,
  type ScreenContext,
  type LifePhase,
} from '@/engines/environmentEngine';
import {
  setFeedbackPreferences,
  registerPulseListener,
  type FeedbackEvent,
} from '@/engines/feedbackEngine';
import type { SoundIntensity } from '@/engines/soundEngine';
import type { SubjectContext } from '@/engines/sensoryContentMap';

interface SensorySettings {
  visualMode: 'static' | 'dynamic';
  soundIntensity: SoundIntensity;
  hapticsEnabled: boolean;
  performanceMode: 'auto' | 'low' | 'high';
}

interface SensoryContextType {
  environment: EnvironmentState;
  setScreen: (screen: ScreenContext) => void;
  setSubjectContext: (ctx: SubjectContext | null) => void;
  settings: SensorySettings;
  updateSettings: (patch: Partial<SensorySettings>) => void;
  activePulse: FeedbackEvent | null;
}

const SensoryContext = createContext<SensoryContextType | undefined>(undefined);

const STORAGE_KEY = 'lifestack_sensory_settings';

const DEFAULT_SETTINGS: SensorySettings = {
  visualMode: 'dynamic',
  soundIntensity: 'off',
  hapticsEnabled: true,
  performanceMode: 'auto',
};

function loadSettings(): SensorySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function shouldUseLowPerf(mode: SensorySettings['performanceMode']): boolean {
  if (mode === 'low') return true;
  if (mode === 'high') return false;
  if (typeof navigator !== 'undefined') {
    const mem = (navigator as any).deviceMemory;
    if (mem && mem < 4) return true;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
  }
  return false;
}

export function SensoryProvider({
  children,
  lifePhase,
}: {
  children: React.ReactNode;
  lifePhase?: LifePhase | null;
}) {
  const [screen, setScreen] = useState<ScreenContext>('home');
  const [subjectCtx, setSubjectContext] = useState<SubjectContext | null>(null);
  const [settings, setSettings] = useState<SensorySettings>(loadSettings);
  const [activePulse, setActivePulse] = useState<FeedbackEvent | null>(null);
  const pulseTimeout = useRef<ReturnType<typeof setTimeout>>();

  const environment = useMemo(
    () => resolveEnvironment(lifePhase, screen, 'unknown', subjectCtx ?? undefined),
    [lifePhase, screen, subjectCtx],
  );

  const effectiveVisualMode = useMemo(() => {
    if (shouldUseLowPerf(settings.performanceMode)) return 'static';
    return settings.visualMode;
  }, [settings.visualMode, settings.performanceMode]);

  useEffect(() => {
    setFeedbackPreferences({
      soundIntensity: settings.soundIntensity,
      hapticsEnabled: settings.hapticsEnabled,
      visualMode: effectiveVisualMode,
    });
  }, [settings.soundIntensity, settings.hapticsEnabled, effectiveVisualMode]);

  useEffect(() => {
    return registerPulseListener((event) => {
      setActivePulse(event);
      clearTimeout(pulseTimeout.current);
      pulseTimeout.current = setTimeout(() => setActivePulse(null), 800);
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<SensorySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = useMemo<SensoryContextType>(
    () => ({
      environment,
      setScreen,
      setSubjectContext,
      settings,
      updateSettings,
      activePulse,
    }),
    [environment, settings, updateSettings, activePulse],
  );

  return <SensoryContext.Provider value={value}>{children}</SensoryContext.Provider>;
}

export function useSensory() {
  const ctx = useContext(SensoryContext);
  if (!ctx) throw new Error('useSensory must be used within SensoryProvider');
  return ctx;
}

/** Register a screen and optionally a subject context */
export function useEnvironment(screen: ScreenContext, subjectContext?: SubjectContext | null) {
  const { setScreen, setSubjectContext, environment } = useSensory();
  useEffect(() => { setScreen(screen); }, [screen, setScreen]);
  useEffect(() => { setSubjectContext(subjectContext ?? null); }, [subjectContext, setSubjectContext]);
  return environment;
}
