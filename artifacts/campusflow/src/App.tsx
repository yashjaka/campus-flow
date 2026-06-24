import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { initCampusStore } from "@/lib/campus-store";
import { initStudentStore } from "@/lib/student-store";
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
import StudentIssues from "@/pages/student-issues";
import StudentSos from "@/pages/student-sos";
import StudentLostFound from "@/pages/student-lost-found";
import StudentNotifications from "@/pages/student-notifications";
import StudentBooking from "@/pages/student-booking";
import Complaints from "@/pages/complaints";
import AdminUserMgmt from "@/pages/admin-user-mgmt";
import BookingManage from "@/pages/booking-manage";
import Events from "@/pages/events";
import Notices from "@/pages/notices";
import Surveys from "@/pages/surveys";
import Analytics from "@/pages/analytics";

// Seed demo data on first load
initCampusStore();
initStudentStore();

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/setup" component={Setup} />
      <Route path="/login/student" component={StudentLogin} />
      <Route path="/login/staff" component={StaffLogin} />
      <Route path="/login/admin" component={AdminLogin} />

      {/* Role Dashboards */}
      <Route path="/dashboard/student">
        {() => <ProtectedRoute component={StudentDashboard} role="student" />}
      </Route>
      <Route path="/dashboard/faculty">
        {() => <ProtectedRoute component={FacultyDashboard} role="faculty" />}
      </Route>
      <Route path="/dashboard/maintenance">
        {() => (
          <ProtectedRoute component={MaintenanceDashboard} role="maintenance" />
        )}
      </Route>
      <Route path="/dashboard/admin">
        {() => <ProtectedRoute component={AdminDashboard} role="admin" />}
      </Route>

      {/* Admin-specific */}
      <Route path="/admin/students">
        {() => <ProtectedRoute component={AdminStudents} role="admin" />}
      </Route>
      <Route path="/admin/staff">
        {() => <ProtectedRoute component={AdminStaff} role="admin" />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUserMgmt} role="admin" />}
      </Route>

      {/* Student Modules */}
      <Route path="/student/issues">
        {() => <ProtectedRoute component={StudentIssues} role="student" />}
      </Route>
      <Route path="/student/sos">
        {() => <ProtectedRoute component={StudentSos} role="student" />}
      </Route>
      <Route path="/student/lost-found">
        {() => <ProtectedRoute component={StudentLostFound} role="student" />}
      </Route>
      <Route path="/student/notifications">
        {() => (
          <ProtectedRoute component={StudentNotifications} role="student" />
        )}
      </Route>
      <Route path="/student/booking">
        {() => <ProtectedRoute component={StudentBooking} role="student" />}
      </Route>

      {/* Shared Modules (auth required, role checked inside) */}
      <Route path="/complaints">
        {() => <ProtectedRoute component={Complaints} />}
      </Route>
      <Route path="/bookings/manage">
        {() => <ProtectedRoute component={BookingManage} />}
      </Route>
      <Route path="/events">
        {() => <ProtectedRoute component={Events} />}
      </Route>
      <Route path="/notices">
        {() => <ProtectedRoute component={Notices} />}
      </Route>
      <Route path="/surveys">
        {() => <ProtectedRoute component={Surveys} />}
      </Route>
      <Route path="/analytics">
        {() => <ProtectedRoute component={Analytics} />}
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
              <NotificationProvider>
                <Router />
              </NotificationProvider>
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
