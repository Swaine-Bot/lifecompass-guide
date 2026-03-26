import { useState, useEffect } from 'react';
import { onKeyboardChange } from '@/services/nativeKeyboardService';

export function useNativeKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isKeyboardOpen = keyboardHeight > 0;

  useEffect(() => {
    return onKeyboardChange(({ keyboardHeight: h }) => setKeyboardHeight(h));
  }, []);

  return { keyboardHeight, isKeyboardOpen };
}
