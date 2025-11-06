import React, { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface UserSettingsProps {
  setUserName: (name: string) => void;
  setShowFollowingBadge: (show: boolean) => void;
}

const UserSettings = ({ setUserName, setShowFollowingBadge }: UserSettingsProps) => {
  const { toast } = useToast();
  const [localUserName, setLocalUserName] = useState<string>('');
  const [localShowFollowingBadge, setLocalShowFollowingBadge] = useState<boolean>(true);
  const [isPersisting, setIsPersisting] = useState<boolean>(false);
  const cursorSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'cursor_profile_session_id';
    let sessionId = localStorage.getItem(STORAGE_KEY);

    if (!sessionId) {
      sessionId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `cursor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_KEY, sessionId);
    }

    cursorSessionIdRef.current = sessionId;
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setLocalUserName(storedName);
    }
    const storedBadgePreference = localStorage.getItem('showFollowingBadge');
    if (storedBadgePreference !== null) {
      setLocalShowFollowingBadge(JSON.parse(storedBadgePreference));
    }
  }, []);

  const persistCursorPreference = async (name: string) => {
    const sessionId = cursorSessionIdRef.current;
    if (!sessionId) {
      logger.warn('⚠️ Unable to persist cursor preference: missing session id');
      return;
    }

    const trimmed = name.trim();

    if (!trimmed) {
      const { error } = await supabase
        .from('cursor_preferences')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        throw error;
      }
      return;
    }

    const payload = {
      session_id: sessionId,
      cursor_name: trimmed,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('cursor_preferences')
      .upsert(payload, { onConflict: 'session_id' });

    if (error) {
      throw error;
    }
  };

  const handleSaveSettings = async () => {
    setIsPersisting(true);
    try {
      localStorage.setItem('userName', localUserName);
      localStorage.setItem('showFollowingBadge', JSON.stringify(localShowFollowingBadge));
      setUserName(localUserName); // Update parent state
      setShowFollowingBadge(localShowFollowingBadge); // Update parent state

      await persistCursorPreference(localUserName);

      toast({ title: 'Settings saved successfully!' });
    } catch (error) {
      logger.error('❌ Failed to persist cursor preference', error);
      toast({
        title: 'Unable to save settings',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsPersisting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 p-0 text-white shadow-lg backdrop-blur transition-colors hover:bg-white/15"
          style={{
            left: 'calc(env(safe-area-inset-left, 0px) + 2rem)',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
          }}
          aria-label="User Settings"
        >
          <Settings className="h-5 w-5 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black text-white border border-white/10">
        <DialogHeader>
          <DialogTitle>Cursor Settings</DialogTitle>
          <DialogDescription className="text-white/70">
            Manage your mouse cursor preferences for the website.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-hierarchy-secondary">
              Name
            </Label>
            <Input
              id="name"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              className="col-span-3"
              placeholder="Your Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="following-badge" className="text-right text-hierarchy-secondary">
              Following Badge
            </Label>
            <Switch
              id="following-badge"
              checked={localShowFollowingBadge}
              onCheckedChange={setLocalShowFollowingBadge}
              className="col-span-3 justify-self-start"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSaveSettings}
            disabled={isPersisting}
            className="bg-white text-black hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPersisting ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
