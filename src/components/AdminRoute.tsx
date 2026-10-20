import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdmin } from '@/lib/admin-auth';
import { useQueryClient } from '@tanstack/react-query';

type Access = 'checking' | 'signed-out' | 'denied' | 'allowed' | 'error';

export default function AdminRoute() {
  const [access, setAccess] = useState<Access>('checking');
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    let request = 0;
    const check = async () => {
      const current = ++request;
      if (active) setAccess('checking');
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!active || current !== request) return;
        if (error && user) setAccess('error');
        else if (!user)
          setAccess(error && error.name !== 'AuthSessionMissingError' ? 'error' : 'signed-out');
        else setAccess(isAdmin(user) ? 'allowed' : 'denied');
      } catch {
        if (active && current === request) setAccess('error');
      }
    };
    void check();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.clear();
      void check();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  if (access === 'checking') return <p role="status">Checking administrator access…</p>;
  if (access === 'signed-out') return <Navigate to="/admin/login" replace />;
  if (access !== 'allowed')
    return (
      <p role="alert">
        {access === 'error'
          ? 'Unable to verify administrator access. Please sign in again.'
          : 'Administrator access required.'}
      </p>
    );
  return <Outlet />;
}
