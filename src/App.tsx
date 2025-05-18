
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/auth/AuthCallback";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Layouts
import DashboardLayout from "./components/DashboardLayout";

// Resident pages
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import ResidentSchedule from "./pages/resident/ResidentSchedule";
import ResidentFeedback from "./pages/resident/ResidentFeedback";
import ResidentProfile from "./pages/resident/ResidentProfile";
import ResidentPayments from "./pages/resident/ResidentPayments";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminResidents from "./pages/admin/AdminResidents";

// Shared pages
import ProfileManagement from "./pages/shared/ProfileManagement";
import SettingsPage from "./pages/shared/SettingsPage";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Resident routes */}
            <Route path="/resident" element={<DashboardLayout role="resident" userName={user?.name || 'Resident'} />}>
              <Route index element={<ResidentDashboard />} />
              <Route path="schedule" element={<ResidentSchedule />} />
              <Route path="payments" element={<ResidentPayments />} />
              <Route path="feedback" element={<ResidentFeedback />} />
              <Route path="profile" element={<ResidentProfile />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={<DashboardLayout role="admin" userName={user?.name || 'Admin'} />}>
              <Route index element={<AdminDashboard />} />
              <Route path="schedules" element={<AdminSchedules />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="residents" element={<AdminResidents />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfileManagement />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
