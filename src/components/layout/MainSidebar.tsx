import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Bell,
  Users,
  BarChart2,
  Calendar,
  Settings,
  Database,
  MessageSquare,
  GalleryHorizontal,
  LogOut,
  Target,
  Package,
  BarChart,
  Ticket,
  ListChecks,
  FormInput,
  TrendingUp,
  Layers,
  TestTube,
  Grid3x3,
  BookOpen,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Add prop type for the logout function
interface MainSidebarProps {
  closeMobileSidebar?: () => void; // Optional prop passed from PageLayout for mobile
  handleSignOut?: () => void; // Optional prop for sign out, passed from PageLayout
  isAdmin?: boolean; // Optional prop to indicate if user is admin
  userPermissions?: any; // User permissions object from role-based auth
}

// Update component signature to accept props
const MainSidebar: React.FC<MainSidebarProps> = ({ closeMobileSidebar, handleSignOut, isAdmin = false, userPermissions = {} }) => {
  const location = useLocation();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Helper function to check if user has access to a resource
  const hasAccess = (resource: string | null): boolean => {
    // Admin has access to everything
    if (isAdmin) return true;

    // No resource restriction
    if (!resource) return true;

    // Check if user has permissions for this resource
    if (!userPermissions || Object.keys(userPermissions).length === 0) return false;

    // Check for wildcard permissions
    if (userPermissions.all?.includes('*')) return true;

    // Check specific resource access (any permission on the resource grants visibility)
    return userPermissions[resource] && userPermissions[resource].length > 0;
  };

  useEffect(() => {
    // After component mounts, set isFirstRender to false
    // This will prevent animations from restarting on route changes
    if (isFirstRender) {
      const timer = setTimeout(() => {
        setIsFirstRender(false);
      }, 1000); // Allow enough time for initial animations

      return () => clearTimeout(timer);
    }
  }, [isFirstRender]);

  // Define all navigation items with their required permissions
  const allNavItems = [
    { icon: Home, path: '/', label: 'Home', resource: null }, // Always visible
    { icon: Grid3x3, path: '/apps', label: 'Apps', resource: 'apps' },
    { icon: Bell, path: '/news', label: 'News', resource: null }, // Always visible
    { icon: Layers, path: '/strategy', label: 'Strategy', resource: 'strategy' },
    { icon: TrendingUp, path: '/market-data', label: 'Market Data', resource: 'market_data' },
    { icon: FileText, path: '/documents', label: 'Documents', resource: 'documents' },
    { icon: FormInput, path: '/forms', label: 'Forms', resource: 'forms' },
    { icon: MessageSquare, path: '/ai-hub', label: 'AI Hub', resource: 'ai' },
    { icon: GalleryHorizontal, path: '/gallery', label: 'Gallery', resource: 'gallery' },
    { icon: Users, path: '/contacts', label: 'Contacts', resource: 'contacts' },
    { icon: Target, path: '/unit', label: 'Unit', resource: 'units' }, // Updated to match system resource key
    { icon: BarChart, path: '/reports', label: 'Reports', resource: 'reports' },
    // { icon: Calendar, path: '/calendar', label: 'Calendar', resource: 'Calendar' },
    { icon: Package, path: '/asset-management', label: 'Assets', resource: 'assets' },
    { icon: Users, path: '/organization', label: 'Organization', resource: 'organization' },
    { icon: Users, path: '/hr-profiles', label: 'HR Profiles', resource: 'hr' },
    { icon: Ticket, path: '/tickets', label: 'Tickets', resource: 'tickets' },
    { icon: FileText, path: '/licensing-registry', label: 'Licensing', resource: 'licenses' },
  ];

  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => {
    return hasAccess(item.resource);
  });

  // Show admin link only to admins
  if (isAdmin) {
    navItems.push({ icon: Database, path: '/admin', label: 'Admin', resource: null });
    navItems.push({ icon: TestTube, path: '/test-ground', label: 'Test Ground', resource: null });
    navItems.push({ icon: Palette, path: '/ui-library', label: 'UI Library', resource: null });
  }

  // Always show settings at the end
  navItems.push({ icon: Settings, path: '/settings', label: 'Settings', resource: null });

  return (
    <div className="fixed inset-y-0 left-0 w-20 bg-gradient-to-b from-[#400010] to-[#200008] flex flex-col items-center py-6 z-10 shadow-lg dark:from-[#300010] dark:to-black rounded-r-2xl">
      {/* Logo - Fixed at top */}
      <div className="mb-8 flex justify-center px-2 flex-shrink-0">
        <img
          src="/images/SCPNG Original Logo.png"
          alt="SCPNG Logo"
          className="w-16 h-auto"
        />
      </div>

      {/* Scrollable Navigation Menu */}
      <div className="flex flex-col items-center mt-4 flex-1 w-full overflow-y-auto sidebar-scrollable pr-1">
        <div className="flex flex-col items-center space-y-6 w-full">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                // Add onClick handler to close mobile sidebar if prop exists
                onClick={closeMobileSidebar}
                className={cn(
                  "flex flex-col items-center text-white/80 hover:text-white transition-colors group w-full",
                  isActive && "text-white",
                  isFirstRender && "animate-slide-in"
                )}
                style={isFirstRender ? { animationDelay: `${index * 0.05}s` } : undefined}
              >
                <div className={cn(
                  "p-3 rounded-lg group-hover:bg-white/10 transition-all duration-200 icon-hover-effect",
                  isActive && "bg-white/10"
                )}>
                  <item.icon size={20} />
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Use the handleSignOut prop passed from PageLayout - Fixed at bottom */}
      {handleSignOut && (
        <button
          onClick={handleSignOut} // Use the passed function
          className="flex flex-col items-center text-white/80 hover:text-white transition-colors group mb-6 icon-hover-effect flex-shrink-0"
          title="Sign Out" // Add title for accessibility
        >
          <div className="p-3 rounded-lg group-hover:bg-white/10 transition-colors">
            <LogOut size={20} />
          </div>
          <span className="text-xs mt-1">Logout</span>
        </button>
      )}
    </div>
  );
};

export default MainSidebar;
