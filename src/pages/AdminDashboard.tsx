import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        toast({
          title: 'Unauthorized',
          description: 'Please log in to access the admin dashboard.',
          variant: 'destructive',
        });
      } else {
        setUser({ email: user.email });
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/admin/login');
        toast({
          title: 'Logged out',
          description: 'Your session has ended.',
          variant: 'destructive',
        });
      } else {
        setUser(session.user ? { email: session.user.email } : null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Logout Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Logged out successfully!' });
      navigate('/admin/login');
    }
  };

  if (user === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/60 text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <div className="container-site max-w-3xl space-y-6 pb-16">
        <Link
          to="/"
          className="inline-flex items-center text-white/60 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Home
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin</h1>
            <p className="text-sm text-white/60">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        <div className="grid gap-3">
          <Link
            to="/admin/posts"
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white hover:border-white/20"
          >
            <span>Blog posts</span>
            <span className="text-xs font-normal text-white/50">Create + edit</span>
          </Link>
          <Link
            to="/admin/projects"
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white hover:border-white/20"
          >
            <span>Projects</span>
            <span className="text-xs font-normal text-white/50">Manage portfolio</span>
          </Link>
          <Link
            to="/admin/emails"
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white hover:border-white/20"
          >
            <span>Email</span>
            <span className="text-xs font-normal text-white/50">Queue + subscribers</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white hover:border-white/20"
          >
            <span>Analytics</span>
            <span className="text-xs font-normal text-white/50">Traffic + performance</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
