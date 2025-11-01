import { useState, type FormEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterSignupProps {
  className?: string;
}

const NewsletterSignup = ({ className = '' }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already-subscribed'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Refs for focus management
  const emailInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const statusMessageRef = useRef<HTMLDivElement>(null);

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

  // Effect for focus management after form submission
  useEffect(() => {
    // Move focus to status message when status changes from idle
    if (status !== 'idle' && statusMessageRef.current) {
      statusMessageRef.current.focus();
    }
  }, [status]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setValidationError('Email is required');
      // Focus on email input when validation fails
      emailInputRef.current?.focus();
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      // Focus on email input when validation fails
      emailInputRef.current?.focus();
      return;
    }
    
    // Clear validation error
    setValidationError(null);
    
    // Set submitting state
    setIsSubmitting(true);
    
    try {
      // Attempt to insert the email into the newsletter_subscribers table
      const { error } = await supabase
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
    <section 
      className={`py-8 sm:py-12 border-t border-white/10 mt-12 sm:mt-16 ${className}`}
      aria-labelledby="newsletter-heading"
    >
      <div className="container-site">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left content - heading and description */}
          <div className="w-full lg:w-2/5 mb-6 lg:mb-0">
            <h2 id="newsletter-heading" className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Stay Updated</h2>
            <p className="text-white/60 text-sm sm:text-base max-w-md">
              Get notified when new projects and blog posts are published.
              Never miss out on the latest content.
            </p>
          </div>
          
          {/* Right content - form */}
          <div className="w-full lg:w-3/5">
            <form 
              onSubmit={handleSubmit} 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              aria-describedby="newsletter-description"
              noValidate
            >
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <Input
                  id="newsletter-email"
                  ref={emailInputRef}
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  aria-required="true"
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "email-error" : "newsletter-description"}
                  className={`bg-zinc-900/80 border ${validationError ? 'border-red-400' : 'border-white/10'} text-white placeholder:text-white/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all w-full`}
                  onKeyDown={(e) => {
                    // Allow submitting form with Enter key
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit(e as unknown as FormEvent);
                    }
                  }}
                />
                {validationError && (
                  <p id="email-error" className="mt-1 text-red-400 text-xs" role="alert">
                    {validationError}
                  </p>
                )}
                <span id="newsletter-description" className="sr-only">
                  Enter your email to subscribe to our newsletter and receive updates on new content.
                </span>
              </div>
              <Button
                ref={submitButtonRef}
                type="submit"
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg py-3 transition-colors border border-white/10 shadow whitespace-nowrap h-[42px] sm:h-auto w-full sm:w-auto"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            
            {/* Status messages */}
            <div 
              className="min-h-[24px] mt-2" 
              ref={statusMessageRef}
              tabIndex={status !== 'idle' ? -1 : undefined}
              role={status !== 'idle' ? 'status' : undefined}
              aria-live="polite"
            >
              {status === 'success' && (
                <p className="text-green-400 text-xs sm:text-sm">
                  Thanks for subscribing! You'll receive updates on new content.
                </p>
              )}
              
              {status === 'error' && (
                <p className="text-red-400 text-xs sm:text-sm">
                  Something went wrong. Please try again.
                </p>
              )}
              
              {status === 'already-subscribed' && (
                <p className="text-yellow-400 text-xs sm:text-sm">
                  This email is already subscribed to the newsletter.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
