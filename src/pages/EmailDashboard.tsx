import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Tag } from '@/components/ui/tag';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ContentLoader } from '@/components/ui/LoadingStates';
import { RefreshCw, Send, Eye, Users, Mail, TrendingUp, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TagVariant = 'default' | 'subtle' | 'outline' | 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

type EmailQueueRow = Database['public']['Tables']['email_queue']['Row'];
type NewsletterSubscriberRow = Database['public']['Tables']['newsletter_subscribers']['Row'];
type EmailAnalyticsRow = Database['public']['Tables']['email_analytics']['Row'];
type BlogPostRow = Database['public']['Tables']['posts']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];

type EmailQueueItem = EmailQueueRow & {
  content_type: 'blog_post' | 'project';
  status: 'pending' | 'processing' | 'sent' | 'failed';
  content_title?: string;
};

interface EmailStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalEmailsSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

type BlogPreviewPayload = {
  subscriberEmail: string;
  unsubscribeToken: string;
  siteUrl: string;
  post: BlogPostRow;
};

type ProjectPreviewPayload = {
  subscriberEmail: string;
  unsubscribeToken: string;
  siteUrl: string;
  project: ProjectRow;
};

const normalizeContentType = (value: string | null): EmailQueueItem['content_type'] =>
  value === 'project' ? 'project' : 'blog_post';

const normalizeStatus = (value: string | null): EmailQueueItem['status'] => {
  switch (value) {
    case 'processing':
    case 'sent':
    case 'failed':
      return value;
    case 'pending':
    default:
      return 'pending';
  }
};

type SubscriberSummary = Pick<NewsletterSubscriberRow, 'email' | 'status'> & {
  created_at?: string;
  updated_at?: string;
};

type SubscriberMetrics = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  lastEvent?: string;
};

type QueueMetrics = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  uniqueRecipients: number;
};

type PreviewRequest =
  | { mode: 'latest'; contentType: 'blog_post' | 'project' }
  | { mode: 'queue'; queueItem: EmailQueueItem };

const SECTION_CARD_CLASS = 'rounded-2xl border border-white/10 bg-white/[0.06] shadow-sm';
const SECTION_HEADER_CLASS = 'px-6 pt-6 pb-0';
const SECTION_TITLE_CLASS = 'text-lg font-semibold text-white';
const SECTION_DESCRIPTION_CLASS = 'text-sm text-white/70';
const SECTION_CONTENT_CLASS = 'px-6 pb-6 space-y-6';
const FILTER_BUTTON_ACTIVE_CLASS = 'bg-white text-black border border-white/80 shadow-sm';
const FILTER_BUTTON_INACTIVE_CLASS = 'bg-black/40 text-white/75 hover:bg-white/10 hover:text-white';
const METRIC_LABEL_CLASS = 'text-xs uppercase tracking-widest text-white/70';

const EmailDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [subscriberList, setSubscriberList] = useState<SubscriberSummary[]>([]);
  const [subscriberMetrics, setSubscriberMetrics] = useState<Record<string, SubscriberMetrics>>({});
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive' | 'unsubscribed'>('all');
  const [queueMetrics, setQueueMetrics] = useState<Record<string, QueueMetrics>>({});
  const [blogAutoSend, setBlogAutoSend] = useState(true);
  const [projectAutoSend, setProjectAutoSend] = useState(true);

  const loadEmailData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load email queue
      const { data: queueData, error: queueError } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queueError) throw queueError;
      
      // Normalize queue items
      const normalizedQueue: EmailQueueItem[] = (queueData ?? []).map((item) => ({
        ...item,
        content_type: normalizeContentType(item.content_type ?? null),
        status: normalizeStatus(item.status ?? null),
      }));

      // Fetch titles for all queue items
      const blogIds = normalizedQueue
        .filter(item => item.content_type === 'blog_post')
        .map(item => item.content_id);
      const projectIds = normalizedQueue
        .filter(item => item.content_type === 'project')
        .map(item => item.content_id);

      const [blogTitles, projectTitles] = await Promise.all([
        blogIds.length > 0
          ? supabase.from('posts').select('id, title').in('id', blogIds)
          : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
        projectIds.length > 0
          ? supabase.from('projects').select('id, title').in('id', projectIds)
          : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
      ]);

      // Create title lookup maps
      const blogTitleMap = new Map((blogTitles.data || []).map(b => [b.id, b.title]));
      const projectTitleMap = new Map((projectTitles.data || []).map(p => [p.id, p.title]));

      // Add titles to queue items
      const queueWithTitles = normalizedQueue.map(item => ({
        ...item,
        content_title: item.content_type === 'blog_post'
          ? blogTitleMap.get(item.content_id)
          : projectTitleMap.get(item.content_id),
      }));

      setEmailQueue(queueWithTitles);

      // Load email statistics
      const [{ data: subscriberRows }, { data: analyticsRows }] = await Promise.all([
        supabase.from('newsletter_subscribers').select('status, email, created_at, updated_at'),
        supabase.from('email_analytics').select('*'),
      ]);

      if (subscriberRows && analyticsRows) {
        const subscribers = subscriberRows as Array<Pick<NewsletterSubscriberRow, 'status' | 'email' | 'created_at' | 'updated_at'>>;
        const analytics = analyticsRows as EmailAnalyticsRow[];

        const totalSubscribers = subscribers.length;
        const activeSubscribers = subscribers.filter((subscriber) => !subscriber.status || subscriber.status === 'active').length;
        const totalEmailsSent = analytics.filter((entry) => entry.sent_at).length;
        const deliveredEmails = analytics.filter((entry) => entry.delivered_at).length;
        const openedEmails = analytics.filter((entry) => entry.opened_at).length;
        const clickedEmails = analytics.filter((entry) => entry.clicked_at).length;

        const summaries: SubscriberSummary[] = subscribers.map((subscriber) => ({
          email: subscriber.email,
          status: subscriber.status ?? 'active',
          created_at: subscriber.created_at ?? undefined,
          updated_at: subscriber.updated_at ?? undefined,
        }));

        const subscriberMetricsMap: Record<string, SubscriberMetrics> = {};
        const queueAccumulator: Record<string, { metrics: QueueMetrics; recipients: Set<string> }> = {};

        analytics.forEach((entry) => {
          const key = entry.subscriber_email;
          if (!subscriberMetricsMap[key]) {
            subscriberMetricsMap[key] = {
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              bounced: 0,
              lastEvent: undefined,
            };
          }

          const subscriberMetric = subscriberMetricsMap[key];

          if (entry.sent_at) subscriberMetric.sent += 1;
          if (entry.delivered_at) subscriberMetric.delivered += 1;
          if (entry.opened_at) subscriberMetric.opened += 1;
          if (entry.clicked_at) subscriberMetric.clicked += 1;
          if (entry.bounced_at) subscriberMetric.bounced += 1;

          const timestamps = [
            entry.clicked_at,
            entry.opened_at,
            entry.delivered_at,
            entry.sent_at,
            entry.bounced_at,
            entry.unsubscribed_at,
          ]
            .filter(Boolean)
            .map((value) => new Date(value as string).getTime());

          if (timestamps.length) {
            const latest = Math.max(...timestamps);
            if (!subscriberMetric.lastEvent || latest > new Date(subscriberMetric.lastEvent).getTime()) {
              subscriberMetric.lastEvent = new Date(latest).toISOString();
            }
          }

          if (entry.email_queue_id) {
            if (!queueAccumulator[entry.email_queue_id]) {
              queueAccumulator[entry.email_queue_id] = {
                metrics: {
                  sent: 0,
                  delivered: 0,
                  opened: 0,
                  clicked: 0,
                  bounced: 0,
                  uniqueRecipients: 0,
                },
                recipients: new Set<string>(),
              };
            }

            const queueMetric = queueAccumulator[entry.email_queue_id];
            queueMetric.recipients.add(entry.subscriber_email);
            if (entry.sent_at) queueMetric.metrics.sent += 1;
            if (entry.delivered_at) queueMetric.metrics.delivered += 1;
            if (entry.opened_at) queueMetric.metrics.opened += 1;
            if (entry.clicked_at) queueMetric.metrics.clicked += 1;
            if (entry.bounced_at) queueMetric.metrics.bounced += 1;
          }
        });

        const queueMetricsMap: Record<string, QueueMetrics> = {};
        Object.entries(queueAccumulator).forEach(([queueId, accumulator]) => {
          queueMetricsMap[queueId] = {
            ...accumulator.metrics,
            uniqueRecipients: accumulator.recipients.size,
          };
        });

        setSubscriberList(summaries);
        setSubscriberMetrics(subscriberMetricsMap);
        setQueueMetrics(queueMetricsMap);

        // Calculate rates - use sent emails as baseline if delivered data is missing
        const baselineForOpen = deliveredEmails > 0 ? deliveredEmails : totalEmailsSent;
        const baselineForClick = deliveredEmails > 0 ? deliveredEmails : totalEmailsSent;

        setEmailStats({
          totalSubscribers,
          activeSubscribers,
          totalEmailsSent,
          deliveryRate: totalEmailsSent > 0 ? (deliveredEmails / totalEmailsSent) * 100 : 0,
          openRate: baselineForOpen > 0 ? (openedEmails / baselineForOpen) * 100 : 0,
          clickRate: baselineForClick > 0 ? (clickedEmails / baselineForClick) * 100 : 0,
        });
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      toast({ title: 'Error', description: 'Failed to load email data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/admin/login');
        toast({ title: 'Unauthorized', description: 'Please log in to access the admin dashboard.', variant: 'destructive' });
        return;
      }

      setUser({ email: data.user.email });
      await loadEmailData();
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/admin/login');
      } else {
        setUser({ email: session.user.email });
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loadEmailData, navigate, toast]);

  const processEmailQueue = async (queueIds?: string[]) => {
    try {
      setProcessing(true);
      const { data, error } = await supabase.functions.invoke<{ processedItems?: number }>(
        'send-newsletter-emails',
        {
          method: 'POST',
          body: queueIds && queueIds.length ? { queueIds } : {},
        }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Processed ${data?.processedItems ?? 0} email queue items`,
      });

      await loadEmailData();
    } catch (error) {
      console.error('Error processing email queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to process email queue',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const processSpecificQueueItem = async (queueId: string) => {
    await processEmailQueue([queueId]);
  };


  const deleteQueueItem = async (queueId: string) => {
    if (!confirm('Delete this queue entry? This cannot be undone.')) {
      return;
    }
    try {
      setProcessing(true);
      const { error } = await supabase
        .from('email_queue')
        .delete()
        .eq('id', queueId);

      if (error) throw error;

      toast({ title: 'Queue item deleted', description: 'The email entry has been removed.' });
      await loadEmailData();
    } catch (error) {
      console.error(`Error deleting queue item ${queueId}:`, error);
      toast({ title: 'Error', description: 'Failed to delete this queue item.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    if (subscriberFilter === 'all') return subscriberList;
    return subscriberList.filter((subscriber) => (subscriber.status ?? 'active') === subscriberFilter);
  }, [subscriberList, subscriberFilter]);

  const totalSubscribers = subscriberList.length;
  const activeCount = subscriberList.filter((subscriber) => (subscriber.status ?? 'active') === 'active').length;
  const inactiveCount = subscriberList.filter((subscriber) => subscriber.status === 'inactive').length;
  const unsubscribedCount = subscriberList.filter((subscriber) => subscriber.status === 'unsubscribed').length;

  const headerMeta = useMemo(
    () => [
      {
        label: `${emailQueue.length} queue items`,
        variant: 'outline' as TagVariant,
      },
      {
        label: `Blog auto-send ${blogAutoSend ? 'on' : 'off'}`,
        variant: (blogAutoSend ? 'success' : 'warning') as TagVariant,
      },
      {
        label: `Project auto-send ${projectAutoSend ? 'on' : 'off'}`,
        variant: (projectAutoSend ? 'success' : 'warning') as TagVariant,
      },
      {
        label: `${totalSubscribers} subscribers`,
        variant: 'neutral' as TagVariant,
      },
    ],
    [blogAutoSend, emailQueue.length, projectAutoSend, totalSubscribers]
  );

  const overviewStats = useMemo(() => {
    if (!emailStats) return [] as Array<{ label: string; value: string | number; icon: JSX.Element }>;
    const formatPercent = (value: number) => `${value.toFixed(1)}%`;
    return [
      {
        label: 'Total Subscribers',
        value: emailStats.totalSubscribers,
        icon: <Users className="h-4 w-4 text-white/80" aria-hidden="true" />,
      },
      {
        label: 'Active Subscribers',
        value: emailStats.activeSubscribers,
        icon: <Users className="h-4 w-4 text-emerald-300" aria-hidden="true" />,
      },
      {
        label: 'Emails Sent',
        value: emailStats.totalEmailsSent,
        icon: <Mail className="h-4 w-4 text-sky-300" aria-hidden="true" />,
      },
      {
        label: 'Delivery Rate',
        value: formatPercent(emailStats.deliveryRate),
        icon: <TrendingUp className="h-4 w-4 text-purple-300" aria-hidden="true" />,
      },
      {
        label: 'Open Rate',
        value: formatPercent(emailStats.openRate),
        icon: <Eye className="h-4 w-4 text-amber-300" aria-hidden="true" />,
      },
      {
        label: 'Click Rate',
        value: formatPercent(emailStats.clickRate),
        icon: <Send className="h-4 w-4 text-blue-300" aria-hidden="true" />,
      },
    ];
  }, [emailStats]);

  const openPreview = async (request: PreviewRequest) => {
    try {
      setPreviewTitle('Email Preview');
      setPreviewLoading(true);
      setPreviewContent('');
      const siteUrl = window.location.origin;
      const resolveTable = (contentType: 'blog_post' | 'project') =>
        contentType === 'blog_post' ? 'posts' : 'projects';

      let contentRow: BlogPostRow | ProjectRow | null = null;
      let contentType: 'blog_post' | 'project';

      if (request.mode === 'queue') {
        contentType = request.queueItem.content_type;
        const table = resolveTable(contentType);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', request.queueItem.content_id)
          .single();

        if (error || !data) {
          toast({
            title: 'Error',
            description: 'Unable to load content for this queue item.',
            variant: 'destructive',
          });
          return;
        }

        contentRow = data as BlogPostRow | ProjectRow;
        setPreviewTitle(
          `${contentType === 'blog_post' ? 'Blog Post' : 'Project'} • ${contentRow.title}`
        );
      } else {
        contentType = request.contentType;
        const table = resolveTable(contentType);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          toast({
            title: 'Error',
            description: `No recent ${contentType === 'blog_post' ? 'blog posts' : 'projects'} found.`,
            variant: 'destructive',
          });
          return;
        }

        contentRow = data as BlogPostRow | ProjectRow;
        setPreviewTitle(
          `Latest ${contentType === 'blog_post' ? 'Blog Post' : 'Project'} • ${contentRow.title}`
        );
      }

      if (contentType === 'blog_post') {
        const blogContent = contentRow as BlogPostRow;
        const previewData: BlogPreviewPayload = {
          subscriberEmail: 'preview@example.com',
          unsubscribeToken: 'preview-token',
          siteUrl,
          post: blogContent,
        };
        setPreviewContent(generateBlogPreview(previewData));
      } else {
        const projectContent = contentRow as ProjectRow;
        const previewData: ProjectPreviewPayload = {
          subscriberEmail: 'preview@example.com',
          unsubscribeToken: 'preview-token',
          siteUrl,
          project: projectContent,
        };
        setPreviewContent(generateProjectPreview(previewData));
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate email preview',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderPreviewBody = () => {
    if (previewLoading) {
      return (
        <div className="flex items-center justify-center py-16 text-white/60">
          Generating preview…
        </div>
      );
    }

    if (!previewContent) {
      return (
        <div className="flex items-center justify-center py-12 text-white/55">
          Preview will appear here when generated.
        </div>
      );
    }

    return (
      <div className="border border-white/10 rounded-lg p-4 bg-black">
        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
      </div>
    );
  };

  const generateBlogPreview = (data: BlogPreviewPayload) => {
    const { post } = data;
    const publishedDate = new Date(post.published_date || post.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 48px 32px; text-align: center; border-bottom: 1px solid #1a1a1a;">
          <div style="font-size: 32px; font-weight: 700; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.02em;">imadlab</div>
          <div style="color: #888888; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">New Blog Post</div>
        </div>
        <div style="padding: 48px 32px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.02em;">${post.title}</h1>
          <div style="color: #666666; font-size: 13px; font-weight: 500; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${publishedDate}
          </div>
          <div style="color: #cccccc; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
            ${post.excerpt || 'Dive into the latest insights on data engineering, AI/ML, and cutting-edge web development techniques.'}
          </div>
          <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #333333 50%, transparent 100%); margin: 24px 0;"></div>
          <a href="#" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border: 2px solid #ffffff;">Read Article</a>
        </div>
        <div style="background-color: #0a0a0a; padding: 32px; text-align: center; border-top: 1px solid #1a1a1a;">
          <div style="color: #666666; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
            You're receiving this because you subscribed to imadlab updates.<br>
            Stay ahead with the latest in tech and development.
          </div>
          <a href="#" style="color: #888888; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Unsubscribe</a>
        </div>
      </div>
    `;
  };

  const generateProjectPreview = (data: ProjectPreviewPayload) => {
    const { project } = data;
    const techStack = (project.tech_tags ?? [])
      .map(
        (tech) =>
          `<span style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 11px; font-weight: 500; margin-right: 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #333333;">${tech}</span>`
      )
      .join('');
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 48px 32px; text-align: center; border-bottom: 1px solid #1a1a1a;">
          <div style="font-size: 32px; font-weight: 700; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.02em;">imadlab</div>
          <div style="color: #888888; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">New Project</div>
        </div>
        <div style="padding: 48px 32px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 24px; line-height: 1.2; letter-spacing: -0.02em;">${project.title}</h1>
          <div style="color: #cccccc; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
            ${project.description || 'Explore this new project showcasing innovative solutions and modern development practices.'}
          </div>
          ${techStack ? `
          <div style="margin-bottom: 40px;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Tech Stack</div>
            ${techStack}
          </div>
          ` : ''}
          <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #333333 50%, transparent 100%); margin: 32px 0;"></div>
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <a href="#" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border: 2px solid #ffffff; flex: 1; min-width: 140px; text-align: center;">View Project</a>
            ${project.repo_url ? '<a href="#" style="display: inline-block; background-color: transparent; color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border: 2px solid #333333; flex: 1; min-width: 140px; text-align: center;">View Code</a>' : ''}
          </div>
        </div>
        <div style="background-color: #0a0a0a; padding: 32px; text-align: center; border-top: 1px solid #1a1a1a;">
          <div style="color: #666666; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
            You're receiving this because you subscribed to imadlab updates.<br>
            Discover cutting-edge projects and technical innovations.
          </div>
          <a href="#" style="color: #888888; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Unsubscribe</a>
        </div>
      </div>
    `;
  };

  const getStatusBadge = (status: EmailQueueItem['status']) => {
    const variantMap = {
      pending: 'outline',
      processing: 'info',
      sent: 'success',
      failed: 'danger',
    } as const;
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <Tag
        variant={variantMap[status] ?? 'outline'}
        size="xs"
        className="uppercase tracking-wide text-[11px]"
      >
        {label}
      </Tag>
    );
  };

  const getSubscriberBadge = (status: SubscriberSummary['status'] | null | undefined) => {
    const value = status ?? 'active';
    const label = value.charAt(0).toUpperCase() + value.slice(1);
    const variantMap: Record<string, TagVariant> = {
      active: 'success',
      inactive: 'warning',
      unsubscribed: 'danger',
    };
    const variant = variantMap[value] ?? 'outline';
    return (
      <Tag
        variant={variant}
        size="xs"
        className="uppercase tracking-wide text-[11px]"
      >
        {label}
      </Tag>
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString();
  };

  if (user === null || loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <ContentLoader
          className="min-h-screen"
          text="Loading email dashboard..."
          variant="orbit"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container-site space-y-10 pb-24">
        <PageHeader
          eyebrow="Admin Suite"
          title="Email Management"
          description="Monitor automations, deliver campaigns, and keep the audience up to date."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Emails', href: '/admin/emails' },
          ]}
          meta={headerMeta}
          actions={
            <div className="flex flex-wrap gap-3">
              <Button
                variant="soft"
                onClick={loadEmailData}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="inverted"
                onClick={() => processEmailQueue()}
                disabled={processing}
              >
                <Send className={`mr-2 h-4 w-4 ${processing ? 'animate-pulse' : ''}`} />
                {processing ? 'Processing…' : 'Process Queue'}
              </Button>
            </div>
          }
        >
          {!!overviewStats.length && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          )}
        </PageHeader>
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.05] p-1">
            <TabsTrigger
              value="queue"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Email Queue
            </TabsTrigger>
            <TabsTrigger
              value="subscribers"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Subscribers
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            >
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="space-y-4">
            <Card className={SECTION_CARD_CLASS}>
              <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                <CardTitle className={SECTION_TITLE_CLASS}>Email Queue</CardTitle>
                <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                  Manage pending and processed email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                {emailQueue.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No email queue items found</p>
                ) : (
                  <div className="space-y-4">
                    {emailQueue.map((item) => {
                      const metric =
                        queueMetrics[item.id] ?? {
                          sent: 0,
                          delivered: 0,
                          opened: 0,
                          clicked: 0,
                          bounced: 0,
                          uniqueRecipients: 0,
                        };
                      const canSend = item.status === 'pending' || item.status === 'failed';
                      const buttonLabel = item.status === 'failed' ? 'Retry' : 'Send Now';
                      const targetRecipients =
                        canSend ? activeCount : (metric.uniqueRecipients || metric.sent || metric.delivered || 0);
                      const contentLabel = item.content_type === 'blog_post' ? 'Blog Post' : 'Project';
                      const displayTitle = item.content_title || 'Untitled';

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-col gap-2">
                                <h3 className="text-base font-semibold text-white">
                                  {displayTitle}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Tag variant="outline" size="xs" className="text-white/80">
                                    {contentLabel}
                                  </Tag>
                                  {getStatusBadge(item.status)}
                                  {item.retry_count > 0 && (
                                    <Tag variant="warning" size="xs" className="text-amber-100">
                                      Retry {item.retry_count}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm leading-relaxed text-white/70 space-y-1">
                                <div>Queued: {formatDate(item.created_at)}</div>
                                {item.sent_at && <div>Sent: {formatDate(item.sent_at)}</div>}
                                {item.error_message && (
                                  <div className="text-red-400">Error: {item.error_message}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="soft"
                                    size="sm"
                                    className="data-[state=open]:bg-white/15"
                                    onClick={() => openPreview({ mode: 'queue', queueItem: item })}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white border border-white/10">
                                  <DialogHeader>
                                    <DialogTitle>{previewTitle || 'Email Preview'}</DialogTitle>
                                    <DialogDescription className="text-white/60">
                                      Preview of the message generated for this queue item.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {renderPreviewBody()}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="soft"
                                size="sm"
                                className={`border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25 ${
                                  !canSend ? 'opacity-50 cursor-not-allowed hover:bg-emerald-500/20' : ''
                                }`}
                                disabled={processing || !canSend}
                                title={
                                  canSend
                                    ? 'Send this email now'
                                    : 'Only pending or failed items can be resent'
                                }
                                onClick={() => processSpecificQueueItem(item.id)}
                              >
                                <Send className={`w-4 h-4 mr-2 ${processing ? 'animate-pulse' : ''}`} />
                                {canSend
                                  ? buttonLabel
                                  : item.status === 'sent'
                                  ? 'Processed'
                                  : item.status === 'processing'
                                  ? 'Processing'
                                  : 'Queued'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={processing}
                                title="Remove this queue item"
                                onClick={() => deleteQueueItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs uppercase tracking-wide text-white/65">
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">Recipients</p>
                              <p className="text-base font-semibold text-white">{targetRecipients}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">Sent</p>
                              <p className="text-base font-semibold text-white">{metric.sent}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">Delivered</p>
                              <p className="text-base font-semibold text-white">{metric.delivered}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">Opened</p>
                              <p className="text-base font-semibold text-white">{metric.opened}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">Clicked</p>
                              <p className="text-base font-semibold text-white">{metric.clicked}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">Bounced</p>
                              <p className="text-base font-semibold text-white">{metric.bounced}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <Card className={SECTION_CARD_CLASS}>
              <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className={SECTION_TITLE_CLASS}>Subscribers</CardTitle>
                    <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                      Monitor list health and engagement performance
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-medium text-white/60">
                    <span>Total: {totalSubscribers}</span>
                    <span>Active: {activeCount}</span>
                    <span>Inactive: {inactiveCount}</span>
                    <span>Unsubscribed: {unsubscribedCount}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'inactive', 'unsubscribed'] as const).map((filter) => {
                    const isActive = subscriberFilter === filter;
                    const label = filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1);
                    return (
                      <Button
                        key={filter}
                        variant="outline"
                        size="sm"
                        onClick={() => setSubscriberFilter(filter)}
                        className={`border-white/20 transition-colors ${isActive ? FILTER_BUTTON_ACTIVE_CLASS : FILTER_BUTTON_INACTIVE_CLASS}`}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr className={METRIC_LABEL_CLASS}>
                        <th className="px-4 py-3 text-left font-medium">Subscriber</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Sent</th>
                        <th className="px-4 py-3 text-left font-medium">Delivered</th>
                        <th className="px-4 py-3 text-left font-medium">Opened</th>
                        <th className="px-4 py-3 text-left font-medium">Clicked</th>
                        <th className="px-4 py-3 text-left font-medium">Bounced</th>
                        <th className="px-4 py-3 text-left font-medium">Last Activity</th>
                        <th className="px-4 py-3 text-left font-medium">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-white/50">
                            No subscribers match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        filteredSubscribers.map((subscriber) => {
                          const metrics = subscriberMetrics[subscriber.email] ?? {
                            sent: 0,
                            delivered: 0,
                            opened: 0,
                            clicked: 0,
                            bounced: 0,
                            lastEvent: undefined,
                          };
                          const status = subscriber.status ?? 'active';
                          return (
                            <tr key={subscriber.email} className="text-sm text-white/80">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="text-base font-semibold text-white">{subscriber.email}</span>
                                  <span className="text-xs text-white/50">
                                    Last updated: {formatDate(subscriber.updated_at)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">{getSubscriberBadge(status)}</td>
                              <td className="px-4 py-3">{metrics.sent}</td>
                              <td className="px-4 py-3">{metrics.delivered}</td>
                              <td className="px-4 py-3">{metrics.opened}</td>
                              <td className="px-4 py-3">{metrics.clicked}</td>
                              <td className="px-4 py-3">{metrics.bounced}</td>
                              <td className="px-4 py-3">{formatDate(metrics.lastEvent)}</td>
                              <td className="px-4 py-3">{formatDate(subscriber.created_at)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className={SECTION_CARD_CLASS}>
              <CardHeader className={`${SECTION_HEADER_CLASS} space-y-1`}>
                <CardTitle className={SECTION_TITLE_CLASS}>Email Settings</CardTitle>
                <CardDescription className={SECTION_DESCRIPTION_CLASS}>
                  Configure email notification preferences and preview templates
                </CardDescription>
              </CardHeader>
              <CardContent className={`${SECTION_CONTENT_CLASS} pt-4`}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Auto-send Blog Post Emails</h3>
                      <p className="text-sm text-white/60 mt-1">Automatically send emails when new blog posts are published</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Switch
                          checked={blogAutoSend}
                          onCheckedChange={setBlogAutoSend}
                          aria-label="Toggle blog auto-send"
                        />
                        <span className="text-xs font-medium text-white/60">
                          {blogAutoSend ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="soft" 
                            size="sm"
                            onClick={() => openPreview({ mode: 'latest', contentType: 'blog_post' })}
                            disabled={previewLoading}
                            className="data-[state=open]:bg-white/15"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white border border-white/10">
                          <DialogHeader>
                            <DialogTitle>{previewTitle || 'Email Preview'}</DialogTitle>
                            <DialogDescription className="text-white/60">
                              Preview of how blog post notification emails will appear to subscribers
                            </DialogDescription>
                          </DialogHeader>
                          {renderPreviewBody()}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">Auto-send Project Emails</h3>
                      <p className="text-sm text-white/60 mt-1">Automatically send emails when new projects are published</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Switch
                          checked={projectAutoSend}
                          onCheckedChange={setProjectAutoSend}
                          aria-label="Toggle project auto-send"
                        />
                        <span className="text-xs font-medium text-white/60">
                          {projectAutoSend ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="soft" 
                            size="sm"
                            onClick={() => openPreview({ mode: 'latest', contentType: 'project' })}
                            disabled={previewLoading}
                            className="data-[state=open]:bg-white/15"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white border border-white/10">
                          <DialogHeader>
                            <DialogTitle>{previewTitle || 'Email Preview'}</DialogTitle>
                            <DialogDescription className="text-white/60">
                              Preview of how project notification emails will appear to subscribers
                            </DialogDescription>
                          </DialogHeader>
                          {renderPreviewBody()}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailDashboard;
