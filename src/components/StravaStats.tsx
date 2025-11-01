import { useEffect, useState, useCallback } from 'react';
import { stravaClient, type StravaStats as Stats, type StravaActivity } from '@/integrations/strava/client';
import { Activity, TrendingUp, MapPin, Timer } from 'lucide-react';

const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)} km`;
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const StravaStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        stravaClient.getAthleteStats(),
        stravaClient.getRecentActivities(),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Strava data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 mb-2">Unable to load Strava data</p>
        <p className="text-sm text-white/40">{error}</p>
        <p className="text-xs text-white/30 mt-4">
          Check the Supabase Edge Function logs for more details
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Year-to-Date Stats */}
      {stats?.ytd_run_totals && (
        <div>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Year to Date
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.ytd_run_totals.count > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <div className="text-sm text-white/60 mb-1">Runs</div>
                <div className="text-2xl font-bold">{stats.ytd_run_totals.count}</div>
                <div className="text-sm text-white/40 mt-2">
                  {formatDistance(stats.ytd_run_totals.distance)} • {formatTime(stats.ytd_run_totals.moving_time)}
                </div>
              </div>
            )}
            {stats.ytd_ride_totals && stats.ytd_ride_totals.count > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors">
                <div className="text-sm text-white/60 mb-1">Rides</div>
                <div className="text-2xl font-bold">{stats.ytd_ride_totals.count}</div>
                <div className="text-sm text-white/40 mt-2">
                  {formatDistance(stats.ytd_ride_totals.distance)} • {formatTime(stats.ytd_ride_totals.moving_time)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All-Time Stats */}
      {stats?.all_run_totals && (
        <div>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            All Time
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.all_run_totals.count > 0 && (
              <>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-white/60 mb-1">Total Runs</div>
                  <div className="text-3xl font-bold">{stats.all_run_totals.count}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-white/60 mb-1">Distance</div>
                  <div className="text-3xl font-bold">{formatDistance(stats.all_run_totals.distance)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-white/60 mb-1">Moving Time</div>
                  <div className="text-3xl font-bold">{formatTime(stats.all_run_totals.moving_time)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-sm text-white/60 mb-1">Elevation</div>
                  <div className="text-3xl font-bold">{Math.round(stats.all_run_totals.elevation_gain)}m</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{activity.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {formatDistance(activity.distance)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5" />
                        {formatTime(activity.moving_time)}
                      </span>
                      <span>{activity.type}</span>
                    </div>
                  </div>
                  <div className="text-sm text-white/40 whitespace-nowrap">
                    {new Date(activity.start_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StravaStats;
