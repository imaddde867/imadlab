import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterSignupProps {
  className?: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already-subscribed'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear validation error when user starts typing again
    if (validationError) {
      setValidationError(null);
    }
    
    // Reset status when user changes input
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    
    // Clear validation error
    setValidationError(null);
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Attempt to insert the email into the newsletter_subscribers table
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.trim() }]);
      
      if (error) {
        // Check if the error is due to a unique constraint violation (already subscribed)
        if (error.code === '23505') { // PostgreSQL unique constraint violation code
          setStatus('already-subscribed');
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to the newsletter.",
            variant: "default",
          });
        } else {
          // Handle other errors
          setStatus('error');
          toast({
            title: "Error",
            description: "Failed to subscribe. Please try again.",
            variant: "destructive",
          });
          console.error('Error subscribing:', error);
        }
      } else {
        // Success
        setStatus('success');
        toast({
          title: "Success!",
          description: "Thanks for subscribing! You'll receive updates on new content.",
        });
        setEmail(''); // Clear the input field
      }
    } catch (err) {
      // Handle unexpected errors
      setStatus('error');
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`py-12 px-4 border-t border-white/10 mt-16 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
            <p className="text-white/60">
              Get notified when new projects and blog posts are published.
              Never miss out on the latest content.
            </p>
          </div>
          
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  aria-label="Email address"
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "email-error" : undefined}
                  className={`bg-zinc-900/80 border ${validationError ? 'border-red-400' : 'border-white/10'} text-white placeholder:text-white/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all w-full`}
                />
                {validationError && (
                  <p id="email-error" className="mt-1 text-red-400 text-xs">
                    {validationError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg py-3 transition-colors border border-white/10 shadow whitespace-nowrap"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            
            {status === 'success' && (
              <p className="mt-2 text-green-400 text-sm">
                Thanks for subscribing! You'll receive updates on new content.
              </p>
            )}
            
            {status === 'error' && (
              <p className="mt-2 text-red-400 text-sm">
                Something went wrong. Please try again.
              </p>
            )}
            
            {status === 'already-subscribed' && (
              <p className="mt-2 text-yellow-400 text-sm">
                This email is already subscribed to the newsletter.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;