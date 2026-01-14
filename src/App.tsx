import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import SportsPage from "./pages/SportsPage";
import WeatherPage from "./pages/WeatherPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAds from "./pages/admin/AdminAds";
import AdminComments from "./pages/admin/AdminComments";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAutomation from "./pages/admin/AdminAutomation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/noticia/:id" element={<ArticlePage />} />
          <Route path="/categoria/:category" element={<CategoryPage />} />
          <Route path="/esportes" element={<SportsPage />} />
          <Route path="/clima" element={<WeatherPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/ads" element={<AdminAds />} />
          <Route path="/admin/comments" element={<AdminComments />} />
          <Route path="/admin/automation" element={<AdminAutomation />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
