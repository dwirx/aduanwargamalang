'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FloodReport } from '../lib/types';

export function useReports() {
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('flood_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('flood_reports_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flood_reports' },
        (payload) => {
          setReports((prev) => [payload.new as FloodReport, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'flood_reports' },
        (payload) => {
          setReports((prev) =>
            prev.map((r) => (r.id === payload.new.id ? (payload.new as FloodReport) : r))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'flood_reports' },
        (payload) => {
          setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
}
