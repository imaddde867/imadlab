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
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    // Filter activities from last 3 months
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= threeMonthsAgo;
    });

    // Group by week for smoother visualization
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

  // Generate SVG path for smooth line chart
  const generatePath = () => {
    if (last3MonthsData.length === 0) return '';
    
    const width = 100;
    const height = 100;
    const padding = 5;

    const points = last3MonthsData.map((data, idx) => {
      const x = padding + ((width - 2 * padding) / Math.max(last3MonthsData.length - 1, 1)) * idx;
      const y = height - padding - ((height - 2 * padding) * (data.distance / maxDistance));
      return { x, y };
    });

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    // Create simple smooth line
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const midX = (prev.x + current.x) / 2;
      const midY = (prev.y + current.y) / 2;
      path += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
      if (i === points.length - 1) {
        path += ` Q ${current.x} ${current.y}, ${current.x} ${current.y}`;
      }
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

      {/* Activity Chart */}
      <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          {last3MonthsData.length > 0 ? (
            <div className="space-y-3">
              <svg viewBox="0 0 100 100" className="w-full h-56" preserveAspectRatio="none">
                {/* Subtle grid lines */}
                <line x1="5" y1="25" x2="95" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                <line x1="5" y1="75" x2="95" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" />
                
                {/* Gradient fill */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                  </linearGradient>
                </defs>
                
                {/* Fill area under curve */}
                {last3MonthsData.length > 1 && (
                  <path
                    d={`${generatePath()} L 95 95 L 5 95 Z`}
                    fill="url(#areaGradient)"
                  />
                )}
                
                {/* Main line */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              {/* Month labels on X axis */}
              <div className="flex justify-between px-1 -mt-2">
                {(() => {
                  const months = new Set<string>();
                  const monthPositions: { month: string; position: number }[] = [];
                  
                  last3MonthsData.forEach((data, idx) => {
                    const month = data.date.toLocaleDateString('en-US', { month: 'short' });
                    if (!months.has(month)) {
                      months.add(month);
                      const position = (idx / Math.max(last3MonthsData.length - 1, 1)) * 100;
                      monthPositions.push({ month, position });
                    }
                  });
                  
                  return monthPositions.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs text-white/50"
                      style={{ position: 'absolute', left: `${item.position}%` }}
                    >
                      {item.month}
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-white/40">
              No activity data for the last 3 months
            </div>
          )}
        </div>
      </div>

      {/* Stats summary */}
      <div className={`grid grid-cols-3 gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-center">
          <div className="text-xs text-white/50 mb-2">Total Distance</div>
          <div className="text-3xl font-bold mb-1">
            {formatDistanceCompact(totalDistance)}
          </div>
          <div className="text-xs text-white/40">km</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-center">
          <div className="text-xs text-white/50 mb-2">Total Runs</div>
          <div className="text-3xl font-bold mb-1">
            {totalRuns}
          </div>
          <div className="text-xs text-white/40">activities</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-center">
          <div className="text-xs text-white/50 mb-2">Best Week</div>
          <div className="text-3xl font-bold mb-1">
            {last3MonthsData.length > 0 
              ? formatDistanceCompact(Math.max(...last3MonthsData.map(w => w.distance))) 
              : '0'}
          </div>
          <div className="text-xs text-white/40">km</div>
        </div>
      </div>
    </div>
  );
};

export default YearInMotion;
