import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Box,
  FileText,
  Wrench,
  Trash2,
  PieChart
} from 'lucide-react';
import './AdminAssetsPage.css';
import { useToast } from "@/hooks/use-toast";
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { AssetDashboard } from '@/components/assets/AssetDashboard';
import { AssetReportsPage } from '@/components/assets/AssetReportsPage';
import { InvoicesPage } from '@/components/assets/InvoicesPage';
import { MaintenancePage } from '@/components/assets/MaintenancePage';
import AssetManagementNew from './AssetManagementNew';
import DecommissionedAssets from './DecommissionedAssets';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import PageLayout from '@/components/layout/PageLayout';

// Define the complete tab structure
const allTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Asset Dashboard Overview' },
  { id: 'assets', label: 'Assets', icon: Box, tooltip: 'Manage Assets' },
  { id: 'invoices', label: 'Invoices', icon: FileText, tooltip: 'Manage Asset Invoices' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, tooltip: 'Asset Maintenance Records' },
  { id: 'decommissioned', label: 'Decommissioned', icon: Trash2, tooltip: 'View Decommissioned Assets' },
  { id: 'reports', label: 'Reports', icon: PieChart, tooltip: 'Asset Reports and Analytics' }
];

// Define tabs for regular users (only Assets tab)
const regularUserTabs = [
  { id: 'assets', label: 'Assets', icon: Box, tooltip: 'Manage Assets' }
];

const AdminAssetsPage: React.FC = () => {
  const { toast } = useToast();
  const { user, isAdmin, hasPermission, loading } = useRoleBasedAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Determine which tabs to show based on user role and granular permissions
  const tabs = useMemo(() => {
    const userRole = user?.role_name;

    // Super admin and system admin always see all tabs
    if (isAdmin || userRole === 'super_admin' || userRole === 'system_admin') {
      // console.log(`[AdminAssetsPage] Admin user (${userRole}) granted access to all tabs`);
      return allTabs;
    }

    // For other users, filter tabs based on granular permissions
    // The 'assets' tab is the default if they have general read access
    const availableTabs = allTabs.filter(tab => {
      // Always allow 'assets' tab if they have basic read permission (which is checked by the route)
      if (tab.id === 'assets') return true;

      // Check specific permission for other tabs
      // Resource: 'assets', Action: tab.id (e.g., 'dashboard', 'invoices')
      return hasPermission('assets', tab.id);
    });

    // console.log(`[AdminAssetsPage] User (${userRole}) has access to tabs:`, availableTabs.map(t => t.id));
    return availableTabs.length > 0 ? availableTabs : regularUserTabs;
  }, [isAdmin, user?.role_name, hasPermission]);

  // Set default active tab based on available tabs
  const getDefaultTab = useMemo(() => {
    if (tabs.length === 1) {
      return 'assets'; // Regular users start with Assets tab
    }
    return 'dashboard'; // Admins start with Dashboard
  }, [tabs]);

  const [activeTab, setActiveTab] = useState<string>(getDefaultTab);

  // Update active tab when user role loads or changes
  useEffect(() => {
    const allowedTabIds = tabs.map(tab => tab.id);
    if (!allowedTabIds.includes(activeTab)) {
      // If current active tab is not allowed for user, switch to assets
      // console.log(`[AdminAssetsPage] Current tab '${activeTab}' not allowed for role '${user?.role_name}'. Switching to 'assets'.`);
      setActiveTab('assets');
    }
  }, [tabs, activeTab, user?.role_name]);

  const handleTabClick = (event: React.MouseEvent<HTMLAnchorElement>, tabId: string) => {
    event.preventDefault();

    // Check if the user has permission to access this tab
    const allowedTabIds = tabs.map(tab => tab.id);
    if (!allowedTabIds.includes(tabId)) {
      // If user tries to access restricted tab, redirect to assets
      // console.warn(`User attempted to access restricted tab: ${tabId}. Redirecting to assets.`);
      toast({
        title: "Access Restricted",
        description: "You don't have permission to access that section.",
        variant: "destructive"
      });
      setActiveTab('assets');
      return;
    }

    setActiveTab(tabId);
  };

  // Find the label of the current active tab for the page title
  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'Assets';

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render the appropriate content based on the active tab
  const renderTabContent = () => {
    // Helper to check permission for a specific tab
    const canAccess = (tabId: string) => {
      if (isAdmin || user?.role_name === 'super_admin' || user?.role_name === 'system_admin') return true;
      if (tabId === 'assets') return true; // Basic access
      return hasPermission('assets', tabId);
    };

    // For regular users without specific permissions, always show AssetManagementNew
    if (!isAdmin && user?.role_name !== 'super_admin' && user?.role_name !== 'system_admin' && tabs.length === 1 && tabs[0].id === 'assets') {
      // console.log(`[AdminAssetsPage] Regular user (${user?.role_name}) accessing Assets view`);
      return <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
    }

    // Render content based on active tab and permissions
    switch (activeTab) {
      case 'dashboard':
        return canAccess('dashboard')
          ? <AssetDashboard />
          : <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'assets':
        return <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'invoices':
        return canAccess('invoices')
          ? <InvoicesPage />
          : <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'maintenance':
        return canAccess('maintenance')
          ? <MaintenancePage />
          : <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'reports':
        return canAccess('reports')
          ? <AssetReportsPage />
          : <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      case 'decommissioned':
        return canAccess('decommissioned')
          ? <DecommissionedAssets />
          : <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
      default:
        return <AssetManagementNew skipPageLayout={true} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />;
    }
  };

  // Show loading state while role is being determined
  if (loading) {
    return (
      <PageLayout>
        <div className="asset-registry-content">
          <div className="top-nav-container">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Loading...</h1>
            </div>
          </div>
          <div className="tab-content mt-6 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your permissions...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout hideNavAndFooter={isFullscreen}>
      <div className="asset-registry-content">
        {/* Top navigation bar with tabs */}
        {!isFullscreen && (
          <div className="top-nav-container">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{activeTabLabel}</h1>
              {/* Role indicator for admins */}
              {(isAdmin || user?.role_name === 'super_admin' || user?.role_name === 'system_admin') && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full ml-2">
                  Admin View
                </span>
              )}
            </div>

            <nav className="top-tabs">
              <ul className="flex space-x-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <TooltipWrapper content={tab.tooltip}>
                      <a
                        href={`#${tab.id}`}
                        className={activeTab === tab.id ? 'active' : ''}
                        onClick={(e) => handleTabClick(e, tab.id)}
                      >
                        <tab.icon size={18} className="mr-2" />
                        {tab.label}
                      </a>
                    </TooltipWrapper>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        <div className={isFullscreen ? "tab-content" : "tab-content mt-6"}>
          {renderTabContent()}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminAssetsPage;
