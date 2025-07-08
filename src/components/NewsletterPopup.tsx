import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

const NewsletterPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasVisited', 'true');
      }, 5000); // Show after 5 seconds for first-time visitors
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
      console.error('Error subscribing:', error);
    } else {
      toast({
        title: "Success!",
        description: "Thanks for subscribing!",
      });
      setEmail('');
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-transparent border-none shadow-none p-0 flex items-center justify-center">
          <div className="bg-black/95 border border-white/10 shadow-2xl rounded-2xl max-w-md p-8 text-white relative mx-auto w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white/30 z-10"
              aria-label="Close"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white mb-1">Stay Updated!</DialogTitle>
              <DialogDescription className="text-white/60 mb-4">
                Subscribe to my newsletter to get email updates on new projects and blog posts.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900/80 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg py-3 transition-colors border border-white/10 shadow"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
};

export default NewsletterPopup;
