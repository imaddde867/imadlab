import { useEffect, useState, useCallback } from 'react';
import Seo from '@/components/Seo';
import SectionHeader from '@/components/SectionHeader';
import RunningStatsGrid from '@/components/running/RunningStatsGrid';
import YearInMotion from '@/components/running/YearInMotion';
import RecentActivitiesTimeline from '@/components/running/RecentActivitiesTimeline';
import RunningPageSkeleton from '@/components/running/RunningPageSkeleton';
import { stravaClient, type StravaStats, type StravaActivity } from '@/integrations/strava/client';
import { StravaCache } from '@/lib/strava-cache';
import { Clock } from 'lucide-react';

const Extras = () => {
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number>(0);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const hadCacheBeforeFetch = StravaCache.hasFreshCache();
      const cacheAgeBeforeFetch = StravaCache.getCacheAge();
      
      const [statsData, activitiesData] = await Promise.all([
        stravaClient.getAthleteStats(),
        stravaClient.getRecentActivities(),
      ]);
      
      setStats(statsData);
      setActivities(activitiesData);
      
      // Check if we're using cached data
      const cacheAgeAfterFetch = StravaCache.getCacheAge();
      const usedCache = hadCacheBeforeFetch && cacheAgeBeforeFetch === cacheAgeAfterFetch;
      setIsUsingCache(usedCache);
      setCacheAge(cacheAgeAfterFetch);
      
    } catch (err) {
      // Even if there's an error, try to load from cache
      const cachedData = StravaCache.get();
      if (cachedData) {
        setStats(cachedData.stats);
        setActivities(cachedData.activities);
        setIsUsingCache(true);
        setCacheAge(StravaCache.getCacheAge());
        setError(null); // Clear error since we have cached data
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load Strava data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(1200px circle at 50% 10%, rgba(255,255,255,0.05), transparent 60%)',
        }}
      />
      
      <Seo
        title="Running Journey"
        description="Follow my running journey - every mile, every achievement, every step forward"
        keywords="strava, running, fitness, marathon, athletics, training"
        type="website"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        <SectionHeader
          title="Beyond Code"
          subtitle={<>I LOVE running too!!</>}
        />

        {/* Cache indicator */}
        {!loading && !error && isUsingCache && cacheAge > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/50">
            <Clock className="w-4 h-4" />
            <span>
              Showing cached data from {cacheAge < 60 ? `${cacheAge} minutes` : `${Math.floor(cacheAge / 60)} hours`} ago
              {!StravaCache.canMakeApiCall() && (
                <span className="ml-2 text-white/40">
                  • Fresh data in {Math.ceil(StravaCache.timeUntilNextCall() / 60000)} min
                </span>
              )}
            </span>
          </div>
        )}
        
        {loading ? (
          <div className="mt-12">
            <RunningPageSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-lg mt-12">
            <div className="max-w-md mx-auto">
              <p className="text-white/60 mb-2 text-lg">Unable to load Strava data</p>
              <p className="text-sm text-white/40 mb-6">{error}</p>
              {error.includes('rate limit') && (
                <p className="text-xs text-white/30 mb-6">
                  Strava API limits reset every 15 minutes. Please wait a moment and try again.
                </p>
              )}
              <button
                onClick={fetchData}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-24">
            {/* Stats Overview */}
            <section>
              <RunningStatsGrid stats={stats} />
            </section>

            {/* Year in Motion Chart */}
            {activities.length > 0 && (
              <section>
                <YearInMotion activities={activities} />
              </section>
            )}

            {/* Recent Activities */}
            {activities.length > 0 && (
              <section>
                <RecentActivitiesTimeline activities={activities} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Extras;

