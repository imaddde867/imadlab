import { StravaActivity } from '@/integrations/strava/client';
import { MapPin, Timer, TrendingUp, Heart, Award, ExternalLink } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  formatDistanceCompact, 
  formatTimeDetailed, 
  formatPace, 
  formatDate, 
  getStravaActivityUrl 
} from '@/lib/strava-utils';

interface RecentActivitiesTimelineProps {
  activities: StravaActivity[];
}

const RecentActivitiesTimeline = ({ activities }: RecentActivitiesTimelineProps) => {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1 });
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
        <p className="text-white/60">No recent activities found</p>
      </div>
    );
  }

  return (
    <div ref={elementRef}>
      <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
          <MapPin className="w-6 h-6" />
          Recent Adventures
        </h3>
        <p className="text-white/60">Latest runs from the road</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div
            key={activity.id}
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: isVisible ? `${(idx + 1) * 100}ms` : '0ms' }}
          >
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/[0.08] transition-all duration-300 group">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded">
                        #{activities.length - idx}
                      </span>
                      <span className="text-xs text-white/40">{formatDate(activity.start_date)}</span>
                      {activity.kudos_count && activity.kudos_count > 0 && (
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {activity.kudos_count}
                        </span>
                      )}
                      {activity.achievement_count && activity.achievement_count > 0 && (
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {activity.achievement_count}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold mb-1 truncate group-hover:text-brand-gradient transition-colors">
                      {activity.name}
                    </h4>
                    <div className="text-sm text-white/50">{activity.type}</div>
                  </div>
                  
                  <a
                    href={getStravaActivityUrl(activity.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-sm font-medium group/link"
                  >
                    <span>View on Strava</span>
                    <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Distance
                    </div>
                    <div className="text-2xl font-bold">
                      {formatDistanceCompact(activity.distance)}
                    </div>
                    <div className="text-xs text-white/40">km</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <Timer className="w-3.5 h-3.5" />
                      Time
                    </div>
                    <div className="text-2xl font-bold">
                      {formatTimeDetailed(activity.moving_time)}
                    </div>
                    <div className="text-xs text-white/40">duration</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Pace
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPace(activity.distance, activity.moving_time).split(' ')[0]}
                    </div>
                    <div className="text-xs text-white/40">/km</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Elevation
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(activity.total_elevation_gain)}
                    </div>
                    <div className="text-xs text-white/40">meters</div>
                  </div>
                </div>

                {/* Additional metrics if available */}
                {(activity.average_heartrate || activity.suffer_score) && (
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    {activity.average_heartrate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Heart className="w-4 h-4 text-white/60" />
                        <span className="text-white/60">Avg HR:</span>
                        <span className="font-semibold">{Math.round(activity.average_heartrate)} bpm</span>
                        {activity.max_heartrate && (
                          <span className="text-white/40">
                            (max {Math.round(activity.max_heartrate)})
                          </span>
                        )}
                      </div>
                    )}
                    {activity.suffer_score && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-white/60" />
                        <span className="text-white/60">Suffer Score:</span>
                        <span className="font-semibold">{activity.suffer_score}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Map preview placeholder - can be enhanced with actual Strava maps */}
              {activity.map?.summary_polyline && (
                <div className="h-2 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View all CTA */}
      <div className="mt-8 text-center">
        <a
          href="https://www.strava.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all font-medium group"
        >
          <span>View All Activities on Strava</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default RecentActivitiesTimeline;
