import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase, logger } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import Index from "./pages/Index";
import News from "./pages/News";
import MarketData from "./pages/MarketData";
import DailyMarketSummary from "./pages/DailyMarketSummary";
import AIHub from "./pages/AIHub";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import Contacts from "./pages/Contacts";
import Organization from "./pages/Organization";
import Strategy from "./pages/Strategy";
import HRProfiles from "./pages/HRProfiles";
import Unit from "./pages/Unit";
import Calendar from "./pages/Calendar";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Notes from "./pages/Notes";
import AssetManagementNew from './pages/AssetManagementNew';
import Reports from './pages/Reports';
import Tickets from './pages/Tickets';
import AdminAssetsPage from './pages/AdminAssetsPage';
import UILibrary from './pages/UILibrary';
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth';
import LicensingRegistry from './pages/LicensingRegistry';
import Forms from './pages/Forms';
import FillFormPage from './pages/FillFormPage';
import EditEmployeeProfile from './pages/EditEmployeeProfile';
import PaymentsPage from './pages/PaymentsPage';
import Apps from './pages/Apps';
import TestGround from './pages/TestGround';
import { EmployeesProvider } from '@/contexts/EmployeesContext';
import { SlideshowProvider } from '@/contexts/SlideshowContext';

// MSAL Imports
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { MsalAuthProvider } from '@/integrations/microsoft/MsalProvider';

const queryClient = new QueryClient();

// Role-based authentication hook - now properly implemented

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Use MSAL hooks for authentication status
  const { inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated(); // Simple boolean check based on accounts
  const location = useLocation();

  // Show loading indicator while MSAL is initializing or interacting
  if (inProgress !== InteractionStatus.None) {
    logger.info('ProtectedRoute: MSAL in progress...', { status: inProgress });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If MSAL is idle and user is NOT authenticated, redirect to login
  if (!isAuthenticated) {
    logger.warn('ProtectedRoute: MSAL user not authenticated, redirecting to login.', { from: location.pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If MSAL is idle and user IS authenticated, grant access
  logger.success('ProtectedRoute: MSAL access granted.', { username: accounts[0]?.username });
  return <>{children}</>;
};

// Role-based asset page routing component
const AssetsPageRoute = () => {
  const { isAdmin, hasPermission, loading, user } = useRoleBasedAuth();

  // Only show loading on initial load, not on navigation - wrapped in PageLayout
  if (loading && !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </PageLayout>
    );
  }

  // Admin users or users with admin asset permissions see AdminAssetsPage
  const canAccessAdminAssets = isAdmin || hasPermission('assets', 'admin');

  logger.info(`[AssetsPageRoute] Rendering assets page. isAdmin: ${isAdmin}, canAccessAdminAssets: ${canAccessAdminAssets}`);

  return canAccessAdminAssets ? <AdminAssetsPage /> : <AssetManagementNew />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Basic authenticated routes */}
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/news" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'news', action: 'read' }]}>
          <News />
        </RoleProtectedRoute>
      } />
      <Route path="/market-data" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'market_data', action: 'read' }]}>
          <MarketData />
        </RoleProtectedRoute>
      } />
      <Route path="/market-summary" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'market_data', action: 'read' }]}>
          <DailyMarketSummary />
        </RoleProtectedRoute>
      } />
      <Route path="/apps" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'apps', action: 'read' }]}>
          <Apps />
        </RoleProtectedRoute>
      } />
      <Route path="/contacts" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'contacts', action: 'read' }]}>
          <Contacts />
        </RoleProtectedRoute>
      } />
      <Route path="/gallery" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'gallery', action: 'read' }]}>
          <Gallery />
        </RoleProtectedRoute>
      } />

      {/* Role-based protected routes */}
      <Route path="/documents" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'documents', action: 'read' }]}>
          <Documents />
        </RoleProtectedRoute>
      } />

      <Route path="/forms" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'forms', action: 'read' }]}>
          <Forms />
        </RoleProtectedRoute>
      } />
      <Route path="/forms/fill/:formId" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'forms', action: 'read' }]}>
          <FillFormPage />
        </RoleProtectedRoute>
      } />

      <Route path="/ai-hub" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'ai', action: 'access' }]}>
          <AIHub />
        </RoleProtectedRoute>
      } />

      <Route path="/unit" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'units', action: 'read' }]}>
          <Unit />
        </RoleProtectedRoute>
      } />

      <Route path="/organization" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'organization', action: 'read' }]}>
          <Organization />
        </RoleProtectedRoute>
      } />

      <Route path="/strategy" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'strategy', action: 'read' }]}>
          <Strategy />
        </RoleProtectedRoute>
      } />

      <Route path="/test-ground" element={
        <ProtectedRoute>
          <TestGround />
        </ProtectedRoute>
      } />

      <Route path="/hr-profiles" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'hr', action: 'read' }]}>
          <HRProfiles />
        </RoleProtectedRoute>
      } />
      <Route path="/hr-profiles/edit/:employeeId" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'hr', action: 'edit' }]}>
          <EditEmployeeProfile />
        </RoleProtectedRoute>
      } />

      <Route path="/reports" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'reports', action: 'read' }]}>
          <Reports />
        </RoleProtectedRoute>
      } />

      <Route path="/tickets" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'tickets', action: 'read' }]}>
          <Tickets />
        </RoleProtectedRoute>
      } />

      <Route path="/licensing-registry" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'licenses', action: 'read' }]}>
          <LicensingRegistry />
        </RoleProtectedRoute>
      } />

      {/* Admin-only routes */}
      <Route path="/admin" element={
        <RoleProtectedRoute requiredRole="super_admin">
          <Admin />
        </RoleProtectedRoute>
      } />

      <Route path="/ui-library" element={
        <RoleProtectedRoute requiredRole="super_admin">
          <UILibrary />
        </RoleProtectedRoute>
      } />

      <Route path="/settings" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'settings', action: 'read' }]}>
          <Settings />
        </RoleProtectedRoute>
      } />

      {/* Asset management with role-based access */}
      <Route path="/asset-management" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'assets', action: 'read' }]}>
          <AssetsPageRoute />
        </RoleProtectedRoute>
      } />

      {/* Payments management */}
      <Route path="/payments" element={
        <RoleProtectedRoute requiredPermissions={[{ resource: 'payments', action: 'read' }]}>
          <PaymentsPage />
        </RoleProtectedRoute>
      } />

      {/* Available to all authenticated users */}
      <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component wrapper to handle MSAL initialization state
const AppContent = () => {
  const { inProgress } = useMsal();

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <EmployeesProvider>
            <Toaster />
            <Sonner />
            <SlideshowProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SlideshowProvider>
          </EmployeesProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Top-level App component wrapper to handle MSAL initialization state
const App = () => (
  <SupabaseAuthProvider>
    <MsalAuthProvider>
      <AppContent />
    </MsalAuthProvider>
  </SupabaseAuthProvider>
);

export default App;
