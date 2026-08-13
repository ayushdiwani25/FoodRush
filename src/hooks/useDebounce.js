import { useState, useEffect } from "react";

/**
 * FE 07: Performance Hook - useDebounce
 * Debounces fast-changing values (e.g. search input keystrokes)
 * to prevent unnecessary recalculations and re-renders.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
