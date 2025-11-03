import { Toaster } from '@/components/ui/toaster';
import NewsletterPopup from '@/components/NewsletterPopup';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import ClickSpark from "@/components/ClickSpark";
import HomeBackground from '@/components/HomeBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import { useAnalytics } from "@/hooks/useAnalytics";
import { registerRoutePrefetch } from "@/lib/routePrefetch";

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

const App = () => (
  <>
    {/* Skip to content for keyboard users */}
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white p-2 rounded z-50">Skip to content</a>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AnalyticsWrapper>
            <HomeBackground />
            <Header />
            <ErrorBoundary>
              <Suspense fallback={
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-t-4 border-white/20 border-t-white animate-spin"></div>
                    <div className="absolute inset-4 rounded-full border-4 border-t-4 border-white/40 border-t-white animate-spin-reverse" style={{ animationDuration: '1.5s' }}></div>
                  </div>
                  <div className="text-xl font-medium tracking-wider">Loading...</div>
                </div>
              }>
                <ClickSpark
                  sparkColor="#fff"
                  sparkSize={10}
                  sparkRadius={15}
                  sparkCount={8}
                  duration={400}
                >
                  <main id="main" className="pt-14">
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
            <Footer />
          </AnalyticsWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    <NewsletterPopup />
  <CookieConsent />
  </>
);

export default App;
