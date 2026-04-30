import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { YearProvider } from "@/lib/year-context";
import Index from "./pages/Index.tsx";
import Landing from "./pages/Landing.tsx";
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const SchoolDetail = lazy(() => import("./pages/SchoolDetail.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Admissions = lazy(() => import("./pages/Admissions.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
   <HelmetProvider>
    <TooltipProvider>
    <YearProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Geographic breadcrumb levels resolve to the directory */}
          <Route path="/south-africa" element={<Index />} />
          <Route path="/south-africa/:province" element={<Index />} />
          <Route path="/south-africa/:province/:slug" element={<SchoolDetail />} />
          {/* Backwards-compat: old /schools/:slug links still resolve */}
          <Route path="/schools/:slug" element={<SchoolDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/admissions" element={<Admissions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </YearProvider>
    </TooltipProvider>
   </HelmetProvider>
  </QueryClientProvider>
);

export default App;
