import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LazyPage } from "@/components/LazyPage";

// Lazy loaded pages
const Login = () => import("@/pages/Login");
const Register = () => import("@/pages/Register");
const Dashboard = () => import("@/pages/Dashboard");
const Departments = () => import("@/pages/Departments");
const Applications = () => import("@/pages/Applications");
const Support = () => import("@/pages/Support");
const AdminPanel = () => import("@/pages/AdminPanel");
const SupportPage = () => import("@/pages/admin/SupportPage");
const AdminTicketDetails = () => import("@/pages/admin/AdminTicketDetails");
const UserTicketDetails = () => import("@/pages/UserTicketDetails");
const Reports = () => import("@/pages/Reports");
const JointPositions = () => import("@/pages/JointPositions");
const LeaveManagement = () => import("@/pages/LeaveManagement");
const AdminLeaveManagement = () => import("@/pages/AdminLeaveManagement");
const AdminReports = () => import("@/pages/AdminReports");
const TestExam = () => import("@/pages/TestExam");
const Homepage = () => import("@/pages/Homepage");
const FAQ = () => import("@/pages/FAQ");
const NotFound = () => import("@/pages/not-found");
const CAD = () => import("@/pages/CAD");
const DesignSystemDemo = () => import("@/components/DesignSystemDemo");

function Router() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        <LazyPage component={Homepage} />
      </Route>
      <Route path="/faq">
        <LazyPage component={FAQ} />
      </Route>
      <Route path="/login">
        <LazyPage component={Login} />
      </Route>
      <Route path="/register">
        <LazyPage component={Register} />
      </Route>
      <Route path="/design-system">
        <LazyPage component={DesignSystemDemo} />
      </Route>
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <LazyPage component={Dashboard} />
      </Route>
      <Route path="/departments">
        <LazyPage component={Departments} />
      </Route>
      <Route path="/applications">
        <LazyPage component={Applications} />
      </Route>
      <Route path="/applications/:id">
        <div />
      </Route>
      <Route path="/joint-positions">
        <LazyPage component={JointPositions} />
      </Route>
      <Route path="/leave-management">
        <LazyPage component={LeaveManagement} />
      </Route>
      <Route path="/admin-leave-management">
        <LazyPage component={AdminLeaveManagement} />
      </Route>
      <Route path="/admin-reports">
        <LazyPage component={AdminReports} />
      </Route>
      <Route path="/reports">
        <LazyPage component={Reports} />
      </Route>
      <Route path="/support">
        <LazyPage component={SupportPage} />
      </Route>
      <Route path="/cad">
        <LazyPage component={CAD} />
      </Route>
      <Route path="/test/:id">
        <LazyPage component={TestExam} />
      </Route>

      <Route path="/admin/support">
        <LazyPage component={SupportPage} />
      </Route>

      <Route path="/admin">
        <LazyPage component={AdminPanel} />
      </Route>

      <Route path="/admin/tickets/:id">
        <LazyPage component={AdminTicketDetails} />
      </Route>

      <Route path="/tickets/:id">
        <LazyPage component={UserTicketDetails} />
      </Route>

      {/* 404 route */}
      <Route>
        <LazyPage component={NotFound} />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
