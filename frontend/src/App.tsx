import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import ToastContainer from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";
import ScrollToTop from "./components/common/ScrollToTop";

// Company Admin Pages
import CompanyAdminLayout from "./components/layout/CompanyAdminLayout";
import DashboardOverview from "./pages/company/DashboardOverview";
import PeopleManagement from "./pages/company/PeopleManagement";
import Projects from "./pages/company/Projects";
import Performance from "./pages/company/Performance";
import Meetings from "./pages/company/Meetings";
import MeetingRoom from "./pages/shared/MeetingRoom";
import Chat from "./pages/company/Chat";
import Notifications from "./pages/company/Notifications";
import Settings from "./pages/company/Settings";
import CompanyClients from "./pages/company/CompanyClients";

// Manager Pages
import ManagerLayout from "./components/layout/ManagerLayout";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerProjects from "./pages/manager/ManagerProjects";
import ManagerTasks from "./pages/manager/ManagerTasks";
import ManagerPerformance from "./pages/manager/ManagerPerformance";
import ManagerMeetings from "./pages/manager/ManagerMeetings";
import ManagerChat from "./pages/manager/ManagerChat";
import ManagerNotifications from "./pages/manager/ManagerNotifications";
import ManagerProfile from "./pages/manager/ManagerProfile";
import ManagerSettings from "./pages/manager/ManagerSettings";
import ManagerEmployees from "./pages/manager/ManagerEmployees";
import ManagerDailyReports from "./pages/manager/ManagerDailyReports";
import ManagerFiles from "./pages/manager/ManagerFiles";
import ManagerClients from "./pages/manager/ManagerClients";
import ManagerDemands from "./pages/manager/ManagerDemands";

// Employee Pages
import EmployeeLayout from "./components/layout/EmployeeLayout";
import EmployeeOverview from "./pages/employee/EmployeeOverview";
import EmployeeTasks from "./pages/employee/EmployeeTasks";
import EmployeeDailyReport from "./pages/employee/EmployeeDailyReport";
import EmployeeMeetings from "./pages/employee/EmployeeMeetings";
import EmployeeChat from "./pages/employee/EmployeeChat"; /* To be created or replace with EmployeeChat placeholder if I created one... wait did I? No, I'll create the remaining one */
import EmployeeFiles from "./pages/employee/EmployeeFiles";
import EmployeeNotifications from "./pages/employee/EmployeeNotifications";
import EmployeePerformance from "./pages/employee/EmployeePerformance";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeSettings from "./pages/employee/EmployeeSettings";

// Client Pages
import ClientLayout from "./components/layout/ClientLayout";
import ClientOverview from "./pages/client/ClientOverview";
import MyProject from "./pages/client/MyProject";
import ClientMeetings from "./pages/client/ClientMeetings";
import ClientReports from "./pages/client/ClientReports";
import ClientDemands from "./pages/client/ClientDemands";
import ClientNotifications from "./pages/client/ClientNotifications";
import ClientSettings from "./pages/client/ClientSettings";

// Platform Pages
import Features from "./pages/platform/Features";
import Pricing from "./pages/platform/Pricing";
import Security from "./pages/platform/Security";
import Integrations from "./pages/platform/Integrations";

// Company Pages
import About from "./pages/company/About";
import Blog from "./pages/company/Blog";
import BlogPost from "./pages/company/BlogPost";
import Careers from "./pages/company/Careers";
import Contact from "./pages/company/Contact";

// Resources Pages
import Documentation from "./pages/resources/Documentation";
import ApiReference from "./pages/resources/ApiReference";
import Support from "./pages/resources/Support";
import Status from "./pages/resources/Status";

// Legal Pages
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Cookies from "./pages/legal/Cookies";

// Super Admin Pages
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import SuperAdminOverview from "./pages/superadmin/Overview";
import SuperAdminCompanies from "./pages/superadmin/Companies";
import SuperAdminSubscriptions from "./pages/superadmin/Subscriptions";
import SuperAdminAnalytics from "./pages/superadmin/Analytics";
import SuperAdminSettings from "./pages/superadmin/Settings";

const queryClient = new QueryClient();

