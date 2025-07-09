import { Toaster } from '@/components/ui/toaster';
import NewsletterPopup from '@/components/NewsletterPopup';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import ClickSpark from "@/components/ClickSpark";
import HomeBackground from '@/components/HomeBackground';
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = React.lazy(() => import("./pages/Index"));
const Projects = React.lazy(() => import("./pages/Projects"));
const Blogs = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const ProjectDetail = React.lazy(() => import("./pages/ProjectDetail"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const ManagePosts = React.lazy(() => import("./pages/ManagePosts"));
const ManageProjects = React.lazy(() => import("./pages/ManageProjects"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <HomeBackground />
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
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:slug" element={<BlogPost />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/posts" element={<ManagePosts />} />
                  <Route path="/admin/projects" element={<ManageProjects />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ClickSpark>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    <NewsletterPopup />
  </>
);

export default App;
