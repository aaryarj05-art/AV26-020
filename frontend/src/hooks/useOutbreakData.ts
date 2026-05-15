import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api/data';

export interface OutbreakRecord {
  id: number;
  date: string;
  region: string;
  disease: string;
  cases: number;
  deaths: number;
  recovered: number;
  population: number;
  week_of_year: number;
  month: number;
  is_monsoon_season: number;
  rolling_7day_avg: number;
  rolling_30day_avg: number;
  last_updated: string;
}

export interface DataStatus {
  record_count: number;
  last_updated: string;
}

export function useOutbreakData(filters: { disease?: string; region?: string } = {}) {
  const [data, setData] = useState<OutbreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DataStatus | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.disease) queryParams.append('disease', filters.disease);
        if (filters.region) queryParams.append('region', filters.region);

        const [dataRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/outbreaks?${queryParams.toString()}`),
          fetch(`${API_BASE_URL}/status`)
        ]);

        if (!dataRes.ok || !statusRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const dataJson = await dataRes.json();
        const statusJson = await statusRes.json();

        setData(dataJson);
        setStatus(statusJson);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.disease, filters.region]);

  return { data, loading, error, status };
}
