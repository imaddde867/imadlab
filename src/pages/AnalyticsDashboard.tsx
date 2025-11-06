import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentLoader } from '@/components/ui/LoadingStates';
import { Eye, Users, Clock, TrendingUp, RefreshCw, Globe, Smartphone, Chrome, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PageView = {
  id: string;
  session_id: string | null;
  path: string;
  referrer: string | null;
  viewed_at: string;
  duration: number | null;
  traffic_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

type VisitorSession = {
  id: string;
  session_id: string;
  created_at: string;
  last_activity: string;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  language: string | null;
  timezone: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

type PathStats = {
  path: string;
  views: number;
  uniqueVisitors: number;
  avgDuration: number;
};

type CursorPreference = {
  session_id: string;
  cursor_name: string | null;
  user_agent: string | null;
  updated_at: string;
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
  const [_sessions, setSessions] = useState<VisitorSession[]>([]);
  const [cursorEntries, setCursorEntries] = useState<CursorPreference[]>([]);
  const [cursorError, setCursorError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setCursorError(null);
    
    const now = new Date();
    const timeRanges = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    const startDate = timeRanges[timeRange].toISOString();

    const [viewsRes, sessionsRes, cursorRes] = await Promise.all([
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
      supabase
        .from('cursor_preferences')
        .select('session_id, cursor_name, user_agent, updated_at')
        .gte('updated_at', startDate)
        .order('updated_at', { ascending: false })
        .limit(150),
    ]);

    if (viewsRes.data) setPageViews(viewsRes.data as PageView[]);
    if (sessionsRes.data) setSessions(sessionsRes.data as VisitorSession[]);
    if (cursorRes.error) {
      setCursorEntries([]);
      setCursorError(cursorRes.error.message);
    } else if (cursorRes.data) {
      setCursorEntries(cursorRes.data as CursorPreference[]);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const totalViews = pageViews.length;
  const uniqueVisitors = new Set(pageViews.map(v => v.session_id)).size;
  const avgDuration = useMemo(() => {
    const withDuration = pageViews.filter(v => v.duration);
    return withDuration.length ? withDuration.reduce((acc, v) => acc + (v.duration || 0), 0) / withDuration.length : 0;
  }, [pageViews]);

  // Calculate bounce rate (sessions with only 1 page view)
  const bounceRate = useMemo(() => {
    const sessionViewCounts = pageViews.reduce((acc, view) => {
      if (view.session_id) {
        acc[view.session_id] = (acc[view.session_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const totalSessions = Object.keys(sessionViewCounts).length;
    const bouncedSessions = Object.values(sessionViewCounts).filter(count => count === 1).length;
    
    return totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
  }, [pageViews]);

  // Traffic source breakdown
  const trafficSourceStats = useMemo(() => {
    const sources = pageViews.reduce((acc, view) => {
      const source = view.traffic_source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [pageViews]);

  // Device type breakdown
  const deviceStats = useMemo(() => {
    const devices = pageViews.reduce((acc, view) => {
      const device = view.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(devices)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
  }, [pageViews]);

  // Browser breakdown
  const browserStats = useMemo(() => {
    const browsers = pageViews.reduce((acc, view) => {
      const browser = view.browser || 'unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(browsers)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
  }, [pageViews]);

  // OS breakdown
  const osStats = useMemo(() => {
    const systems = pageViews.reduce((acc, view) => {
      const os = view.os || 'unknown';
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(systems)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);
  }, [pageViews]);

  // Geographic breakdown (country)
  const countryStats = useMemo(() => {
    const countries = pageViews.reduce((acc, view) => {
      const country = view.country || 'unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(countries)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }, [pageViews]);

  // Top referrers
  const referrerStats = useMemo(() => {
    const referrers = pageViews
      .filter(view => view.referrer && view.referrer !== '')
      .reduce((acc, view) => {
        try {
          const url = new URL(view.referrer!);
          const domain = url.hostname.replace(/^www\./, '');
          acc[domain] = (acc[domain] || 0) + 1;
        } catch {
          acc['unknown'] = (acc['unknown'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(referrers)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [pageViews]);

  // UTM Campaign performance
  const campaignStats = useMemo(() => {
    const campaigns = pageViews
      .filter(view => view.utm_campaign)
      .reduce((acc, view) => {
        const campaign = view.utm_campaign!;
        if (!acc[campaign]) {
          acc[campaign] = { views: 0, sessions: new Set() };
        }
        acc[campaign].views++;
        if (view.session_id) acc[campaign].sessions.add(view.session_id);
        return acc;
      }, {} as Record<string, { views: number; sessions: Set<string> }>);
    
    return Object.entries(campaigns)
      .map(([campaign, data]) => ({ 
        campaign, 
        views: data.views,
        visitors: data.sessions.size 
      }))
      .sort((a, b) => b.views - a.views);
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
    { label: 'Bounce Rate', value: `${bounceRate.toFixed(1)}%`, icon: <TrendingUp className="h-5 w-5 text-white/60" /> },
  ];

  const headerMeta = [
    { label: 'Time Range', value: timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days' },
    { label: 'Page Views', value: totalViews.toLocaleString() },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-14">
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
          <>
            {/* Traffic Sources */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Traffic Sources
                    </div>
                  </CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    Where your visitors are coming from
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  {trafficSourceStats.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {trafficSourceStats.map(({ source, count }) => {
                        const percentage = ((count / totalViews) * 100).toFixed(1);
                        return (
                          <div key={source} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-sm font-medium text-white/90 capitalize min-w-20">
                                {source}
                              </span>
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-sm text-white/70 min-w-12 text-right">{percentage}%</span>
                              <span className="text-sm font-semibold text-white min-w-12 text-right">
                                {count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Types */}
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Devices
                    </div>
                  </CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    Device type breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  {deviceStats.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {deviceStats.map(({ device, count }) => {
                        const percentage = ((count / totalViews) * 100).toFixed(1);
                        return (
                          <div key={device} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-sm font-medium text-white/90 capitalize min-w-20">
                                {device}
                              </span>
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-sm text-white/70 min-w-12 text-right">{percentage}%</span>
                              <span className="text-sm font-semibold text-white min-w-12 text-right">
                                {count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Browsers and OS */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>
                    <div className="flex items-center gap-2">
                      <Chrome className="h-5 w-5" />
                      Browsers
                    </div>
                  </CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    Browser distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  {browserStats.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {browserStats.slice(0, 5).map(({ browser, count }) => {
                        const percentage = ((count / totalViews) * 100).toFixed(1);
                        return (
                          <div key={browser} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-sm font-medium text-white/90 min-w-20">
                                {browser}
                              </span>
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-sm text-white/70 min-w-12 text-right">{percentage}%</span>
                              <span className="text-sm font-semibold text-white min-w-12 text-right">
                                {count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>
                    Operating Systems
                  </CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    OS distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  {osStats.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No data available</p>
                  ) : (
                    <div className="space-y-3">
                      {osStats.slice(0, 5).map(({ os, count }) => {
                        const percentage = ((count / totalViews) * 100).toFixed(1);
                        return (
                          <div key={os} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-sm font-medium text-white/90 min-w-20">
                                {os}
                              </span>
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className="text-sm text-white/70 min-w-12 text-right">{percentage}%</span>
                              <span className="text-sm font-semibold text-white min-w-12 text-right">
                                {count.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Geographic Distribution */}
            {countryStats.filter(s => s.country !== 'unknown').length > 0 && (
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Geographic Distribution
                    </div>
                  </CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    Visitors by country
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {countryStats.filter(s => s.country !== 'unknown').slice(0, 10).map(({ country, count }) => {
                      const percentage = ((count / totalViews) * 100).toFixed(1);
                      return (
                        <div key={country} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <span className="text-sm font-medium text-white/90">{country}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white/70">{percentage}%</span>
                            <span className="text-sm font-semibold text-white min-w-12 text-right">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Referrers */}
            {referrerStats.length > 0 && (
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>Top Referrers</CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    External sites sending traffic
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  <div className="grid gap-3 md:grid-cols-2">
                    {referrerStats.map(({ referrer, count }) => (
                      <div key={referrer} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-sm font-mono text-white/90 truncate max-w-[200px]">
                          {referrer}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UTM Campaigns */}
            {campaignStats.length > 0 && (
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <CardTitle className={SECTION_TITLE_CLASS}>Campaign Performance</CardTitle>
                  <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                    UTM campaign tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs uppercase tracking-widest text-white/70 border-b border-white/10">
                          <th className="text-left py-3 px-4 font-semibold">Campaign</th>
                          <th className="text-right py-3 px-4 font-semibold">Views</th>
                          <th className="text-right py-3 px-4 font-semibold">Visitors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaignStats.map(({ campaign, views, visitors }) => (
                          <tr key={campaign} className="border-b border-white/5 hover:bg-white/5 transition">
                            <td className="py-3 px-4 text-sm text-white/90">{campaign}</td>
                            <td className="py-3 px-4 text-right text-white/90">{views.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-white/90">{visitors.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Pages */}
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

            {/* Cursor Preferences */}
            <section id="cursor-preferences" className="space-y-4">
              <Card className={SECTION_CARD_CLASS}>
                <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className={SECTION_TITLE_CLASS}>Cursor Preferences</CardTitle>
                      <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                        Latest visitor-selected cursor names (max 150) with session context.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={fetchAnalytics}
                      className="text-white/80 hover:text-white"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                  {loading ? (
                    <p className="text-white/60 text-center py-8">Loading cursor preferences…</p>
                  ) : cursorError ? (
                    <p className="text-red-400 text-center py-8">
                      Failed to load cursor data: {cursorError}
                    </p>
                  ) : cursorEntries.length === 0 ? (
                    <p className="text-white/60 text-center py-8">
                      No cursor preferences recorded in the selected range.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-widest text-white/70 border-b border-white/10">
                            <th className="text-left py-3 px-4 font-semibold">Cursor Name</th>
                            <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Session ID</th>
                            <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">User Agent</th>
                            <th className="text-left py-3 px-4 font-semibold">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cursorEntries.map((entry) => (
                            <tr key={entry.session_id} className="border-b border-white/5 hover:bg-white/5 transition">
                              <td className="py-3 px-4 text-white/90">
                                {entry.cursor_name && entry.cursor_name.trim().length > 0 ? (
                                  entry.cursor_name
                                ) : (
                                  <span className="text-white/40 italic">No name saved</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-white/70 font-mono text-xs hidden md:table-cell">
                                {entry.session_id}
                              </td>
                              <td className="py-3 px-4 text-white/60 text-xs leading-relaxed hidden lg:table-cell">
                                {entry.user_agent ?? '—'}
                              </td>
                              <td className="py-3 px-4 text-white/70 text-sm">
                                {new Date(entry.updated_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
