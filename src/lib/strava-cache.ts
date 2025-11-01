/**
 * Persistent cache for Strava data with rate limit protection
 */

import type { StravaStats, StravaActivity } from '@/integrations/strava/client';

interface CachedStravaData {
  stats: StravaStats;
  activities: StravaActivity[];
  timestamp: number;
  lastApiCall: number;
}

const CACHE_KEY = 'strava_data_cache';
const MIN_API_INTERVAL = 15 * 60 * 1000; // 15 minutes - safe interval for Strava rate limits
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours - max age before data is considered stale

export class StravaCache {
  /**
   * Get cached data if it exists and is valid
   */
  static get(): CachedStravaData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CachedStravaData = JSON.parse(cached);
      
      // Check if cache is too old
      const age = Date.now() - data.timestamp;
      if (age > MAX_CACHE_AGE) {
        console.log('Cache expired (>24h), clearing');
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading Strava cache:', error);
      return null;
    }
  }

  /**
   * Save data to cache
   */
  static set(stats: StravaStats, activities: StravaActivity[]): void {
    try {
      const data: CachedStravaData = {
        stats,
        activities,
        timestamp: Date.now(),
        lastApiCall: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      console.log('Strava data cached successfully');
    } catch (error) {
      console.error('Error saving Strava cache:', error);
    }
  }

  /**
   * Update the last API call timestamp without changing the data
   */
  static updateLastApiCall(): void {
    try {
      const cached = this.get();
      if (cached) {
        cached.lastApiCall = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      }
    } catch (error) {
      console.error('Error updating API call timestamp:', error);
    }
  }

  /**
   * Check if enough time has passed since last API call
   */
  static canMakeApiCall(): boolean {
    const cached = this.get();
    if (!cached) return true; // No cache, can make call

    const timeSinceLastCall = Date.now() - cached.lastApiCall;
    const canCall = timeSinceLastCall >= MIN_API_INTERVAL;
    
    if (!canCall) {
      const waitMinutes = Math.ceil((MIN_API_INTERVAL - timeSinceLastCall) / 60000);
      console.log(`Rate limit protection: wait ${waitMinutes} more minutes before next API call`);
    }
    
    return canCall;
  }

  /**
   * Get time until next API call is allowed (in milliseconds)
   */
  static timeUntilNextCall(): number {
    const cached = this.get();
    if (!cached) return 0;

    const timeSinceLastCall = Date.now() - cached.lastApiCall;
    const remaining = MIN_API_INTERVAL - timeSinceLastCall;
    return Math.max(0, remaining);
  }

  /**
   * Get cache age in minutes
   */
  static getCacheAge(): number {
    const cached = this.get();
    if (!cached) return 0;
    return Math.floor((Date.now() - cached.timestamp) / 60000);
  }

  /**
   * Clear the cache
   */
  static clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('Strava cache cleared');
    } catch (error) {
      console.error('Error clearing Strava cache:', error);
    }
  }

  /**
   * Check if cache exists and is fresh enough to use
   */
  static hasFreshCache(): boolean {
    const cached = this.get();
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < MAX_CACHE_AGE;
  }
}
