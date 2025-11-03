import { StravaStats, StravaActivity } from '@/integrations/strava/client';

interface YearInMotionProps {
  stats: StravaStats;
  activities: StravaActivity[]; // Keep for future use
}

const YearInMotion = ({ stats: _stats, activities: _activities }: YearInMotionProps) => {
  return null;
};

export default YearInMotion;
