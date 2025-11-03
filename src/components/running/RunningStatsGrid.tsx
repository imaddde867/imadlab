import { StravaStats } from '@/integrations/strava/client';
import { Activity, Zap, Mountain, Clock } from 'lucide-react';
import SpotlightCard from '@/components/SpotlightCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { formatDistanceCompact, formatTime } from '@/lib/strava-utils';

interface RunningStatsGridProps {
  stats: StravaStats | null;
}

const RunningStatsGrid = ({ stats }: RunningStatsGridProps) => {
  const { elementRef: ytdRef, isVisible: ytdVisible } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });
  const { elementRef: allTimeRef, isVisible: allTimeVisible } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });
  
  if (!stats) return null;

  const ytdStats = stats.ytd_run_totals;
  const allTimeStats = stats.all_run_totals;

  return (
    <div className="space-y-12">
      {/* Year to Date - Featured Stats */}
      {ytdStats && ytdStats.count > 0 && (
        <div ref={ytdRef}>
          <div className={`mb-8 transition-all duration-700 ${ytdVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-2xl font-bold mb-2">
              {new Date().getFullYear()} Progress
            </h3>
            <p className="text-white/60">My journey so far this year</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Activity, label: 'Total Runs', value: ytdStats.count, subtitle: 'activities completed' },
              { icon: Zap, label: 'Distance', value: formatDistanceCompact(ytdStats.distance), subtitle: 'kilometers ran' },
              { icon: Clock, label: 'Time', value: formatTime(ytdStats.moving_time).split(' ')[0], subtitle: 'hours in motion' }
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`transition-all duration-700 ${ytdVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: ytdVisible ? `${(idx + 1) * 100}ms` : '0ms' }}
              >
                <SpotlightCard spotlightColor="rgba(252, 76, 2, 0.15)">
                  <div className="p-8 h-full group hover:bg-white/[0.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 rounded-lg bg-[#FC4C02]/10 group-hover:bg-[#FC4C02]/20 transition-colors border border-[#FC4C02]/20">
                        <stat.icon className="w-6 h-6 text-[#FC4C02]" />
                      </div>
                      <div className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                        {stat.label}
                      </div>
                    </div>
                    <div className="text-5xl font-bold mb-2 group-hover:text-[#FC4C02] transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/50">{stat.subtitle}</div>
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Time Stats */}
      {allTimeStats && allTimeStats.count > 0 && (
        <div ref={allTimeRef}>
          <div className={`mb-8 transition-all duration-700 ${allTimeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-2xl font-bold mb-2">
              Lifetime Achievements
            </h3>
            <p className="text-white/60">The complete journey</p>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${allTimeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/[0.08] transition-all duration-300 group">
              <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Runs
              </div>
              <div className="text-4xl font-bold mb-1 group-hover:text-brand-gradient transition-all">
                {allTimeStats.count}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/[0.08] transition-all duration-300 group">
              <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Distance
              </div>
              <div className="text-4xl font-bold mb-1 group-hover:text-brand-gradient transition-all">
                {formatDistanceCompact(allTimeStats.distance)}
              </div>
              <div className="text-xs text-white/40">km</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/[0.08] transition-all duration-300 group">
              <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Moving Time
              </div>
              <div className="text-4xl font-bold mb-1 group-hover:text-brand-gradient transition-all">
                {formatTime(allTimeStats.moving_time).split(' ')[0]}
              </div>
              <div className="text-xs text-white/40">
                {formatTime(allTimeStats.moving_time).includes('h') ? 'hours' : 'minutes'}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/[0.08] transition-all duration-300 group">
              <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                <Mountain className="w-4 h-4" />
                Elevation
              </div>
              <div className="text-4xl font-bold mb-1 group-hover:text-brand-gradient transition-all">
                {Math.round(allTimeStats.elevation_gain).toLocaleString()}
              </div>
              <div className="text-xs text-white/40">meters climbed</div>
            </div>
          </div>

          {/* Fun facts */}
          <div className={`mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-700 delay-200 ${allTimeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold mb-1">
                {(allTimeStats.distance / allTimeStats.count / 1000).toFixed(1)} km
              </div>
              <div className="text-sm text-white/60">Average Distance</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold mb-1">
                {Math.round(allTimeStats.elevation_gain / allTimeStats.count)} m
              </div>
              <div className="text-sm text-white/60">Avg Elevation per Run</div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold mb-1">
                {Math.round(allTimeStats.distance / 42195)}
              </div>
              <div className="text-sm text-white/60">Marathon Equivalents</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningStatsGrid;
