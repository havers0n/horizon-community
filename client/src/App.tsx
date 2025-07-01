import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { isAuthenticated } from "@/lib/auth";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Departments from "@/pages/Departments";
import Applications from "@/pages/Applications";
import Support from "@/pages/Support";
import AdminPanel from "@/pages/AdminPanel";
import Reports from "@/pages/Reports";
import TestExam from "@/pages/TestExam";
import Homepage from "@/pages/Homepage";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/not-found";

function Router() {
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
        {isAuthenticated() ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/register">
        {isAuthenticated() ? <Redirect to="/dashboard" /> : <Register />}
      </Route>
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/departments">
        <ProtectedRoute>
          <Departments />
        </ProtectedRoute>
      </Route>
      <Route path="/applications">
        <ProtectedRoute>
          <Applications />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      <Route path="/support">
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      </Route>
      <Route path="/test/:id">
        <ProtectedRoute>
          <TestExam />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </Route>
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
