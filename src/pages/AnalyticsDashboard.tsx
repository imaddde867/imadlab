import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentLoader } from '@/components/ui/LoadingStates';
import { Eye, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const SECTION_CARD_CLASS = 'rounded-2xl border border-white/10 bg-white/[0.06] shadow-sm';
const SECTION_HEADER_CLASS = 'px-6 pt-6 pb-0';
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-white';
const SECTION_DESCRIPTION_CLASS = 'text-sm text-white/70';
const SECTION_CONTENT_CLASS = 'px-6 pb-6';
const FILTER_BUTTON_ACTIVE_CLASS = 'bg-white text-black border border-white/80 shadow-sm';
const FILTER_BUTTON_INACTIVE_CLASS = 'bg-black/40 text-white/75 hover:bg-white/10 hover:text-white';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const fetchAnalytics = useCallback(async () => {
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
  }, [timeRange]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        toast({
          title: 'Unauthorized',
          description: 'Please log in to access this page.',
          variant: 'destructive',
        });
        return;
      }
      fetchAnalytics();
    };
    checkAuth();
  }, [navigate, toast, fetchAnalytics]);

  useEffect(() => {
    if (!loading) fetchAnalytics();
  }, [timeRange]);

  const totalViews = pageViews.length;
  const uniqueVisitors = new Set(pageViews.map(v => v.session_id)).size;
  const avgDuration = useMemo(() => {
    const withDuration = pageViews.filter(v => v.duration);
    return withDuration.length ? withDuration.reduce((acc, v) => acc + (v.duration || 0), 0) / withDuration.length : 0;
  }, [pageViews]);

  const pathStats: PathStats[] = useMemo(() => {
    return Object.entries(
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
  }, [pageViews]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const overviewStats = [
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: <Eye className="h-5 w-5 text-white/60" /> },
    { label: 'Unique Visitors', value: uniqueVisitors.toLocaleString(), icon: <Users className="h-5 w-5 text-white/60" /> },
    { label: 'Avg. Duration', value: formatDuration(avgDuration), icon: <Clock className="h-5 w-5 text-white/60" /> },
    { label: 'Total Sessions', value: sessions.length.toLocaleString(), icon: <TrendingUp className="h-5 w-5 text-white/60" /> },
  ];

  const headerMeta = [
    { label: 'Time Range', value: timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days' },
    { label: 'Page Views', value: totalViews.toLocaleString() },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container-site space-y-10 pb-24">
        <PageHeader
          eyebrow="Admin Suite"
          title="Analytics Dashboard"
          description="Track visitor engagement, traffic patterns, and site performance metrics."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Analytics', href: '/admin/analytics' },
          ]}
          meta={headerMeta}
          actions={
            <Button
              variant="soft"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((stat) => (
              <Card
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_48px_rgba(15,23,42,0.35)] backdrop-blur-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageHeader>

        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                timeRange === range ? FILTER_BUTTON_ACTIVE_CLASS : FILTER_BUTTON_INACTIVE_CLASS
              }`}
            >
              {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
            </Button>
          ))}
        </div>

        {loading ? (
          <ContentLoader />
        ) : (
          <Card className={SECTION_CARD_CLASS}>
            <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
              <CardTitle className={SECTION_TITLE_CLASS}>Top Pages</CardTitle>
              <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                Most visited pages with engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
              {pathStats.length === 0 ? (
                <p className="text-white/60 text-center py-8">No page views recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs uppercase tracking-widest text-white/70 border-b border-white/10">
                        <th className="text-left py-3 px-4 font-semibold">Page</th>
                        <th className="text-right py-3 px-4 font-semibold">Views</th>
                        <th className="text-right py-3 px-4 font-semibold">Visitors</th>
                        <th className="text-right py-3 px-4 font-semibold">Avg. Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pathStats.map((stat) => (
                        <tr key={stat.path} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-3 px-4 font-mono text-sm text-white/90">{stat.path}</td>
                          <td className="py-3 px-4 text-right text-white/90">{stat.views.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-white/90">{stat.uniqueVisitors.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-white/70">{formatDuration(stat.avgDuration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
