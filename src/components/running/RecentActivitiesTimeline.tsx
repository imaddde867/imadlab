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

      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div
            key={activity.id}
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: isVisible ? `${(idx + 1) * 100}ms` : '0ms' }}
          >
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 group">
              {/* Header Section */}
              <div className="px-5 pt-4 pb-3 border-b border-white/[0.05]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium truncate mb-1.5 text-white/95">
                      {activity.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-white/40">
                      <span>{formatDate(activity.start_date)}</span>
                      {activity.kudos_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-white/15" />
                          {activity.kudos_count}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href={getStravaActivityUrl(activity.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-all group/link mt-0.5"
                    aria-label="View on Strava"
                  >
                    <ExternalLink className="w-4 h-4 text-white/50 group-hover/link:text-white/90 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Stats Section */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1.5">Distance</div>
                    <div className="text-lg font-semibold text-white/90">{formatDistanceCompact(activity.distance)}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">kilometers</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1.5">Time</div>
                    <div className="text-lg font-semibold text-white/90">{formatTimeDetailed(activity.moving_time)}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">minutes</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1.5">Pace</div>
                    <div className="text-lg font-semibold text-white/90">{formatPace(activity.distance, activity.moving_time).split(' ')[0]}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">per km</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-white/30 mb-1.5">Elevation</div>
                    <div className="text-lg font-semibold text-white/90">{Math.round(activity.total_elevation_gain)}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">meters</div>
                  </div>
                </div>

                {/* Additional metrics */}
                {(activity.average_heartrate || activity.suffer_score) && (
                  <div className="flex items-center gap-4 pt-3 mt-3 border-t border-white/[0.05]">
                    {activity.average_heartrate && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Heart className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-white/50">{Math.round(activity.average_heartrate)} bpm</span>
                      </div>
                    )}
                    {activity.suffer_score && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Award className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-white/50">Suffer Score: {activity.suffer_score}</span>
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
          href="https://www.strava.com/athletes/124531733"
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