const DashboardStub = ({ role }: { role: string }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
    <h1 className="text-3xl font-bold font-heading mb-4 capitalize">{role} Dashboard</h1>
    <p className="text-muted-foreground mb-8">Successfully routed to protected area.</p>
    <a href="/" className="px-6 py-3 rounded-full bg-foreground text-background font-medium hover:scale-[1.02] transition-transform">Back to Home</a>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <ToastContainer />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Change Password (forced first login) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/change-password" element={<ChangePassword />} />
                </Route>

                {/* Company Admin Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['company_admin']} />}>
                  <Route path="/company" element={<CompanyAdminLayout />}>
                    <Route path="dashboard" element={<DashboardOverview />} />
                    <Route path="people" element={<PeopleManagement />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="clients" element={<CompanyClients />} />
                    <Route path="performance" element={<Performance />} />
                    <Route path="meetings" element={<Meetings />} />
                    <Route path="meetings/:id" element={<MeetingRoom />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Manager Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                  <Route path="/manager" element={<ManagerLayout />}>
                    <Route path="dashboard" element={<ManagerOverview />} />
                    <Route path="projects" element={<ManagerProjects />} />
                    <Route path="tasks" element={<ManagerTasks />} />
                    <Route path="employees" element={<ManagerEmployees />} />
                    <Route path="clients" element={<ManagerClients />} />
                    <Route path="demands" element={<ManagerDemands />} />
                    <Route path="reports" element={<ManagerDailyReports />} />
                    <Route path="files" element={<ManagerFiles />} />
                    <Route path="performance" element={<ManagerPerformance />} />
                    <Route path="meetings" element={<ManagerMeetings />} />
                    <Route path="meetings/:id" element={<MeetingRoom />} />
                    <Route path="chat" element={<ManagerChat />} />
                    <Route path="notifications" element={<ManagerNotifications />} />
                    <Route path="profile" element={<ManagerProfile />} />
                    <Route path="settings" element={<ManagerSettings />} />
                  </Route>
                </Route>

                {/* Employee Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                  <Route path="/employee" element={<EmployeeLayout />}>
                    <Route path="dashboard" element={<EmployeeOverview />} />
                    <Route path="tasks" element={<EmployeeTasks />} />
                    <Route path="reports" element={<EmployeeDailyReport />} />
                    <Route path="meetings" element={<EmployeeMeetings />} />
                    <Route path="meetings/:id" element={<MeetingRoom />} />
                    <Route path="chat" element={<EmployeeChat />} />
                    <Route path="files" element={<EmployeeFiles />} />
                    <Route path="notifications" element={<EmployeeNotifications />} />
                    <Route path="performance" element={<EmployeePerformance />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                    <Route path="settings" element={<EmployeeSettings />} />
                  </Route>
                </Route>

                {/* Client Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                  <Route path="/client" element={<ClientLayout />}>
                    <Route path="dashboard" element={<ClientOverview />} />
                    <Route path="project" element={<MyProject />} />
                    <Route path="meetings" element={<ClientMeetings />} />
                    <Route path="meetings/:id" element={<MeetingRoom />} />
                    <Route path="reports" element={<ClientReports />} />
                    <Route path="demands" element={<ClientDemands />} />
                    <Route path="notifications" element={<ClientNotifications />} />
                    <Route path="settings" element={<ClientSettings />} />
                  </Route>
                </Route>

                {/* Super Admin Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                  <Route path="/superadmin" element={<SuperAdminLayout />}>
                    <Route path="dashboard" element={<SuperAdminOverview />} />
                    <Route path="companies" element={<SuperAdminCompanies />} />
                    <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
                    <Route path="analytics" element={<SuperAdminAnalytics />} />
                    <Route path="settings" element={<SuperAdminSettings />} />
                  </Route>
                </Route>

                {/* Platform Pages */}
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/security" element={<Security />} />
                <Route path="/integrations" element={<Integrations />} />

                {/* Company Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />

                {/* Resources Pages */}
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/api-reference" element={<ApiReference />} />
                <Route path="/support" element={<Support />} />
                <Route path="/status" element={<Status />} />

                {/* Legal Pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
