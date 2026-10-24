import { useState, useEffect, useRef } from 'react';

/**
 * useDebounce Custom Hook (A1 Q5 Requirement 3)
 * Debounces a value with a configurable delay (default: 400ms)
 * Uses a ref to store the timer ID across renders
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear previous timer if value changes within delay period
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on unmount or when value/delay changes (A1 Q4/Q5 Requirement 8)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
