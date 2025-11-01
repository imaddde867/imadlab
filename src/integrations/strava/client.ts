// Strava API client - uses Supabase Edge Function as proxy
import { supabase } from '@/integrations/supabase/client';

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  average_speed: number;
  max_speed: number;
}

export interface StravaStats {
  all_run_totals?: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_ride_totals?: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals?: {
    count: number;
    distance: number;
    moving_time: number;
  };
  ytd_ride_totals?: {
    count: number;
    distance: number;
    moving_time: number;
  };
}

interface StravaData {
  stats: StravaStats;
  activities: StravaActivity[];
}

class StravaClient {
  private cache: { data: StravaData; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getData(): Promise<StravaData> {
    // Return cached data if available and fresh
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data;
    }

    const { data, error } = await supabase.functions.invoke('strava-proxy');

    if (error) {
      throw new Error(error.message || 'Failed to fetch Strava data');
    }

    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to fetch Strava data');
    }

    // Cache the response
    this.cache = {
      data: data as StravaData,
      timestamp: Date.now(),
    };

    return data as StravaData;
  }

  async getAthleteStats(): Promise<StravaStats> {
    const data = await this.getData();
    return data.stats;
  }

  async getRecentActivities(): Promise<StravaActivity[]> {
    const data = await this.getData();
    return data.activities;
  }
}

export const stravaClient = new StravaClient();
