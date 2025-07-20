import { Switch, Route, Redirect } from "wouter";
// import ApplicationDetails from "@/pages/ApplicationDetails";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Departments from "@/pages/Departments";
import Applications from "@/pages/Applications";
import Support from "@/pages/Support";
import AdminPanel from "@/pages/AdminPanel";
import SupportPage from "@/pages/admin/SupportPage";
import AdminTicketDetails from "@/pages/admin/AdminTicketDetails";
import UserTicketDetails from "@/pages/UserTicketDetails";
import Reports from "@/pages/Reports";
import JointPositions from "@/pages/JointPositions";
import LeaveManagement from "@/pages/LeaveManagement";
import AdminLeaveManagement from "@/pages/AdminLeaveManagement";
import AdminReports from "@/pages/AdminReports";
import TestExam from "@/pages/TestExam";
import Homepage from "@/pages/Homepage";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/not-found";
import CAD from "@/pages/CAD";
import DesignSystemDemo from "@/components/DesignSystemDemo";

function Router() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        <Homepage />
      </Route>
      <Route path="/faq">
        <FAQ />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route path="/design-system">
        <DesignSystemDemo />
      </Route>
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/departments">
        <Departments />
      </Route>
      <Route path="/applications">
        <Applications />
      </Route>
      <Route path="/applications/:id">
        <div />
      </Route>
      <Route path="/joint-positions">
        <JointPositions />
      </Route>
      <Route path="/leave-management">
        <LeaveManagement />
      </Route>
      <Route path="/admin-leave-management">
        <AdminLeaveManagement />
      </Route>
      <Route path="/admin-reports">
        <AdminReports />
      </Route>
      <Route path="/reports">
        <Reports />
      </Route>
      <Route path="/support">
        <SupportPage />
      </Route>
      <Route path="/cad">
        <CAD />
      </Route>
      <Route path="/test/:id">
        <TestExam />
      </Route>

      <Route path="/admin/support">
        <SupportPage />
      </Route>

      <Route path="/admin">
        <AdminPanel />
      </Route>

      <Route path="/admin/tickets/:id">
        <AdminTicketDetails />
      </Route>

      <Route path="/tickets/:id">
        <UserTicketDetails />
      </Route>

      {/* 404 route */}
      <Route>
        <NotFound />
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
