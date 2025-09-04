import { useState, useCallback } from 'react';
import { ApiResponse, ApiError } from '../services/apiService';

type ApiFunction<T> = () => Promise<ApiResponse<T>>;

export const useApi = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (apiFunction: ApiFunction<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction();
      setData(response.data);
      setLoading(false);
      return response;
    } catch (err) {
      const apiError: ApiError = {
        message: err.message || 'An unknown error occurred',
        status: err.status,
        data: err.data,
      };
      
      setError(apiError);
      setLoading(false);
      throw apiError;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};