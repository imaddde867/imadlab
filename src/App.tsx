import { Toaster } from '@/components/ui/toaster';
import NewsletterPopup from '@/components/NewsletterPopup';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import { CursorProvider, Cursor, CursorFollow } from "@/components/ui/shadcn-io/animated-cursor";
import ClickSpark from "@/components/ClickSpark";
import HomeBackground from '@/components/HomeBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import UserSettings from '@/components/UserSettings';
import { useAnalytics } from "@/hooks/useAnalytics";
import { registerRoutePrefetch } from "@/lib/routePrefetch";

const getCustomCursorSupport = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  const finePointerQuery = window.matchMedia('(pointer: fine)');
  const hoverQuery = window.matchMedia('(hover: hover)');
  return finePointerQuery.matches && hoverQuery.matches;
};

// Lazy load all pages for better code splitting and register them for prefetching
const loadIndex = () => import("./pages/Index");
registerRoutePrefetch('/', loadIndex);
const Index = React.lazy(loadIndex);

const loadProjects = () => import("./pages/Projects");
registerRoutePrefetch('/projects', loadProjects);
const Projects = React.lazy(loadProjects);

const loadBlogs = () => import("./pages/Blog");
registerRoutePrefetch('/blogs', loadBlogs);
const Blogs = React.lazy(loadBlogs);

const loadBlogPost = () => import("./pages/BlogPost");
registerRoutePrefetch('/blogs/:slug', loadBlogPost);
const BlogPost = React.lazy(loadBlogPost);

const loadProjectDetail = () => import("./pages/ProjectDetail");
registerRoutePrefetch('/projects/:id', loadProjectDetail);
const ProjectDetail = React.lazy(loadProjectDetail);

const loadExtras = () => import("./pages/Extras");
registerRoutePrefetch('/extras', loadExtras);
const Extras = React.lazy(loadExtras);

const loadAdminLogin = () => import("./pages/AdminLogin");
registerRoutePrefetch('/admin/login', loadAdminLogin);
const AdminLogin = React.lazy(loadAdminLogin);

const loadAdminDashboard = () => import("./pages/AdminDashboard");
registerRoutePrefetch('/admin', loadAdminDashboard);
const AdminDashboard = React.lazy(loadAdminDashboard);

const loadManagePosts = () => import("./pages/ManagePosts");
registerRoutePrefetch('/admin/posts', loadManagePosts);
const ManagePosts = React.lazy(loadManagePosts);

const loadManageProjects = () => import("./pages/ManageProjects");
registerRoutePrefetch('/admin/projects', loadManageProjects);
const ManageProjects = React.lazy(loadManageProjects);

const loadEmailDashboard = () => import("./pages/EmailDashboard");
registerRoutePrefetch('/admin/emails', loadEmailDashboard);
const EmailDashboard = React.lazy(loadEmailDashboard);

const loadAnalyticsDashboard = () => import("./pages/AnalyticsDashboard");
registerRoutePrefetch('/admin/analytics', loadAnalyticsDashboard);
const AnalyticsDashboard = React.lazy(loadAnalyticsDashboard);

const loadNotFound = () => import("./pages/NotFound");
registerRoutePrefetch('*', loadNotFound);
const NotFound = React.lazy(loadNotFound);

const loadAbout = () => import("./pages/About");
registerRoutePrefetch('/about', loadAbout);
const About = React.lazy(loadAbout);

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
  const [userName, setUserName] = React.useState<string>('');
  const [showFollowingBadge, setShowFollowingBadge] = React.useState<boolean>(true);
  const [cookieConsentIsOpen, setCookieConsentIsOpen] = React.useState<boolean>(false);
  const [supportsCustomCursor, setSupportsCustomCursor] = React.useState<boolean>(() => getCustomCursorSupport());

  React.useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    const storedBadgePreference = localStorage.getItem('showFollowingBadge');
    if (storedBadgePreference !== null) {
      setShowFollowingBadge(JSON.parse(storedBadgePreference));
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const hoverQuery = window.matchMedia('(hover: hover)');
    const updateSupport = () => {
      setSupportsCustomCursor(finePointerQuery.matches && hoverQuery.matches);
    };

    updateSupport();

    const attachListener = (query: MediaQueryList) => {
      const handler = () => updateSupport();

      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', handler);
        return () => query.removeEventListener('change', handler);
      }

      if (typeof query.addListener === 'function') {
        query.addListener(handler);
        return () => query.removeListener(handler);
      }

      return () => {};
    };

    const detachFinePointer = attachListener(finePointerQuery);
    const detachHover = attachListener(hoverQuery);

    return () => {
      detachFinePointer();
      detachHover();
    };
  }, []);

  const visitorTag = React.useMemo(() => {
    const randomNumber = Math.floor(Math.random() * 900) + 100;
    return `Visitor_${randomNumber}`;
  }, []);

  const displayTag = userName || visitorTag;

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
                    <Route path="/admin/login" element={<AdminLogin />} />
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

  const cursorRootProps: React.HTMLAttributes<HTMLDivElement> = supportsCustomCursor
    ? { 'data-custom-cursor-root': 'true' }
    : {};

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen" {...cursorRootProps}>
          {supportsCustomCursor ? (
            <CursorProvider className="flex min-h-screen flex-col">
              {baseContent}
              <UserSettings setUserName={setUserName} setShowFollowingBadge={setShowFollowingBadge} />
              <Cursor>
                <svg className="size-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
                  <path
                    fill="currentColor"
                    d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
                  />
                </svg>
              </Cursor>
              {showFollowingBadge && (
                <CursorFollow>
                  <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-sm shadow-lg">
                    {displayTag}
                  </div>
                </CursorFollow>
              )}
            </CursorProvider>
          ) : (
            <div className="flex min-h-screen flex-col">
              {baseContent}
            </div>
          )}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
