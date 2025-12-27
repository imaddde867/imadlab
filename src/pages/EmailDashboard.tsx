import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Tag } from '@/components/ui/tag';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ContentLoader } from '@/components/ui/LoadingStates';
import { RefreshCw, Send, Eye, Users, Mail, TrendingUp, Trash2, Copy, RotateCw } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { POST_TITLE_SELECT, PROJECT_TITLE_SELECT } from '@/lib/content-selects';

type TagVariant =
  | 'default'
  | 'subtle'
  | 'outline'
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

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

type SubscriberStatus = 'active' | 'inactive' | 'unsubscribed';

const getAnalyticsSortTime = (entry: EmailAnalyticsRow) => {
  const timestamps = [
    entry.clicked_at,
    entry.opened_at,
    entry.delivered_at,
    entry.sent_at,
    entry.bounced_at,
    entry.unsubscribed_at,
    entry.created_at,
  ]
    .filter(Boolean)
    .map((value) => new Date(value as string).getTime());
  return timestamps.length ? Math.max(...timestamps) : 0;
};

const getAnalyticsStatus = (entry: EmailAnalyticsRow): { label: string; variant: TagVariant } => {
  if (entry.unsubscribed_at) return { label: 'Unsubscribed', variant: 'warning' };
  if (entry.bounced_at) return { label: 'Bounced', variant: 'danger' };
  if (entry.clicked_at) return { label: 'Clicked', variant: 'accent' };
  if (entry.opened_at) return { label: 'Opened', variant: 'info' };
  if (entry.delivered_at) return { label: 'Delivered', variant: 'success' };
  if (entry.sent_at) return { label: 'Sent', variant: 'neutral' };
  return { label: 'Queued', variant: 'outline' };
};

const getAnalyticsTimestamp = (entry: EmailAnalyticsRow) =>
  entry.clicked_at ??
  entry.opened_at ??
  entry.delivered_at ??
  entry.sent_at ??
  entry.bounced_at ??
  entry.unsubscribed_at ??
  entry.created_at ??
  null;

