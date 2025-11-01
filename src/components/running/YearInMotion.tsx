import { useMemo } from 'react';
import { StravaActivity } from '@/integrations/strava/client';
import { Calendar, TrendingUp } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { formatDistanceCompact } from '@/lib/strava-utils';

interface YearInMotionProps {
  activities: StravaActivity[];
}

const YearInMotion = ({ activities }: YearInMotionProps) => {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.2 });
  
  const last3MonthsData = useMemo(() => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    // Filter activities from last 3 months
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= threeMonthsAgo;
    });

    // Group by week for smoother line
    const weeklyData: { date: Date; distance: number; count: number }[] = [];
    const weekMap = new Map<string, { distance: number; count: number }>();

    recentActivities.forEach(activity => {
      const date = new Date(activity.start_date);
      // Get start of week (Monday)
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { distance: 0, count: 0 });
      }
      const week = weekMap.get(weekKey)!;
      week.distance += activity.distance;
      week.count += 1;
    });

    // Convert to array and sort
    weekMap.forEach((data, dateStr) => {
      weeklyData.push({
        date: new Date(dateStr),
        distance: data.distance,
        count: data.count,
      });
    });

    weeklyData.sort((a, b) => a.date.getTime() - b.date.getTime());
    return weeklyData;
  }, [activities]);

  const maxDistance = Math.max(...last3MonthsData.map(w => w.distance), 1);
  const totalDistance = last3MonthsData.reduce((sum, w) => sum + w.distance, 0);
  const totalRuns = last3MonthsData.reduce((sum, w) => sum + w.count, 0);

  // Generate SVG path for line chart
  const generatePath = () => {
    if (last3MonthsData.length === 0) return '';
    
    const width = 100;
    const height = 100;
    const padding = 5;

    const points = last3MonthsData.map((data, idx) => {
      const x = padding + ((width - 2 * padding) / Math.max(last3MonthsData.length - 1, 1)) * idx;
      const y = height - padding - ((height - 2 * padding) * (data.distance / maxDistance));
      return { x, y, data };
    });

    // Create smooth curve using quadratic bezier
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      path += ` Q ${current.x} ${current.y} ${midX} ${(current.y + next.y) / 2}`;
      path += ` Q ${next.x} ${next.y} ${next.x} ${next.y}`;
    }

    return path;
  };

  return (
    <div ref={elementRef} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            Last 3 Months
          </h3>
          <p className="text-white/60">
            {totalRuns} runs • {formatDistanceCompact(totalDistance)} km
          </p>
        </div>
      </div>

      {/* Line Chart */}
      <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-64">
          {last3MonthsData.length > 0 ? (
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="5" y1="25" x2="95" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
              <line x1="5" y1="75" x2="95" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
              
              {/* Area fill */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                </linearGradient>
              </defs>
              
              {/* Fill area under curve */}
              {last3MonthsData.length > 1 && (
                <path
                  d={`${generatePath()} L 95 95 L 5 95 Z`}
                  fill="url(#lineGradient)"
                  opacity="0.3"
                />
              )}
              
              {/* Line */}
              <path
                d={generatePath()}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))',
                }}
              />
              
              {/* Data points */}
              {last3MonthsData.map((data, idx) => {
                const width = 100;
                const height = 100;
                const padding = 5;
                const x = padding + ((width - 2 * padding) / Math.max(last3MonthsData.length - 1, 1)) * idx;
                const y = height - padding - ((height - 2 * padding) * (data.distance / maxDistance));
                
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="0.8"
                    fill="rgba(255,255,255,0.9)"
                    className="hover:r-1.5 transition-all cursor-pointer"
                  >
                    <title>
                      {data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {formatDistanceCompact(data.distance)} km
                    </title>
                  </circle>
                );
              })}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              No activity data for the last 3 months
            </div>
          )}
        </div>
      </div>

      {/* Stats summary */}
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-sm text-white/60 mb-1">Avg per Week</div>
          <div className="text-2xl font-bold">
            {last3MonthsData.length > 0 ? formatDistanceCompact(totalDistance / last3MonthsData.length) : '0'} km
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-sm text-white/60 mb-1">Best Week</div>
          <div className="text-2xl font-bold">
            {last3MonthsData.length > 0 
              ? formatDistanceCompact(Math.max(...last3MonthsData.map(w => w.distance))) 
              : '0'} km
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-sm text-white/60 mb-1">Active Weeks</div>
          <div className="text-2xl font-bold">
            {last3MonthsData.filter(w => w.count > 0).length}
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-white/60" />
          <div>
            <div className="text-sm text-white/60">Trend</div>
            <div className="text-2xl font-bold">
              {last3MonthsData.length >= 2 
                ? (last3MonthsData[last3MonthsData.length - 1].distance > last3MonthsData[0].distance ? '↑' : '↓')
                : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearInMotion;
