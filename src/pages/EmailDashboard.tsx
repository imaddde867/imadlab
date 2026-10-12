import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type ContentType = 'blog_post' | 'project';
type Item = { id: string; type: ContentType; title: string; date: string };
type QueueRow = {
  id: string;
  content_id: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
};
type Subscriber = { email: string; status: string; created_at: string };

const fmt = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

const EmailDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  // The item to confirm, plus the failed queue row when this is a retry.
  const [confirmItem, setConfirmItem] = useState<{ item: Item; failed: QueueRow | null } | null>(
    null
  );
  const [removeSub, setRemoveSub] = useState<Subscriber | null>(null);
  const [preview, setPreview] = useState<{ title: string; html: string } | null>(null);

  const load = useCallback(async () => {
    const [posts, projects, q, s] = await Promise.all([
      supabase.from('posts').select('id,title,published_date'),
      supabase.from('projects').select('id,title,created_at').eq('published', true),
      supabase
        .from('email_queue')
        .select('id,content_id,status,sent_at,error_message')
        .order('created_at', { ascending: false }),
      supabase
        .from('newsletter_subscribers')
        .select('email,status,created_at')
        .order('created_at', { ascending: false }),
    ]);
    const err = posts.error || projects.error || q.error || s.error;
    if (err) toast({ title: 'Failed to load', description: err.message, variant: 'destructive' });
    const merged: Item[] = [
      ...(posts.data ?? []).map((p) => ({
        id: p.id,
        type: 'blog_post' as const,
        title: p.title,
        date: p.published_date,
      })),
      ...(projects.data ?? []).map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        date: p.created_at,
      })),
    ].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    setItems(merged);
    setQueue((q.data ?? []) as QueueRow[]);
    setSubs((s.data ?? []) as Subscriber[]);
  }, [toast]);

  useEffect(() => {
    // Client-side guard only; the data itself is protected by admin-only RLS.
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/admin/login');
        return;
      }
      load();
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) navigate('/admin/login');
    });
    return () => listener.subscription.unsubscribe();
  }, [load, navigate]);

  const activeCount = subs.filter((s) => s.status === 'active').length;

  const invokeSend = async (contentId: string, queueId: string) => {
    setBusyId(contentId);
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-emails', {
        body: { queueIds: [queueId] },
      });
      const result = data?.results?.[0];
      if (error || !result || result.error) {
        throw new Error(error?.message || result?.error || data?.message || 'Send failed');
      }
      toast({ title: `Sent to ${result.successCount} of ${result.totalSubscribers}` });
    } catch (e) {
      toast({
        title: 'Send failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const send = async (item: Item) => {
    setBusyId(item.id);
    const { data, error } = await supabase
      .from('email_queue')
      .insert({ content_type: item.type, content_id: item.id })
      .select('id')
      .single();
    if (error || !data) {
      setBusyId(null);
      toast({ title: 'Could not queue', description: error?.message, variant: 'destructive' });
      return;
    }
    await invokeSend(item.id, data.id);
  };

  const retry = async (item: Item, row: QueueRow) => {
    setBusyId(item.id);
    // The send function skips rows with retry_count >= 3, so a manual retry starts fresh.
    const { error } = await supabase
      .from('email_queue')
      .update({ status: 'pending', retry_count: 0 })
      .eq('id', row.id);
    if (error) {
      setBusyId(null);
      toast({ title: 'Could not retry', description: error.message, variant: 'destructive' });
      return;
    }
    await invokeSend(item.id, row.id);
  };

  const showPreview = async (item: Item) => {
    const { data, error } = await supabase.functions.invoke('render-email-preview', {
      body: { contentType: item.type, contentId: item.id },
    });
    if (error || !data?.html) {
      toast({ title: 'Preview failed', description: error?.message, variant: 'destructive' });
      return;
    }
    setPreview({ title: data.title ?? item.title, html: data.html });
  };

  const remove = async (sub: Subscriber) => {
    setRemoveSub(null);
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('email', sub.email);
    if (error)
      toast({ title: 'Remove failed', description: error.message, variant: 'destructive' });
    await load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container-site max-w-3xl space-y-12">
        <header>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Admin
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">{activeCount} active subscribers</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Send an update</h2>
          <ul className="divide-y divide-border border-y border-border">
            {items.map((item) => {
              const rows = queue.filter((r) => r.content_id === item.id);
              const sent = rows.find((r) => r.status === 'sent');
              const failed = !sent && rows[0]?.status === 'failed' ? rows[0] : null;
              const busy = busyId === item.id;
              return (
                <li
                  key={item.type + item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.type === 'project' ? 'Project' : 'Post'} · {fmt(item.date)}
                    </p>
                    {failed && (
                      <p className="truncate text-sm text-destructive">
                        {failed.error_message || 'Last send failed'}
                      </p>
                    )}
                  </div>
                  {sent ? (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      Sent {fmt(sent.sent_at)}
                    </span>
                  ) : (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => showPreview(item)}
                        disabled={busy}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => setConfirmItem({ item, failed })}
                      >
                        {busy ? 'Sending…' : failed ? 'Try again' : `Send to ${activeCount}`}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Subscribers</h2>
          <ul className="divide-y divide-border border-y border-border">
            {subs.map((s) => (
              <li key={s.email} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="min-w-0 truncate">{s.email}</span>
                <span className="flex shrink-0 items-center gap-4 text-muted-foreground">
                  {s.status} · {fmt(s.created_at)}
                  <button
                    className="underline hover:text-foreground"
                    onClick={() => setRemoveSub(s)}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Dialog open={!!confirmItem} onOpenChange={(o) => !o && setConfirmItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send newsletter</DialogTitle>
            <DialogDescription>
              Send “{confirmItem?.item.title}” to {activeCount} subscribers? This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!confirmItem) return;
                const { item, failed } = confirmItem;
                setConfirmItem(null);
                void (failed ? retry(item, failed) : send(item));
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeSub} onOpenChange={(o) => !o && setRemoveSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove subscriber</DialogTitle>
            <DialogDescription>Remove {removeSub?.email}? This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveSub(null)}>
              Cancel
            </Button>
            <Button onClick={() => removeSub && remove(removeSub)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>Email preview</DialogDescription>
          </DialogHeader>
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={preview?.html}
            className="h-[70vh] w-full rounded bg-white"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailDashboard;
