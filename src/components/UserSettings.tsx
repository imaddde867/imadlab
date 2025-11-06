import React, { useState, useEffect } from 'react';
import { Settings, User, BellOff } from 'lucide-react';
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

interface UserSettingsProps {
  setUserName: (name: string) => void;
  setShowFollowingBadge: (show: boolean) => void;
}

const UserSettings = ({ setUserName, setShowFollowingBadge }: UserSettingsProps) => {
  const { toast } = useToast();
  const [localUserName, setLocalUserName] = useState<string>('');
  const [localShowFollowingBadge, setLocalShowFollowingBadge] = useState<boolean>(true);

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

  const handleSaveSettings = () => {
    localStorage.setItem('userName', localUserName);
    localStorage.setItem('showFollowingBadge', JSON.stringify(localShowFollowingBadge));
    setUserName(localUserName); // Update parent state
    setShowFollowingBadge(localShowFollowingBadge); // Update parent state
    toast({ title: 'Settings saved successfully!' });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 left-4 z-50 bg-white/5 hover:bg-white/15 text-white border border-white/10 rounded-full h-11 w-11 p-0 flex items-center justify-center"
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
          <Button type="submit" onClick={handleSaveSettings} className="bg-white text-black hover:bg-white/90">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
