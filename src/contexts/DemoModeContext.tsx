import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Ctx = {
  isDemoMode: boolean;
  setDemoMode: (v: boolean) => void;
  toggle: () => void;
};

const DemoModeContext = createContext<Ctx>({
  isDemoMode: false,
  setDemoMode: () => {},
  toggle: () => {},
});

const KEY = 'lifestack.demoMode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, isDemoMode ? '1' : '0');
      document.documentElement.dataset.demoMode = isDemoMode ? 'on' : 'off';
    } catch {}
  }, [isDemoMode]);

  const setDemoMode = useCallback((v: boolean) => setIsDemoMode(v), []);
  const toggle = useCallback(() => setIsDemoMode((v) => !v), []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setDemoMode, toggle }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export const useDemoMode = () => useContext(DemoModeContext);