const SECTION_CARD_CLASS = 'rounded-xl border border-white/10 bg-white/[0.03]';
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
  const [subscriberFilter, setSubscriberFilter] = useState<
    'all' | 'active' | 'inactive' | 'unsubscribed'
  >('all');
  const [subscriberQuery, setSubscriberQuery] = useState('');
  const [subscriberUpdating, setSubscriberUpdating] = useState(false);
  const [queueMetrics, setQueueMetrics] = useState<Record<string, QueueMetrics>>({});
  const [queueRecipients, setQueueRecipients] = useState<Record<string, EmailAnalyticsRow[]>>({});
  const [subscriberHistory, setSubscriberHistory] = useState<Record<string, EmailAnalyticsRow[]>>({});
  const [blogAutoSend, setBlogAutoSend] = useState(false);
  const [projectAutoSend, setProjectAutoSend] = useState(false);

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
        .filter((item) => item.content_type === 'blog_post')
        .map((item) => item.content_id);
      const projectIds = normalizedQueue
        .filter((item) => item.content_type === 'project')
        .map((item) => item.content_id);

      const [blogTitles, projectTitles] = await Promise.all([
        blogIds.length > 0
          ? supabase.from('posts').select(POST_TITLE_SELECT).in('id', blogIds)
          : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
        projectIds.length > 0
          ? supabase.from('projects').select(PROJECT_TITLE_SELECT).in('id', projectIds)
          : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
      ]);

      // Create title lookup maps
      const blogTitleMap = new Map((blogTitles.data || []).map((b) => [b.id, b.title]));
      const projectTitleMap = new Map((projectTitles.data || []).map((p) => [p.id, p.title]));

      // Add titles to queue items
      const queueWithTitles = normalizedQueue.map((item) => ({
        ...item,
        content_title:
          item.content_type === 'blog_post'
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
        const subscribers = subscriberRows as Array<
          Pick<NewsletterSubscriberRow, 'status' | 'email' | 'created_at' | 'updated_at'>
        >;
        const analytics = analyticsRows as EmailAnalyticsRow[];

        const totalSubscribers = subscribers.length;
        const activeSubscribers = subscribers.filter(
          (subscriber) => !subscriber.status || subscriber.status === 'active'
        ).length;
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
        const queueAccumulator: Record<string, { metrics: QueueMetrics; recipients: Set<string> }> =
          {};
        const queueRecipientsMap: Record<string, EmailAnalyticsRow[]> = {};
        const subscriberHistoryMap: Record<string, EmailAnalyticsRow[]> = {};

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
          if (!subscriberHistoryMap[key]) {
            subscriberHistoryMap[key] = [];
          }
          subscriberHistoryMap[key].push(entry);

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
            if (
              !subscriberMetric.lastEvent ||
              latest > new Date(subscriberMetric.lastEvent).getTime()
            ) {
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

            if (!queueRecipientsMap[entry.email_queue_id]) {
              queueRecipientsMap[entry.email_queue_id] = [];
            }
            queueRecipientsMap[entry.email_queue_id].push(entry);
          }
        });

        const queueMetricsMap: Record<string, QueueMetrics> = {};
        Object.entries(queueAccumulator).forEach(([queueId, accumulator]) => {
          queueMetricsMap[queueId] = {
            ...accumulator.metrics,
            uniqueRecipients: accumulator.recipients.size,
          };
        });

        const sortByRecent = (a: EmailAnalyticsRow, b: EmailAnalyticsRow) =>
          getAnalyticsSortTime(b) - getAnalyticsSortTime(a);
        Object.values(queueRecipientsMap).forEach((entries) => entries.sort(sortByRecent));
        Object.values(subscriberHistoryMap).forEach((entries) => entries.sort(sortByRecent));

        setSubscriberList(summaries);
        setSubscriberMetrics(subscriberMetricsMap);
        setQueueMetrics(queueMetricsMap);
        setQueueRecipients(queueRecipientsMap);
        setSubscriberHistory(subscriberHistoryMap);

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
        toast({
          title: 'Unauthorized',
          description: 'Please log in to access the admin dashboard.',
          variant: 'destructive',
        });
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
      const { error } = await supabase.from('email_queue').delete().eq('id', queueId);

      if (error) throw error;

      toast({ title: 'Queue item deleted', description: 'The email entry has been removed.' });
      await loadEmailData();
    } catch (error) {
      console.error(`Error deleting queue item ${queueId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete this queue item.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const requeueEmail = async (item: EmailQueueItem) => {
    if (!confirm('Re-queue this email for another send to active subscribers?')) {
      return;
    }
    try {
      setProcessing(true);
      const { error } = await supabase.from('email_queue').insert([
        {
          content_id: item.content_id,
          content_type: item.content_type,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast({ title: 'Queued', description: 'A new send has been added to the queue.' });
      await loadEmailData();
    } catch (error) {
      console.error('Error re-queueing email:', error);
      toast({
        title: 'Error',
        description: 'Failed to re-queue this email.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const updateSubscriberStatus = async (email: string, status: SubscriberStatus) => {
    try {
      setSubscriberUpdating(true);
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('email', email);

      if (error) throw error;

      toast({ title: 'Subscriber updated', description: `${email} set to ${status}.` });
      await loadEmailData();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscriber status.',
        variant: 'destructive',
      });
    } finally {
      setSubscriberUpdating(false);
    }
  };

  const deleteSubscriber = async (email: string) => {
    if (!confirm(`Remove ${email} from subscribers? This cannot be undone.`)) {
      return;
    }
    try {
      setSubscriberUpdating(true);
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('email', email);

      if (error) throw error;

      toast({ title: 'Subscriber removed', description: `${email} has been deleted.` });
      await loadEmailData();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber.',
        variant: 'destructive',
      });
    } finally {
      setSubscriberUpdating(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    const normalizedQuery = subscriberQuery.trim().toLowerCase();
    const filteredByStatus =
      subscriberFilter === 'all'
        ? subscriberList
        : subscriberList.filter(
            (subscriber) => (subscriber.status ?? 'active') === subscriberFilter
          );
    if (!normalizedQuery) return filteredByStatus;
    return filteredByStatus.filter((subscriber) =>
      subscriber.email.toLowerCase().includes(normalizedQuery)
    );
  }, [subscriberList, subscriberFilter, subscriberQuery]);

  const totalSubscribers = subscriberList.length;
  const activeCount = subscriberList.filter(
    (subscriber) => (subscriber.status ?? 'active') === 'active'
  ).length;
  const inactiveCount = subscriberList.filter(
    (subscriber) => subscriber.status === 'inactive'
  ).length;
  const unsubscribedCount = subscriberList.filter(
    (subscriber) => subscriber.status === 'unsubscribed'
  ).length;
  const queueLookup = useMemo(
    () => new Map(emailQueue.map((item) => [item.id, item])),
    [emailQueue]
  );

  const headerMeta = useMemo(
    () => [
      {
        label: 'Queue items',
        value: emailQueue.length,
      },
      {
        label: 'Blog auto-send',
        value: blogAutoSend ? 'On' : 'Off',
      },
      {
        label: 'Project auto-send',
        value: projectAutoSend ? 'On' : 'Off',
      },
      {
        label: 'Subscribers',
        value: totalSubscribers,
      },
    ],
    [blogAutoSend, emailQueue.length, projectAutoSend, totalSubscribers]
  );

  const overviewStats = useMemo(() => {
    if (!emailStats)
      return [] as Array<{ label: string; value: string | number; icon: JSX.Element }>;
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

  const handleCopyPreview = async () => {
    if (!previewContent) return;
    try {
      await navigator.clipboard.writeText(previewContent);
      toast({ title: 'Copied', description: 'Preview HTML copied to clipboard.' });
    } catch (error) {
      console.error('Error copying preview HTML:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy preview HTML.',
        variant: 'destructive',
      });
    }
  };

  const renderPreviewActions = () => (
    <div className="flex justify-end">
      <Button
        variant="soft"
        size="sm"
        onClick={handleCopyPreview}
        disabled={!previewContent}
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy HTML
      </Button>
    </div>
  );

  const generateBlogPreview = (data: BlogPreviewPayload) => {
    const { post } = data;
    const publishedDate = new Date(post.published_date || post.created_at).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
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
          `<span style="display: inline-block; background-color: #f3f4f6; color: #111827; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-right: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb;">${tech}</span>`
      )
      .join('');
    const imageBlock = project.image_url
      ? `<img src="${project.image_url}" alt="${project.title}" style="width: 100%; height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e5e7eb; display: block;" />`
      : '';
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; color: #0f172a;">
        <div style="padding: 28px 32px 16px; text-align: left; border-bottom: 1px solid #eef2f6;">
          <div style="font-size: 16px; font-weight: 700; color: #111827; letter-spacing: 0.2em; text-transform: uppercase;">imadlab</div>
          <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 8px;">New Project</div>
        </div>
        <div style="padding: 28px 32px 32px;">
          ${imageBlock}
          <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 10px; line-height: 1.3; letter-spacing: -0.01em;">${project.title}</h1>
          <div style="color: #4b5563; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
            ${project.description || 'Explore this new project showcasing innovative solutions and modern development practices.'}
          </div>
          ${
            techStack
              ? `
          <div style="margin-bottom: 24px;">
            <div style="color: #6b7280; font-size: 11px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.12em;">Tech Stack</div>
            ${techStack}
          </div>
          `
              : ''
          }
          <div style="height: 1px; background-color: #eef2f6; margin: 20px 0;"></div>
          <div style="margin-top: 12px;">
            <a href="#" style="display: inline-block; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600; font-size: 13px; letter-spacing: 0.02em; text-align: center; margin-right: 12px; margin-bottom: 12px; background-color: #111827; color: #ffffff; border: 1px solid #111827;">View Project</a>
            ${project.repo_url ? '<a href="#" style="display: inline-block; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600; font-size: 13px; letter-spacing: 0.02em; text-align: center; margin-right: 12px; margin-bottom: 12px; background-color: #ffffff; color: #111827; border: 1px solid #d1d5db;">View Code</a>' : ''}
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #eef2f6;">
          <div style="color: #6b7280; font-size: 12px; line-height: 1.6; margin-bottom: 10px;">
            You're receiving this because you subscribed to imadlab updates.<br>
            Discover cutting-edge projects and technical innovations.
          </div>
          <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 600;">Unsubscribe</a>
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
      <Tag variant={variant} size="xs" className="uppercase tracking-wide text-[11px]">
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
        <ContentLoader className="min-h-screen" text="Loading email dashboard..." variant="orbit" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container-site space-y-10 pb-24">
        <PageHeader
          eyebrow="Admin"
          title="Email Management"
          description="Monitor automations and manage subscribers."
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Emails', href: '/admin/emails' },
          ]}
          meta={headerMeta}
          actions={
            <div className="flex flex-wrap gap-3">
              <Button variant="soft" onClick={loadEmailData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="inverted" onClick={() => processEmailQueue()} disabled={processing}>
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
                  className="rounded-xl border border-white/10 bg-white/[0.03] shadow-none"
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
                      const metric = queueMetrics[item.id] ?? {
                        sent: 0,
                        delivered: 0,
                        opened: 0,
                        clicked: 0,
                        bounced: 0,
                        uniqueRecipients: 0,
                      };
                      const canSend = item.status === 'pending' || item.status === 'failed';
                      const buttonLabel = item.status === 'failed' ? 'Retry' : 'Send Now';
                      const targetRecipients = canSend
                        ? activeCount
                        : metric.uniqueRecipients || metric.sent || metric.delivered || 0;
                      const contentLabel =
                        item.content_type === 'blog_post' ? 'Blog Post' : 'Project';
                      const displayTitle = item.content_title || 'Untitled';
                      const recipients = queueRecipients[item.id] ?? [];
                      const canRequeue = item.status === 'sent';

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
                                {renderPreviewActions()}
                                {renderPreviewBody()}
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="soft" size="sm">
                                  <Users className="w-4 h-4 mr-2" />
                                  Recipients{recipients.length ? ` (${recipients.length})` : ''}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white border border-white/10">
                                <DialogHeader>
                                  <DialogTitle>Recipients • {displayTitle}</DialogTitle>
                                  <DialogDescription className="text-white/60">
                                    Delivery and engagement per recipient.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                                  <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-white/5">
                                      <tr className={METRIC_LABEL_CLASS}>
                                        <th className="px-4 py-3 text-left font-medium">
                                          Recipient
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                          Status
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                          Last activity
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                      {recipients.length === 0 ? (
                                        <tr>
                                          <td
                                            colSpan={3}
                                            className="px-4 py-8 text-center text-white/50"
                                          >
                                            No recipients recorded yet.
                                          </td>
                                        </tr>
                                      ) : (
                                        recipients.map((entry) => {
                                          const status = getAnalyticsStatus(entry);
                                          const lastEvent = getAnalyticsTimestamp(entry);
                                          return (
                                            <tr
                                              key={`${entry.subscriber_email}-${entry.id}`}
                                              className="text-sm text-white/80"
                                            >
                                              <td className="px-4 py-3">
                                                {entry.subscriber_email}
                                              </td>
                                              <td className="px-4 py-3">
                                                <Tag
                                                  variant={status.variant}
                                                  size="xs"
                                                  className="uppercase tracking-wide text-[11px]"
                                                >
                                                  {status.label}
                                                </Tag>
                                              </td>
                                              <td className="px-4 py-3">
                                                {formatDate(lastEvent)}
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {canRequeue && (
                              <Button
                                variant="soft"
                                size="sm"
                                disabled={processing}
                                onClick={() => requeueEmail(item)}
                              >
                                <RotateCw className="w-4 h-4 mr-2" />
                                Requeue
                              </Button>
                            )}
                            <Button
                              variant="soft"
                              size="sm"
                              className={`border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25 ${
                                  !canSend
                                    ? 'opacity-50 cursor-not-allowed hover:bg-emerald-500/20'
                                    : ''
                                }`}
                                disabled={processing || !canSend}
                                title={
                                  canSend
                                    ? 'Send this email now'
                                    : 'Only pending or failed items can be resent'
                                }
                                onClick={() => processSpecificQueueItem(item.id)}
                              >
                                <Send
                                  className={`w-4 h-4 mr-2 ${processing ? 'animate-pulse' : ''}`}
                                />
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
                              <p className="text-[11px] uppercase tracking-widest text-white/60">
                                Recipients
                              </p>
                              <p className="text-base font-semibold text-white">
                                {targetRecipients}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">
                                Sent
                              </p>
                              <p className="text-base font-semibold text-white">{metric.sent}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">
                                Delivered
                              </p>
                              <p className="text-base font-semibold text-white">
                                {metric.delivered}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">
                                Opened
                              </p>
                              <p className="text-base font-semibold text-white">{metric.opened}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">
                                Clicked
                              </p>
                              <p className="text-base font-semibold text-white">{metric.clicked}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-widest text-white/60">
                                Bounced
                              </p>
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
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'active', 'inactive', 'unsubscribed'] as const).map((filter) => {
                      const isActive = subscriberFilter === filter;
                      const label =
                        filter === 'all'
                          ? 'All'
                          : filter.charAt(0).toUpperCase() + filter.slice(1);
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
                  <div className="w-full max-w-xs">
                    <Input
                      value={subscriberQuery}
                      onChange={(event) => setSubscriberQuery(event.target.value)}
                      placeholder="Search subscribers..."
                      className="h-9 bg-black/40 border-white/10 text-white/90 placeholder:text-white/40"
                    />
                  </div>
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
                        <th className="px-4 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-white/50">
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
                          const status = (subscriber.status ?? 'active') as SubscriberStatus;
                          const history = subscriberHistory[subscriber.email] ?? [];
                          const latestEntry = history[0];
                          const latestQueue = latestEntry?.email_queue_id
                            ? queueLookup.get(latestEntry.email_queue_id)
                            : undefined;
                          const latestLabel = latestQueue
                            ? `${latestQueue.content_title || 'Untitled'} · ${
                                latestQueue.content_type === 'blog_post' ? 'Blog' : 'Project'
                              }`
                            : '—';
                          return (
                            <tr key={subscriber.email} className="text-sm text-white/80">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="text-base font-semibold text-white">
                                    {subscriber.email}
                                  </span>
                                  <span className="text-xs text-white/50">Last email: {latestLabel}</span>
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
                              <td className="px-4 py-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="soft" size="sm">
                                      Manage
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white border border-white/10">
                                    <DialogHeader>
                                      <DialogTitle>Subscriber</DialogTitle>
                                      <DialogDescription className="text-white/60">
                                        Manage status and review delivery history.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                          <div>
                                            <p className="text-sm text-white/60">Email</p>
                                            <p className="text-base font-semibold text-white">
                                              {subscriber.email}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            {getSubscriberBadge(status)}
                                            <select
                                              value={status}
                                              onChange={(event) =>
                                                updateSubscriberStatus(
                                                  subscriber.email,
                                                  event.target.value as SubscriberStatus
                                                )
                                              }
                                              className="rounded-md border border-white/10 bg-black/60 px-2 py-1 text-xs text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
                                              disabled={subscriberUpdating}
                                            >
                                              <option value="active">Active</option>
                                              <option value="inactive">Inactive</option>
                                              <option value="unsubscribed">Unsubscribed</option>
                                            </select>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() => deleteSubscriber(subscriber.email)}
                                              disabled={subscriberUpdating}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm font-semibold text-white">
                                          Email history
                                        </p>
                                        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                                          <table className="min-w-full divide-y divide-white/10">
                                            <thead className="bg-white/5">
                                              <tr className={METRIC_LABEL_CLASS}>
                                                <th className="px-4 py-3 text-left font-medium">
                                                  Content
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                  Status
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium">
                                                  Last activity
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                              {history.length === 0 ? (
                                                <tr>
                                                  <td
                                                    colSpan={3}
                                                    className="px-4 py-8 text-center text-white/50"
                                                  >
                                                    No email history for this subscriber yet.
                                                  </td>
                                                </tr>
                                              ) : (
                                                history.map((entry) => {
                                                  const statusMeta = getAnalyticsStatus(entry);
                                                  const lastEvent = getAnalyticsTimestamp(entry);
                                                  const entryQueue = entry.email_queue_id
                                                    ? queueLookup.get(entry.email_queue_id)
                                                    : undefined;
                                                  const entryTitle = entryQueue?.content_title
                                                    ? entryQueue.content_title
                                                    : entry.email_queue_id
                                                      ? `Queue ${entry.email_queue_id.slice(0, 6)}`
                                                      : 'Manual';
                                                  const entryType = entryQueue
                                                    ? entryQueue.content_type === 'blog_post'
                                                      ? 'Blog Post'
                                                      : 'Project'
                                                    : 'Email';
                                                  return (
                                                    <tr
                                                      key={`${entry.subscriber_email}-${entry.id}`}
                                                      className="text-sm text-white/80"
                                                    >
                                                      <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                          <span className="text-white">
                                                            {entryTitle}
                                                          </span>
                                                          <span className="text-xs text-white/50">
                                                            {entryType}
                                                          </span>
                                                        </div>
                                                      </td>
                                                      <td className="px-4 py-3">
                                                        <Tag
                                                          variant={statusMeta.variant}
                                                          size="xs"
                                                          className="uppercase tracking-wide text-[11px]"
                                                        >
                                                          {statusMeta.label}
                                                        </Tag>
                                                      </td>
                                                      <td className="px-4 py-3">
                                                        {formatDate(lastEvent)}
                                                      </td>
                                                    </tr>
                                                  );
                                                })
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </td>
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
                      <h3 className="text-base font-semibold text-white">
                        Auto-send Blog Post Emails
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        Automatically send emails when new blog posts are published
                      </p>
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
                            onClick={() =>
                              openPreview({ mode: 'latest', contentType: 'blog_post' })
                            }
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
                              Preview of how blog post notification emails will appear to
                              subscribers
                            </DialogDescription>
                          </DialogHeader>
                          {renderPreviewActions()}
                          {renderPreviewBody()}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Auto-send Project Emails
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        Automatically send emails when new projects are published
                      </p>
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
                          {renderPreviewActions()}
                          {renderPreviewBody()}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-base font-semibold text-white">Template source</h3>
                    <p className="text-sm text-white/60 mt-1">
                      Edit email templates in <span className="font-mono">supabase/functions/shared/email-templates.ts</span>.
                      Copy HTML from previews above for quick edits.
                    </p>
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
