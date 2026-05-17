import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE = 'http://localhost:8080';

/**
 * Fetches all unique WHO disease types from the backend.
 * Refetches every 5 minutes (300,000ms).
 */
export function useWHODiseases() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['whoDiseaseTypes'],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE}/api/who/disease-types`);
      return data;
    },
    refetchInterval: 300000, // 5 minutes
  });

  return {
    diseases: data?.diseases || [],
    lastUpdated: data?.lastUpdated || null,
    isLoading,
    error,
  };
}

/**
 * Fetches WHO outbreaks filtered by a specific disease.
 */
export function useWHOOutbreaksByDisease(disease: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['whoOutbreaksByDisease', disease],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BASE}/api/who/outbreaks-by-disease?disease=${encodeURIComponent(disease)}`
      );
      return data;
    },
    enabled: !!disease && disease !== 'All Diseases',
    refetchInterval: 300000,
  });

  return {
    outbreaks: data?.outbreaks || [],
    count: data?.count || 0,
    isLoading,
    error,
  };
}
