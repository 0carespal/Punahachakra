import { useState, useCallback } from 'react';
import { useStore } from '../context/store';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  showErrorToast = true
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useStore();

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err: any) {
        const errMsg = err.message || 'An error occurred during API request';
        setError(errMsg);
        if (showErrorToast) {
          addToast(errMsg, 'error');
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, addToast, showErrorToast]
  );

  return { data, loading, error, execute };
}
