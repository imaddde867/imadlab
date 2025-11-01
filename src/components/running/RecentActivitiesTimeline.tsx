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

      <div className="space-y-2.5">
        {activities.map((activity, idx) => (
          <div
            key={activity.id}
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: isVisible ? `${(idx + 1) * 100}ms` : '0ms' }}
          >
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/[0.08] transition-all duration-300 group">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-white/40">{formatDate(activity.start_date)}</span>
                      {activity.kudos_count > 0 && (
                        <span className="text-[11px] text-white/40 flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-white/20" />
                          {activity.kudos_count}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold truncate">
                      {activity.name}
                    </h4>
                  </div>
                  
                  <a
                    href={getStravaActivityUrl(activity.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-all group/link"
                    aria-label="View on Strava"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white/60 group-hover/link:text-white transition-colors" />
                  </a>
                </div>

                {/* Stats Grid - Compact */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider text-white/35 mb-0.5">Distance</div>
                    <div className="text-sm font-semibold">{formatDistanceCompact(activity.distance)}</div>
                    <div className="text-[9px] text-white/25">km</div>
                  </div>

                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider text-white/35 mb-0.5">Time</div>
                    <div className="text-sm font-semibold">{formatTimeDetailed(activity.moving_time)}</div>
                    <div className="text-[9px] text-white/25">mins</div>
                  </div>

                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider text-white/35 mb-0.5">Pace</div>
                    <div className="text-sm font-semibold">{formatPace(activity.distance, activity.moving_time).split(' ')[0]}</div>
                    <div className="text-[9px] text-white/25">/km</div>
                  </div>

                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider text-white/35 mb-0.5">Elev</div>
                    <div className="text-sm font-semibold">{Math.round(activity.total_elevation_gain)}</div>
                    <div className="text-[9px] text-white/25">m</div>
                  </div>
                </div>

                {/* Additional metrics - Compact */}
                {(activity.average_heartrate || activity.suffer_score) && (
                  <div className="flex items-center gap-3 pt-2.5 mt-2.5 border-t border-white/5 text-[11px]">
                    {activity.average_heartrate && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 text-white/40" />
                        <span className="text-white/60">{Math.round(activity.average_heartrate)} bpm</span>
                      </div>
                    )}
                    {activity.suffer_score && (
                      <div className="flex items-center gap-1">
                        <Award className="w-2.5 h-2.5 text-white/40" />
                        <span className="text-white/60">Suffer: {activity.suffer_score}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
