import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Eye, Users, Clock, TrendingUp } from 'lucide-react';

type PageView = {
  id: string;
  session_id: string | null;
  path: string;
  referrer: string | null;
  viewed_at: string;
  duration: number | null;
};

type VisitorSession = {
  id: string;
  session_id: string;
  created_at: string;
  last_activity: string;
  user_agent: string | null;
};

type PathStats = {
  path: string;
  views: number;
  uniqueVisitors: number;
  avgDuration: number;
};

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const now = new Date();
    const timeRanges = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    const startDate = timeRanges[timeRange].toISOString();

    const [viewsRes, sessionsRes] = await Promise.all([
      supabase
        .from('page_views')
        .select('*')
        .gte('viewed_at', startDate)
        .order('viewed_at', { ascending: false }),
      supabase
        .from('visitor_sessions')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false }),
    ]);

    if (viewsRes.data) setPageViews(viewsRes.data as PageView[]);
    if (sessionsRes.data) setSessions(sessionsRes.data as VisitorSession[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) fetchAnalytics();
  }, [timeRange]);

  const totalViews = pageViews.length;
  const uniqueVisitors = new Set(pageViews.map(v => v.session_id)).size;
  const avgDuration = pageViews.filter(v => v.duration).reduce((acc, v) => acc + (v.duration || 0), 0) / pageViews.filter(v => v.duration).length || 0;

  const pathStats: PathStats[] = Object.entries(
    pageViews.reduce((acc, view) => {
      if (!acc[view.path]) {
        acc[view.path] = { views: 0, sessions: new Set(), durations: [] };
      }
      acc[view.path].views++;
      if (view.session_id) acc[view.path].sessions.add(view.session_id);
      if (view.duration) acc[view.path].durations.push(view.duration);
      return acc;
    }, {} as Record<string, { views: number; sessions: Set<string>; durations: number[] }>)
  ).map(([path, data]) => ({
    path,
    views: data.views,
    uniqueVisitors: data.sessions.size,
    avgDuration: data.durations.length ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length : 0,
  })).sort((a, b) => b.views - a.views);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Analytics Dashboard"
          description="Track visitor engagement and site traffic"
        />

        <div className="mb-6 flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Total Views</p>
                    <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-white/40" />
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Unique Visitors</p>
                    <p className="text-3xl font-bold">{uniqueVisitors.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-white/40" />
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Avg. Duration</p>
                    <p className="text-3xl font-bold">{formatDuration(avgDuration)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-white/40" />
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Total Sessions</p>
                    <p className="text-3xl font-bold">{sessions.length.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/40" />
                </div>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 p-6">
              <h2 className="text-xl font-bold mb-4">Top Pages</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Page</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Views</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Visitors</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Avg. Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathStats.map((stat) => (
                      <tr key={stat.path} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 font-mono text-sm">{stat.path}</td>
                        <td className="py-3 px-4 text-right">{stat.views}</td>
                        <td className="py-3 px-4 text-right">{stat.uniqueVisitors}</td>
                        <td className="py-3 px-4 text-right">{formatDuration(stat.avgDuration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
