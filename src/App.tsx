import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JobListPage from "./pages/JobListPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import EmployerJobsPage from "./pages/employer/EmployerJobsPage";
import EmployerApplicationsPage from "./pages/employer/EmployerApplicationsPage";
import EmployerProfilePage from "./pages/employer/EmployerProfilePage";
import EmployerInterviewsPage from "./pages/employer/EmployerInterviewsPage";
import AdminPendingJobsPage from "./pages/admin/AdminPendingJobsPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import NotificationsPage from "./pages/NotificationsPage";
import ChatPage from "./pages/ChatPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import FloatingAiButton from "./components/FloatingAiButton";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<ProtectedRoute allowedRoles={["CANDIDATE"]}><JobListPage /></ProtectedRoute>} />
              <Route path="/my-applications" element={<ProtectedRoute allowedRoles={["CANDIDATE"]}><MyApplicationsPage /></ProtectedRoute>} />
              <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={["CANDIDATE"]}><CandidateProfilePage /></ProtectedRoute>} />
              <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={["EMPLOYER"]}><EmployerJobsPage /></ProtectedRoute>} />
              <Route path="/employer/applications" element={<ProtectedRoute allowedRoles={["EMPLOYER"]}><EmployerApplicationsPage /></ProtectedRoute>} />
              <Route path="/employer/interviews" element={<ProtectedRoute allowedRoles={["EMPLOYER"]}><EmployerInterviewsPage /></ProtectedRoute>} />
              <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={["EMPLOYER"]}><EmployerProfilePage /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPendingJobsPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminCategoriesPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute allowedRoles={["CANDIDATE", "EMPLOYER"]}><ChatPage /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute allowedRoles={["CANDIDATE", "EMPLOYER"]}><AiAssistantPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingAiButton />
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
