import React from "react";
import { Switch, Route } from "wouter";
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
const Reports = () => import("@/pages/Reports");
const Tests = () => import("@/pages/Tests");
const Homepage = () => import("@/pages/Homepage");
const FAQ = () => import("@/pages/FAQ");
const NotFound = () => import("@/pages/not-found");
const MDT = () => import("@/pages/MDT");
const CAD = () => import("@/pages/CAD");

function Router() {
  const { loading } = useAuth();
  
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
      
      {/* Interface routes */}
      <Route path="/mdt">
        <LazyPage component={MDT} />
      </Route>
      <Route path="/cad">
        <LazyPage component={CAD} />
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
      <Route path="/reports">
        <LazyPage component={Reports} />
      </Route>
      <Route path="/tests">
        <LazyPage component={Tests} />
      </Route>
      <Route path="/support">
        <LazyPage component={Support} />
      </Route>
      <Route path="/admin">
        <LazyPage component={AdminPanel} />
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

