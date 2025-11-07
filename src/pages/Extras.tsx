import { useEffect, useState, useCallback } from 'react';
import Seo from '@/components/Seo';
import SectionHeader from '@/components/SectionHeader';
import RunningStatsGrid from '@/components/running/RunningStatsGrid';
import YearInMotion from '@/components/running/YearInMotion';
import RecentActivitiesTimeline from '@/components/running/RecentActivitiesTimeline';
import RunningPageSkeleton from '@/components/running/RunningPageSkeleton';
import { stravaClient, type StravaStats, type StravaActivity } from '@/integrations/strava/client';
import { StravaCache } from '@/lib/strava-cache';
import { Clock, ExternalLink } from 'lucide-react';

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
        stravaClient.getRecentActivities(5),
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
    <div className="min-h-screen bg-black text-white relative pt-14">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(1200px circle at 50% 10%, rgba(255,255,255,0.05), transparent 60%)',
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
        <div className="flex items-start justify-between gap-4">
          <SectionHeader title="Beyond Code" subtitle={<>I LOVE running</>} />
          <a
            href="https://www.strava.com/athletes/124531733"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#FC4C02]/40 rounded-lg transition-all font-medium text-sm group"
          >
            <svg className="w-5 h-5 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            <span>View on Strava</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Cache indicator */}
        {!loading && !error && isUsingCache && cacheAge > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/30">
            <Clock className="w-3 h-3" />
            <span>
              Cached {cacheAge < 60 ? `${cacheAge}m` : `${Math.floor(cacheAge / 60)}h`} ago
              {!StravaCache.canMakeApiCall() && (
                <span className="ml-1.5 text-white/20">
                  · Fresh in {Math.ceil(StravaCache.timeUntilNextCall() / 60000)}m
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
          <div className="text-center py-24 bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-xl mt-12 relative overflow-hidden">
            <div className="max-w-md mx-auto relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-white/60" />
              </div>
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
