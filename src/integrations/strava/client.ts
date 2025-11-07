// Strava API client - uses Supabase Edge Function as proxy
import { supabase } from '@/integrations/supabase/client';
import { StravaCache } from '@/lib/strava-cache';

export interface StravaPhoto {
  id: number;
  unique_id: string;
  urls: {
    '100': string;
    '600': string;
  };
  source: number;
  caption?: string;
}

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
  kudos_count?: number;
  achievement_count?: number;
  total_photo_count?: number;
  map?: {
    id: string;
    summary_polyline: string;
    resource_state: number;
  };
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  photos?: {
    primary?: StravaPhoto;
    count: number;
  };
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
  private memoryCache: { data: StravaData; timestamp: number } | null = null;
  private readonly MEMORY_CACHE_DURATION = 60 * 1000; // 1 minute in-memory cache for same session

  async getData(): Promise<StravaData> {
    // Check in-memory cache first (for rapid repeated calls in same session)
    if (this.memoryCache && Date.now() - this.memoryCache.timestamp < this.MEMORY_CACHE_DURATION) {
      console.log('Using in-memory cache');
      return this.memoryCache.data;
    }

    // Check if we can make an API call (respects rate limits)
    const canCallApi = StravaCache.canMakeApiCall();
    const cachedData = StravaCache.get();

    // If we have cached data and can't call API yet, use cache
    if (cachedData && !canCallApi) {
      const minutesRemaining = Math.ceil(StravaCache.timeUntilNextCall() / 60000);
      console.log(
        `Using cached data (rate limit protection: ${minutesRemaining}m until next call allowed)`
      );

      const data: StravaData = {
        stats: cachedData.stats,
        activities: cachedData.activities,
      };
      this.memoryCache = { data, timestamp: Date.now() };
      return data;
    }

    // Try to fetch fresh data from API
    try {
      console.log('Fetching fresh data from Strava API');
      const response = await supabase.functions.invoke('strava-proxy');

      if (response.error) {
        console.error('Strava Edge Function error:', {
          message: response.error.message,
          status: response.error.status,
          context: response.error.context,
        });

        const errorMsg = response.error.message || 'Edge Function returned a non-2xx status code';

        // If rate limited and we have cached data, use it
        if (errorMsg.includes('429') && cachedData) {
          console.log('Rate limited but cached data available, using cache');
          StravaCache.updateLastApiCall(); // Update timestamp to prevent rapid retries

          const data: StravaData = {
            stats: cachedData.stats,
            activities: cachedData.activities,
          };
          this.memoryCache = { data, timestamp: Date.now() };
          return data;
        }

        // No cached data available, throw error with helpful message
        if (errorMsg.includes('429')) {
          throw new Error('Strava API rate limit exceeded. Please try again in 15 minutes.');
        }

        if (errorMsg.includes('401') || errorMsg.includes('refresh')) {
          throw new Error('Strava authentication failed. Please check your API credentials.');
        }

        throw new Error(`Failed to fetch Strava data: ${errorMsg}`);
      }

      if (!response.data) {
        // If no data but we have cache, use it
        if (cachedData) {
          console.log('Empty response but cached data available, using cache');
          const data: StravaData = {
            stats: cachedData.stats,
            activities: cachedData.activities,
          };
          this.memoryCache = { data, timestamp: Date.now() };
          return data;
        }
        throw new Error('Empty response from Strava API');
      }

      const { stats, activities } = response.data;

      if (!stats) {
        console.error('Missing stats in response:', response.data);
        throw new Error('Invalid response: missing stats');
      }

      if (!activities || !Array.isArray(activities)) {
        console.error('Invalid activities in response:', activities);
        throw new Error('Invalid response: missing or invalid activities');
      }

      const data: StravaData = { stats, activities };

      // Save to persistent cache
      StravaCache.set(stats, activities);

      // Save to memory cache
      this.memoryCache = { data, timestamp: Date.now() };

      console.log('Fresh data fetched and cached successfully');
      return data;
    } catch (err) {
      // If API call failed but we have cached data, use it as fallback
      if (cachedData) {
        console.warn('API call failed but cached data available, using cache:', err);
        const data: StravaData = {
          stats: cachedData.stats,
          activities: cachedData.activities,
        };
        this.memoryCache = { data, timestamp: Date.now() };
        return data;
      }

      // No cached data, propagate error
      console.error('Strava client error:', err);
      throw err;
    }
  }

  async getAthleteStats(): Promise<StravaStats> {
    return (await this.getData()).stats;
  }

  async getRecentActivities(count: number = 10): Promise<StravaActivity[]> {
    const activities = (await this.getData()).activities;
    return activities.slice(0, count);
  }
}

export const stravaClient = new StravaClient();
