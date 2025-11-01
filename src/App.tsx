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

const Index = React.lazy(() => import("./pages/Index"));
const Projects = React.lazy(() => import("./pages/Projects"));
const Blogs = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const ProjectDetail = React.lazy(() => import("./pages/ProjectDetail"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const ManagePosts = React.lazy(() => import("./pages/ManagePosts"));
const ManageProjects = React.lazy(() => import("./pages/ManageProjects"));
const EmailDashboard = React.lazy(() => import("./pages/EmailDashboard"));
const AnalyticsDashboard = React.lazy(() => import("./pages/AnalyticsDashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const About = React.lazy(() => import("./pages/About"));

const queryClient = new QueryClient();

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
