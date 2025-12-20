import { Toaster } from '@/components/ui/toaster';
import NewsletterPopup from '@/components/NewsletterPopup';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';
import ClickSpark from '@/components/ClickSpark';
import HomeBackground from '@/components/HomeBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import CookieConsent from '@/components/CookieConsent';
import { useAnalytics } from '@/hooks/useAnalytics';
import { registerRoutePrefetch } from '@/lib/routePrefetch';
import { loadScriptIfConsented } from '@/lib/consent';
import { HelmetProvider } from 'react-helmet-async';

const lazyWithPrefetch = <T extends React.ComponentType<unknown>>(
  path: string,
  loader: () => Promise<{ default: T }>
) => {
  registerRoutePrefetch(path, loader);
  return React.lazy(loader);
};

// Lazy load all pages for better code splitting and register them for prefetching
const Index = lazyWithPrefetch('/', () => import('./pages/Index'));
const Projects = lazyWithPrefetch('/projects', () => import('./pages/Projects'));
const Blogs = lazyWithPrefetch('/blogs', () => import('./pages/Blog'));
const BlogPost = lazyWithPrefetch('/blogs/:slug', () => import('./pages/BlogPost'));
const ProjectDetail = lazyWithPrefetch('/projects/:id', () => import('./pages/ProjectDetail'));
const Extras = lazyWithPrefetch('/extras', () => import('./pages/Extras'));
const AdminLogin = lazyWithPrefetch('/admin/login', () => import('./pages/AdminLogin'));
const AdminDashboard = lazyWithPrefetch('/admin', () => import('./pages/AdminDashboard'));
const ManagePosts = lazyWithPrefetch('/admin/posts', () => import('./pages/ManagePosts'));
const ManageProjects = lazyWithPrefetch('/admin/projects', () => import('./pages/ManageProjects'));
const EmailDashboard = lazyWithPrefetch('/admin/emails', () => import('./pages/EmailDashboard'));
const AnalyticsDashboard = lazyWithPrefetch(
  '/admin/analytics',
  () => import('./pages/AnalyticsDashboard')
);
const NotFound = lazyWithPrefetch('*', () => import('./pages/NotFound'));
const About = lazyWithPrefetch('/about', () => import('./pages/About'));
const Tag = lazyWithPrefetch('/tags/:tag', () => import('./pages/Tag'));
const TagsIndex = lazyWithPrefetch('/tags', () => import('./pages/TagsIndex'));
const Search = lazyWithPrefetch('/search', () => import('./pages/Search'));

// Optimize QueryClient for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

const App = () => {
  const [cookieConsentIsOpen, setCookieConsentIsOpen] = React.useState<boolean>(false);

  // Load Cloudflare Analytics only when user has consented to analytics
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hostname !== 'imadlab.me') return;

    loadScriptIfConsented('analytics', 'https://static.cloudflareinsights.com/beacon.min.js', {
      'data-cf-beacon': '{"token": "e8df18bc2d9d4512835bc2f9798f4b24"}',
      defer: 'true',
    }).catch(() => {
      // ignore failures silently
    });
  }, []);

  const baseContent = (
    <>
      {/* Skip to content for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white p-2 rounded z-50"
      >
        Skip to content
      </a>
      <Toaster />
      <BrowserRouter>
        <AnalyticsWrapper>
          <HomeBackground />
          <Header />
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-t-4 border-white/20 border-t-white animate-spin"></div>
                    <div
                      className="absolute inset-4 rounded-full border-4 border-t-4 border-white/40 border-t-white animate-spin-reverse"
                      style={{ animationDuration: '1.5s' }}
                    ></div>
                  </div>
                  <div className="text-xl font-medium tracking-wider">Loading...</div>
                </div>
              }
            >
              <ClickSpark
                sparkColor="#fff"
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
              >
                <main id="main">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:slug" element={<BlogPost />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/extras" element={<Extras />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/tags" element={<TagsIndex />} />
                    <Route path="/tags/:tag" element={<Tag />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/posts" element={<ManagePosts />} />
                    <Route path="/admin/projects" element={<ManageProjects />} />
                    <Route path="/admin/emails" element={<EmailDashboard />} />
                    <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </ClickSpark>
            </Suspense>
          </ErrorBoundary>
          <Footer onOpenCookiePrefs={() => setCookieConsentIsOpen(true)} />
        </AnalyticsWrapper>
      </BrowserRouter>
      <NewsletterPopup />
      <CookieConsent isOpen={cookieConsentIsOpen} onOpenChange={setCookieConsentIsOpen} />
    </>
  );

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">{baseContent}</div>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
