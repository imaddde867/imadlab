import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Send, Eye, Users, Mail, TrendingUp } from 'lucide-react';

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
      
      // Debug: Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('User error:', userError);
      
      // Load email queue
      const { data: queueData, error: queueError } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (queueError) throw queueError;
      setEmailQueue((queueData as EmailQueueItem[]) || []);

      // Load email statistics
      const [subscribersResult, analyticsResult] = await Promise.all([
        supabase.from('newsletter_subscribers').select('status, email'),
        supabase.from('email_analytics').select('*')
      ]);

      console.log('Subscribers query result:', subscribersResult);
      console.log('Subscribers data:', subscribersResult.data);
      console.log('Subscribers error:', subscribersResult.error);

      if (subscribersResult.data && analyticsResult.data) {
        const subscribers = subscribersResult.data;
        const analytics = analyticsResult.data;

        console.log('Subscribers array:', subscribers);
        console.log('Subscribers length:', subscribers.length);

        const totalSubscribers = subscribers.length;
        // Count active subscribers, treating null/undefined status as active for backward compatibility
        const activeSubscribers = subscribers.filter(s => !s.status || s.status === 'active').length;
        
        console.log('Total subscribers:', totalSubscribers);
        console.log('Active subscribers:', activeSubscribers);
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
          publishedDate: (content as any).published_date || content.created_at,
          techTags: (content as any).tech_tags || [],
          tags: (content as any).tags || []
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
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 48px 32px; text-align: center; border-bottom: 1px solid #1a1a1a;">
          <div style="font-size: 32px; font-weight: 700; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.02em;">imadlab</div>
          <div style="color: #888888; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">New Blog Post</div>
        </div>
        <div style="padding: 48px 32px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.02em;">${post.title}</h1>
          <div style="color: #666666; font-size: 13px; font-weight: 500; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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

  const generateProjectPreview = (data: any) => {
    const project = data.project;
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
          ${project.tech_tags && project.tech_tags.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Tech Stack</div>
            ${project.tech_tags.map((tech: string) => `<span style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 11px; font-weight: 500; margin-right: 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #333333;">${tech}</span>`).join('')}
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
            <Button onClick={loadEmailData} variant="outline" disabled={loading} className="bg-white text-black border-white hover:bg-white/90">
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
                  <Users className="w-4 h-4 text-white mr-2" />
                  <div>
                    <p className="text-sm text-white/60">Total Subscribers</p>
                    <p className="text-2xl font-bold text-white">{emailStats.totalSubscribers}</p>
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
                    <p className="text-2xl font-bold text-white">{emailStats.activeSubscribers}</p>
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
                    <p className="text-2xl font-bold text-white">{emailStats.totalEmailsSent}</p>
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
                    <p className="text-2xl font-bold text-white">{emailStats.deliveryRate.toFixed(1)}%</p>
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
                    <p className="text-2xl font-bold text-white">{emailStats.openRate.toFixed(1)}%</p>
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
                    <p className="text-2xl font-bold text-white">{emailStats.clickRate.toFixed(1)}%</p>
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
                <CardTitle className="text-white">Email Queue</CardTitle>
                <CardDescription className="text-white/60">
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
                            <Badge variant="outline" className="text-white border-white/20">
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
                <CardTitle className="text-white">Email Settings</CardTitle>
                <CardDescription className="text-white/60">
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
                            <DialogTitle className="text-white">Blog Post Email Preview</DialogTitle>
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
                            <DialogTitle className="text-white">Project Email Preview</DialogTitle>
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