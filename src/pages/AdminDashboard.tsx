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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
        toast({ title: 'Unauthorized', description: 'Please log in to access the admin dashboard.', variant: 'destructive' });
      } else {
        setUser({ email: user.email });
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/admin/login');
        toast({ title: 'Logged out', description: 'Your session has ended.', variant: 'destructive' });
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
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
            Back to Home
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
            Logout
          </Button>
        </div>
        <p className="text-white/70 mb-8">Welcome, {user?.email}!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/posts">
            <Button className="w-full h-24 text-xl bg-white/10 hover:bg-white/20 border border-white/20">
              Manage Blog Posts
            </Button>
          </Link>
          <Link to="/admin/projects">
            <Button className="w-full h-24 text-xl bg-white/10 hover:bg-white/20 border border-white/20">
              Manage Projects
            </Button>
          </Link>
          <Link to="/admin/emails">
            <Button className="w-full h-24 text-xl bg-white/10 hover:bg-white/20 border border-white/20">
              Email Management
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
