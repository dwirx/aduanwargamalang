'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../lib/supabase';

export function useConfirmation() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = async (reportId: string): Promise<boolean> => {
    if (!user) return false;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from('report_confirmations')
      .select('id')
      .eq('report_id', reportId)
      .eq('user_id', user.id)
      .gte('confirmed_at', oneHourAgo)
      .limit(1);

    return !data || data.length === 0;
  };

  const confirmReport = async (reportId: string): Promise<boolean> => {
    if (!user) {
      setError('Anda harus login untuk mengkonfirmasi laporan');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user can confirm
      const allowed = await canConfirm(reportId);
      if (!allowed) {
        setError('Anda sudah mengkonfirmasi laporan ini dalam 1 jam terakhir');
        return false;
      }

      // Insert confirmation
      const { error: insertError } = await supabase
        .from('report_confirmations')
        .insert({ report_id: reportId, user_id: user.id });

      if (insertError) throw insertError;

      // Update report
      const newExpiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
      
      const { error: updateError } = await supabase
        .from('flood_reports')
        .update({
          confirmation_count: supabase.rpc('increment_confirmation', { row_id: reportId }),
          last_confirmed_at: new Date().toISOString(),
          expires_at: newExpiresAt
        })
        .eq('id', reportId);

      if (updateError) {
        // Fallback: increment manually
        const { data: report } = await supabase
          .from('flood_reports')
          .select('confirmation_count')
          .eq('id', reportId)
          .single();

        if (report) {
          await supabase
            .from('flood_reports')
            .update({
              confirmation_count: report.confirmation_count + 1,
              last_confirmed_at: new Date().toISOString(),
              expires_at: newExpiresAt
            })
            .eq('id', reportId);
        }
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengkonfirmasi laporan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { confirmReport, canConfirm, loading, error };
}
