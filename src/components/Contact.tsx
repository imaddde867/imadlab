import { ArrowUp, Github, Linkedin, MessageSquare, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';
import SectionHeader from '@/components/SectionHeader';

const Contact = () => {
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('https://formspree.io/f/manjzpvz', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      });

      if (response.ok) {
        toast({ title: 'Message sent successfully!' });
        form.reset();
      } else {
        const data = await response.json();
        toast({ title: data?.error || 'Failed to send message.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'An error occurred.', variant: 'destructive' });
    }
  }

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/imaddde867', icon: Github },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/imad-eddine-e-986741262',
      icon: Linkedin,
    },
    { name: 'Discord', href: 'https://discord.com/users/766969796579295232', icon: MessageSquare },
    { name: 'Email', href: 'mailto:imadeddine200507@gmail.com', icon: Mail },
  ];

  return (
    <section className="section relative !pb-4 md:!pb-6">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-0 w-3/4 h-px bg-white"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1/2 h-px bg-white"></div>
        <div className="absolute left-1/4 top-0 w-px h-2/3 bg-white"></div>
      </div>

      <div className="container-site relative z-10">
        <SectionHeader align="center" title={"Let's Build"} subtitle={'Something Amazing'} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact form */}
          <div className="lg:col-span-7 lg:col-start-1 relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-body-small text-hierarchy-muted">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            className="w-full px-4 py-4 bg-white/[0.03] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all duration-300 relative z-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-body-small text-hierarchy-muted">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-4 bg-white/[0.03] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all duration-300 relative z-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-body-small text-hierarchy-muted">
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell me about your project or just say hello..."
                          rows={6}
                          className="w-full px-4 py-4 bg-white/[0.03] border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.05] transition-all duration-300 resize-none relative z-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="cta"
                  size="pill"
                  className="group"
                  disabled={form.formState.isSubmitting}
                >
                  <span className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-2xl"></span>
                  <span className="relative flex items-center">
                    <span className="btn-text-primary">
                      {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                    </span>
                    <ArrowUp className="w-5 h-5 ml-3 rotate-45 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </Button>
              </form>
            </Form>
          </div>

          {/* Social links and quote */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-12">
            {/* Social links */}
            <div>
              <h3 className="text-card-title text-hierarchy-primary mb-8">Connect With Me</h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="group relative p-4 bg-white/[0.02] border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/[0.05] hover:border-white/30 hover:scale-105 focus-enhanced"
                  >
                    <div className="relative z-10 text-center">
                      <div className="text-2xl mb-2 text-primary drop-shadow-lg">
                        <social.icon />
                      </div>
                      <div className="text-body-small text-hierarchy-secondary">{social.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Spotify Now Playing */}
            <SpotifyNowPlaying />
          </div>
        </div>

        {/* Inner footer removed; global Footer is used */}
      </div>
    </section>
  );
};

export default Contact;
