import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import ClickSpark from "@/components/ClickSpark";
import HomeBackground from '@/components/HomeBackground';

const Index = React.lazy(() => import("./pages/Index"));
const Projects = React.lazy(() => import("./pages/Projects"));
const Blogs = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const ProjectDetail = React.lazy(() => import("./pages/ProjectDetail"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const ManagePosts = React.lazy(() => import("./pages/ManagePosts"));
const ManageProjects = React.lazy(() => import("./pages/ManageProjects"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HomeBackground />
        <Suspense fallback={
          <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            letterSpacing: '0.05em',
            transition: 'background 0.3s'
          }}>
            Loading...
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
            </Routes>
          </ClickSpark>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
