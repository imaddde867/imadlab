import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Send, Eye, Users, Mail, TrendingUp, Settings, Play } from 'lucide-react';

interface EmailQueueItem {
  id: string;
  content_type: 'blog_post' | 'project';
  content_id: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  scheduled_at: string;
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

interface EmailStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalEmailsSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        toast({ title: 'Unauthorized', description: 'Please log in to access the admin dashboard.', variant: 'destructive' });
      } else {
        setUser({ email: user.email });
        await loadEmailData();
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/admin/login');
      } else {
        setUser(session.user ? { email: session.user.email } : null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const loadEmailData = async () => {
    try {
      setLoading(true);
      
      // Load email queue
      const { data: queueData, error: queueError } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queueError) throw queueError;
      setEmailQueue(queueData || []);

      // Load email statistics
      const [subscribersResult, analyticsResult] = await Promise.all([
        supabase.from('newsletter_subscribers').select('status'),
        supabase.from('email_analytics').select('*')
      ]);

      if (subscribersResult.data && analyticsResult.data) {
        const subscribers = subscribersResult.data;
        const analytics = analyticsResult.data;

        const totalSubscribers = subscribers.length;
        const activeSubscribers = subscribers.filter(s => s.status === 'active').length;
        const totalEmailsSent = analytics.filter(a => a.sent_at).length;
        const deliveredEmails = analytics.filter(a => a.delivered_at).length;
        const openedEmails = analytics.filter(a => a.opened_at).length;
        const clickedEmails = analytics.filter(a => a.clicked_at).length;

        setEmailStats({
          totalSubscribers,
          activeSubscribers,
          totalEmailsSent,
          deliveryRate: totalEmailsSent > 0 ? (deliveredEmails / totalEmailsSent) * 100 : 0,
          openRate: deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0,
          clickRate: deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0,
        });
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      toast({ title: 'Error', description: 'Failed to load email data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const processEmailQueue = async () => {
    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('send-newsletter-emails', {
        method: 'POST',
        body: {}
      });

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: `Processed ${data.processedItems || 0} email queue items` 
      });
      
      await loadEmailData();
    } catch (error) {
      console.error('Error processing email queue:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to process email queue', 
        variant: 'destructive' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const previewEmail = async (contentType: 'blog_post' | 'project') => {
    try {
      setPreviewLoading(true);
      
      // Get the latest content of the specified type
      const tableName = contentType === 'blog_post' ? 'posts' : 'projects';
      const { data: content, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !content) {
        toast({ 
          title: 'Error', 
          description: `No ${contentType.replace('_', ' ')} found for preview`, 
          variant: 'destructive' 
        });
        return;
      }

      // Generate preview HTML (simplified version)
      const sampleData = {
        subscriberEmail: 'preview@example.com',
        unsubscribeToken: 'preview-token',
        siteUrl: window.location.origin,
        [contentType === 'blog_post' ? 'post' : 'project']: {
          ...content,
          publishedDate: content.published_date || content.created_at,
          techTags: content.tech_tags || [],
          tags: content.tags || []
        }
      };

      // Create a simple preview HTML
      const previewHtml = contentType === 'blog_post' 
        ? generateBlogPreview(sampleData)
        : generateProjectPreview(sampleData);
      
      setPreviewContent(previewHtml);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to generate email preview', 
        variant: 'destructive' 
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const generateBlogPreview = (data: any) => {
    const post = data.post;
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">imadlab</h1>
          <p style="margin: 10px 0 0 0;">New Blog Post Published</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a202c; font-size: 24px; margin: 0 0 16px 0;">${post.title}</h2>
          <p style="color: #4a5568; margin-bottom: 20px;">${post.excerpt || 'Check out this new blog post...'}</p>
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px;">Read Full Post</a>
        </div>
      </div>
    `;
  };

  const generateProjectPreview = (data: any) => {
    const project = data.project;
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">imadlab</h1>
          <p style="margin: 10px 0 0 0;">New Project Showcase</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1a202c; font-size: 24px; margin: 0 0 20px 0;">${project.title}</h2>
          <p style="color: #4a5568; margin-bottom: 30px;">${project.description || 'Check out this new project...'}</p>
          <a href="#" style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; text-decoration: none; padding: 16px 24px; border-radius: 8px; margin-right: 16px;">View Project</a>
          ${project.repo_url ? '<a href="#" style="display: inline-block; background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; text-decoration: none; padding: 16px 24px; border-radius: 8px;">View Code</a>' : ''}
        </div>
      </div>
    `;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      sent: 'default',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (user === null || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60 text-xl">Loading email dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Email Management</h1>
          <div className="flex gap-4">
            <Button onClick={loadEmailData} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={processEmailQueue} disabled={processing}>
              <Send className={`w-4 h-4 mr-2 ${processing ? 'animate-pulse' : ''}`} />
              {processing ? 'Processing...' : 'Process Queue'}
            </Button>
          </div>
        </div>

        {emailStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-400 mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Total Subscribers</p>
                    <p className="text-2xl font-bold">{emailStats.totalSubscribers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-green-400 mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Active</p>
                    <p className="text-2xl font-bold">{emailStats.activeSubscribers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-purple-400 mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Emails Sent</p>
                    <p className="text-2xl font-bold">{emailStats.totalEmailsSent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-yellow-400 mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Delivery Rate</p>
                    <p className="text-2xl font-bold">{emailStats.deliveryRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 text-orange-400 mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Open Rate</p>
                    <p className="text-2xl font-bold">{emailStats.openRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-red-400 mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Click Rate</p>
                    <p className="text-2xl font-bold">{emailStats.clickRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="queue">Email Queue</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Email Queue</CardTitle>
                <CardDescription>
                  Manage pending and processed email notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailQueue.length === 0 ? (
                  <p className="text-white/60 text-center py-8">No email queue items found</p>
                ) : (
                  <div className="space-y-4">
                    {emailQueue.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {item.content_type.replace('_', ' ')}
                            </Badge>
                            {getStatusBadge(item.status)}
                            {item.retry_count > 0 && (
                              <Badge variant="secondary">
                                Retry {item.retry_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/80">
                            Scheduled: {formatDate(item.scheduled_at)}
                          </p>
                          {item.sent_at && (
                            <p className="text-sm text-white/60">
                              Sent: {formatDate(item.sent_at)}
                            </p>
                          )}
                          {item.error_message && (
                            <p className="text-sm text-red-400 mt-1">
                              Error: {item.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure email notification preferences and preview templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-send Blog Post Emails</h3>
                      <p className="text-sm text-white/60">Automatically send emails when new blog posts are published</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => previewEmail('blog_post')}
                            disabled={previewLoading}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-black">Blog Post Email Preview</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Preview of how blog post notification emails will appear to subscribers
                            </DialogDescription>
                          </DialogHeader>
                          <div 
                            className="border rounded-lg p-4 bg-gray-50"
                            dangerouslySetInnerHTML={{ __html: previewContent }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-send Project Emails</h3>
                      <p className="text-sm text-white/60">Automatically send emails when new projects are published</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => previewEmail('project')}
                            disabled={previewLoading}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-black">Project Email Preview</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Preview of how project notification emails will appear to subscribers
                            </DialogDescription>
                          </DialogHeader>
                          <div 
                            className="border rounded-lg p-4 bg-gray-50"
                            dangerouslySetInnerHTML={{ __html: previewContent }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <h3 className="font-medium mb-2">Manual Email Actions</h3>
                    <p className="text-sm text-white/60 mb-4">Send test emails or manually trigger newsletter sends</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={processEmailQueue}
                        disabled={processing}
                      >
                        <Send className={`w-4 h-4 mr-2 ${processing ? 'animate-pulse' : ''}`} />
                        {processing ? 'Processing...' : 'Process Pending Emails'}
                      </Button>
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