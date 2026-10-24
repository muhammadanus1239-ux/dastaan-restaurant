import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../api/client';

/**
 * useApi Custom Hook (A2 Q6 Requirement 5)
 * Manages data, loading, and error states for any API call, and gives you a refetch function.
 *
 * @param {string} endpoint - API endpoint to fetch (e.g., '/api/menu')
 * @param {object} options - Fetch options or query configurations
 * @param {boolean} autoFetch - Whether to automatically fetch on mount or parameter change
 */
export const useApi = (endpoint, options = {}, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  // Store options in a ref to avoid infinite re-render loops when callers pass inline objects
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(async (customEndpoint = null, customOptions = {}) => {
    setLoading(true);
    setError(null);
    try {
      const targetEndpoint = customEndpoint || endpoint;
      const mergedOptions = { ...optionsRef.current, ...customOptions };
      const response = await apiRequest(targetEndpoint, mergedOptions);
      setData(response);
      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred while connecting to the server';
      setError(errorMsg);
      return { success: false, error: errorMsg, status: err.status };
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Refetch helper
  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    let isMounted = true;

    if (autoFetch && endpoint) {
      execute().then(res => {
        if (!isMounted) return;
      });
    }

    return () => {
      isMounted = false;
    };
  }, [endpoint, autoFetch, execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
    setData
  };
};

export default useApi;
