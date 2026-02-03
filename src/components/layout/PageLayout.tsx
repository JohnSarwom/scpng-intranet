import React, { useState, useEffect } from 'react';
import { useMsal } from "@azure/msal-react";
import MainSidebar from './MainSidebar';
import { Bell, Search, Menu, X, User as UserIcon, LogOut, Loader2, ArrowLeft, Image, Newspaper, TrendingUp, Grid3x3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from './ThemeToggle';
import { supabase, logger } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';
import { useSlideshow } from '@/contexts/SlideshowContext';
import { Switch } from '@/components/ui/switch';

interface PageLayoutProps {
  children: React.ReactNode;
  hideNavAndFooter?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, hideNavAndFooter = false }) => {
  const { toast } = useToast();
  const { instance, accounts, inProgress } = useMsal();
  const account = accounts[0];
  const userLoading = inProgress !== "none";
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, user: roleUser, loading: roleLoading } = useRoleBasedAuth();
  const { isSlideshowVisible, toggleSlideshow, isNewsTickerVisible, toggleNewsTicker, isTradingViewVisible, toggleTradingView } = useSlideshow();
  const isHomePage = location.pathname === '/';

  // Removed the special case for asset management page to maintain consistent layout
  // const isFullPageAssetManagement = location.pathname === '/asset-management' && isAdmin;

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications",
    });
  };

  const handleSignOut = async () => {
    logger.info('PageLayout: Initiating MSAL sign out');
    try {
      await instance.logoutPopup();
      logger.success('PageLayout: MSAL User signed out successfully');
      navigate('/login', { replace: true });
      toast({ title: "Signed Out", description: "You have been signed out successfully." });
    } catch (error) {
      logger.error('PageLayout: Error during MSAL sign out', error);
      toast({ title: "Sign Out Error", description: "An error occurred during sign out.", variant: "destructive" });
    }
  };

  const getInitials = (name?: string | null, username?: string | null): string => {
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (username) {
      return username[0].toUpperCase();
    }
    return 'U';
  };

  const renderSidebar = !isMobile && !hideNavAndFooter;
  const renderHeader = !hideNavAndFooter;

  return (
    <div className={cn(
      "min-h-screen bg-background dark:bg-intranet-dark relative",
      hideNavAndFooter && "p-0 m-0"
    )}>
      {renderSidebar && <MainSidebar handleSignOut={handleSignOut} isAdmin={isAdmin} userPermissions={roleUser?.permissions} />}

      <div className={cn(
        "animate-fade-in relative flex flex-col min-h-screen",
        renderSidebar ? "ml-0 md:ml-20" : "ml-0",
        !hideNavAndFooter && "px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8"
      )}>
        {renderHeader && (
          <header className="relative z-50 flex items-center justify-between mb-6 bg-gradient-to-r from-intranet-primary to-intranet-secondary p-3 rounded-3xl shadow-md">
            {isMobile && !hideNavAndFooter && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden mr-2 icon-hover-effect text-white hover:bg-white/10"
              >
                <Menu size={24} />
              </Button>
            )}

            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/70" />
              </div>
              <input
                type="text"
                placeholder="Search for events, documents, contacts etc."
                className="pl-10 pr-4 py-2 w-full rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent bg-white/10 text-white placeholder-white/70 transition-all duration-300"
              />
            </div>

            <div className="flex items-center space-x-3 ml-4">
              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/apps')}
                className="text-white hover:bg-white/10 icon-hover-effect"
                title="Apps"
              >
                <Grid3x3 size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="text-white hover:bg-white/10 icon-hover-effect"
              >
                <Bell size={20} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={undefined} alt={account?.name || "User"} />
                      <AvatarFallback className="bg-intranet-accent text-white">
                        {userLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : getInitials(account?.name, account?.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userLoading ? "Loading..." : account?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userLoading ? "..." : account?.username}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isHomePage && (
                    <>
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Gallery Slideshow</span>
                          </div>
                          <Switch
                            checked={isSlideshowVisible}
                            onCheckedChange={toggleSlideshow}
                          />
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">News Ticker</span>
                          </div>
                          <Switch
                            checked={isNewsTickerVisible}
                            onCheckedChange={toggleNewsTicker}
                          />
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Trading View Ticker</span>
                          </div>
                          <Switch
                            checked={isTradingViewVisible}
                            onCheckedChange={toggleTradingView}
                          />
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        )}

        <main className={cn(
          "flex-grow",
          !hideNavAndFooter && "pb-8"
        )}>
          {children}
        </main>
      </div>

      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#400010] to-[#200008] p-4 animate-slide-in rounded-r-3xl shadow-lg dark:from-[#300010] dark:to-black" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <img src="/images/SCPNG Original Logo.png" alt="SCPNG Logo" className="h-10 w-auto" />
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-white hover:bg-white/10">
                <X size={24} />
              </Button>
            </div>
            <MainSidebar
              closeMobileSidebar={() => setIsSidebarOpen(false)}
              handleSignOut={handleSignOut}
              isAdmin={isAdmin}
              userPermissions={roleUser?.permissions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PageLayout;
