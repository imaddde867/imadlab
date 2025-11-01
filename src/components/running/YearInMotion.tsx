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

  // Generate SVG path for accurate line chart with data points
  const generatePath = () => {
    if (last3MonthsData.length === 0) return '';
    
    const width = 100;
    const height = 100;
    const padding = 10;

    const points = last3MonthsData.map((data, idx) => {
      const x = padding + ((width - 2 * padding) / Math.max(last3MonthsData.length - 1, 1)) * idx;
      const y = height - padding - ((height - 2 * padding) * (data.distance / maxDistance));
      return { x, y };
    });

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    // Create smooth Catmull-Rom spline for natural curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      
      // Calculate control points for smooth curve
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const getDataPoints = () => {
    if (last3MonthsData.length === 0) return [];
    
    const width = 100;
    const height = 100;
    const padding = 10;

    return last3MonthsData.map((data, idx) => {
      const x = padding + ((width - 2 * padding) / Math.max(last3MonthsData.length - 1, 1)) * idx;
      const y = height - padding - ((height - 2 * padding) * (data.distance / maxDistance));
      return { x, y, data };
    });
  };

  return (
    <div ref={elementRef} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div>
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FC4C02]/10 border border-[#FC4C02]/20">
              <Calendar className="w-6 h-6 text-[#FC4C02]" />
            </div>
            Last 3 Months
          </h3>
          <p className="text-white/60">
            {totalRuns} runs • {formatDistanceCompact(totalDistance)} km
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Strava orange accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FC4C02]/5 blur-[100px] rounded-full pointer-events-none" />
          
          {last3MonthsData.length > 0 ? (
            <div className="space-y-6 relative">
              <svg viewBox="0 0 100 100" className="w-full h-64" preserveAspectRatio="none">
                {/* Enhanced grid lines */}
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(252, 76, 2, 0.25)" />
                    <stop offset="50%" stopColor="rgba(252, 76, 2, 0.1)" />
                    <stop offset="100%" stopColor="rgba(252, 76, 2, 0.0)" />
                  </linearGradient>
                  
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Grid lines with subtle styling */}
                {[20, 40, 60, 80].map((y) => (
                  <line 
                    key={y}
                    x1="10" 
                    y1={y} 
                    x2="90" 
                    y2={y} 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="0.3" 
                    strokeDasharray="2,2"
                  />
                ))}
                
                {/* Fill area under curve with orange gradient */}
                {last3MonthsData.length > 1 && (
                  <path
                    d={`${generatePath()} L 90 90 L 10 90 Z`}
                    fill="url(#chartGradient)"
                    opacity="0.8"
                  />
                )}
                
                {/* Main line with Strava orange */}
                <path
                  d={generatePath()}
                  fill="none"
                  stroke="#FC4C02"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
                
                {/* Data points */}
                {getDataPoints().map((point, idx) => (
                  <g key={idx}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="1.5"
                      fill="#FC4C02"
                      opacity="0.8"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="0.8"
                      fill="white"
                      opacity="0.9"
                    />
                  </g>
                ))}
              </svg>
              
              {/* Month labels on X axis */}
              <div className="flex justify-between px-2 text-xs text-white/50 relative">
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
                  
                  return (
                    <>
                      {monthPositions.map((item, idx) => (
                        <span key={idx} className="font-medium">
                          {item.month}
                        </span>
                      ))}
                    </>
                  );
                })()}
              </div>

              {/* Weekly distance indicator */}
              <div className="flex items-center gap-2 text-xs text-white/40 pt-2 border-t border-white/5">
                <TrendingUp className="w-3.5 h-3.5 text-[#FC4C02]" />
                <span>Weekly distance trend • {last3MonthsData.length} weeks of data</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-white/40">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No activity data for the last 3 months</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats summary with Strava branding */}
      <div className={`grid grid-cols-3 gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-center hover:bg-white/[0.07] hover:border-[#FC4C02]/20 transition-all group">
          <div className="text-xs text-white/50 mb-2 group-hover:text-[#FC4C02]/70 transition-colors">Total Distance</div>
          <div className="text-3xl font-bold mb-1 group-hover:text-[#FC4C02] transition-colors">
            {formatDistanceCompact(totalDistance)}
          </div>
          <div className="text-xs text-white/40">kilometers</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-center hover:bg-white/[0.07] hover:border-[#FC4C02]/20 transition-all group">
          <div className="text-xs text-white/50 mb-2 group-hover:text-[#FC4C02]/70 transition-colors">Total Runs</div>
          <div className="text-3xl font-bold mb-1 group-hover:text-[#FC4C02] transition-colors">
            {totalRuns}
          </div>
          <div className="text-xs text-white/40">activities</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-5 text-center hover:bg-white/[0.07] hover:border-[#FC4C02]/20 transition-all group">
          <div className="text-xs text-white/50 mb-2 group-hover:text-[#FC4C02]/70 transition-colors">Best Week</div>
          <div className="text-3xl font-bold mb-1 group-hover:text-[#FC4C02] transition-colors">
            {last3MonthsData.length > 0 
              ? formatDistanceCompact(Math.max(...last3MonthsData.map(w => w.distance))) 
              : '0'}
          </div>
          <div className="text-xs text-white/40">kilometers</div>
        </div>
      </div>
    </div>
  );
};

export default YearInMotion;
