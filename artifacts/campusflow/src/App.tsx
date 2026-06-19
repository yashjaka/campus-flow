import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import Setup from "@/pages/setup";
import StudentLogin from "@/pages/login-student";
import StaffLogin from "@/pages/login-staff";
import AdminLogin from "@/pages/login-admin";
import StudentDashboard from "@/pages/dashboard-student";
import FacultyDashboard from "@/pages/dashboard-faculty";
import MaintenanceDashboard from "@/pages/dashboard-maintenance";
import AdminDashboard from "@/pages/dashboard-admin";
import AdminStudents from "@/pages/admin-students";
import AdminStaff from "@/pages/admin-staff";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/setup" component={Setup} />
      <Route path="/login/student" component={StudentLogin} />
      <Route path="/login/staff" component={StaffLogin} />
      <Route path="/login/admin" component={AdminLogin} />
      
      {/* Protected Routes */}
      <Route path="/dashboard/student">
        {() => <ProtectedRoute component={StudentDashboard} role="student" />}
      </Route>
      <Route path="/dashboard/faculty">
        {() => <ProtectedRoute component={FacultyDashboard} role="faculty" />}
      </Route>
      <Route path="/dashboard/maintenance">
        {() => <ProtectedRoute component={MaintenanceDashboard} role="maintenance" />}
      </Route>
      <Route path="/dashboard/admin">
        {() => <ProtectedRoute component={AdminDashboard} role="admin" />}
      </Route>
      <Route path="/admin/students">
        {() => <ProtectedRoute component={AdminStudents} role="admin" />}
      </Route>
      <Route path="/admin/staff">
        {() => <ProtectedRoute component={AdminStaff} role="admin" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
