'use client';

import { useState, useEffect } from 'react';
import { CCTVCamera, CCTVData } from '../lib/cctv-types';

export function useCCTV() {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCCTV() {
      try {
        const response = await fetch('/cctv.json');
        if (!response.ok) throw new Error('Failed to load CCTV data');
        
        const data: CCTVData = await response.json();
        
        // Flatten all districts into single array
        const allCameras: CCTVCamera[] = [];
        for (const district of Object.keys(data)) {
          allCameras.push(...data[district]);
        }
        
        // Filter only active and public cameras
        const activeCameras = allCameras.filter(
          cam => cam.status === 1 && cam.isPublic === 1 && cam.latitude && cam.longitude
        );
        
        setCameras(activeCameras);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CCTV');
      } finally {
        setLoading(false);
      }
    }

    loadCCTV();
  }, []);

  return { cameras, loading, error };
}
