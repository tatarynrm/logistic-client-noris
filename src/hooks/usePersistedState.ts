import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    setMounted(true);
  }, [key]);

  const setValue = (value: T) => {
    try {
      setState(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [mounted ? state : defaultValue, setValue];
}
