import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { 
  LayoutDashboard, 
  Bot, 
  Leaf, 
  GraduationCap, 
  Trophy, 
  History, 
  User,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { toggleTheme, theme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudent = user?.role === 'student';

  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: t("sidebar.dashboard"),
      href: "/dashboard",
      key: "dashboard"
    },
    {
      icon: Bot,
      label: t("sidebar.aiAssistant"),
      href: "/ai-assistant",
      key: "ai-assistant"
    },
    {
      icon: Leaf,
      label: t("sidebar.footprint"),
      href: "/footprint",
      key: "footprint"
    },
    ...(isStudent ? [{
      icon: GraduationCap,
      label: t("sidebar.schoolPanel"),
      href: "/school",
      key: "school"
    }] : []),
    {
      icon: Trophy,
      label: t("sidebar.leaderboard"),
      href: "/leaderboard",
      key: "leaderboard"
    },
    {
      icon: History,
      label: t("sidebar.history"),
      href: "/history",
      key: "history"
    },
    {
      icon: User,
      label: t("sidebar.profile"),
      href: "/profile",
      key: "profile"
    }
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center h-14 sm:h-16">
            {/* Logo and Brand - Compact with animations */}
            <div className="flex items-center space-x-2 flex-shrink-0 animate-in slide-in-from-left-5 duration-500">
              <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg">
                <Leaf className="w-4 h-4 text-white transition-transform duration-300" />
              </div>
              <Link href="/dashboard">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:text-blue-600 dark:hover:text-blue-400">
                  Econest
                </h1>
              </Link>
              

            </div>

            {/* Desktop Navigation - Full width */}
            <nav className="hidden lg:flex items-center flex-1 justify-center mx-8">
              <div className="flex items-center justify-between w-full max-w-4xl">
                {navigationItems.map((item, index) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.key} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "flex items-center space-x-2 h-10 px-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg",
                          "animate-in slide-in-from-top-5 duration-500",
                          isActive && "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg scale-105",
                          !isActive && "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600"
                        )}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <Icon className="w-4 h-4 transition-transform duration-300" />
                        <span className="hidden lg:inline font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right side actions - Compact with animations */}
            <div className="flex items-center space-x-1 flex-shrink-0 animate-in slide-in-from-right-5 duration-500">
              
              {/* Mobile menu button - More prominent */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
              </Button>


              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-8 h-8 transition-all duration-300 hover:scale-110 hover:rotate-12"
              >
                <span className="text-sm transition-transform duration-500">
                  {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : theme === 'ocean' ? '🌊' : '👻'}
                </span>
              </Button>

              {/* User Menu - Desktop */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 px-2 transition-all duration-300 hover:scale-110"
              >
                <LogOut className="w-3 h-3 transition-transform duration-300 hover:rotate-12" />
              </Button>


            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 animate-in slide-in-from-top-3 duration-300 bg-white dark:bg-gray-800 shadow-lg z-50">
              <div className="space-y-2 px-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 px-2 font-medium">
                  Навигация / Navigation
                </div>
                {navigationItems.map((item, index) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.key} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start space-x-3 h-12 transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-left-3",
                          isActive && "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg",
                          !isActive && "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600"
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 transition-transform duration-300" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
                
                {/* Mobile actions */}
                <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start space-x-3 h-12 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("sidebar.logout")}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Page content with animations */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 animate-in fade-in-0 slide-in-from-bottom-5 duration-700">
        <div className="animate-in fade-in-0 duration-1000 delay-300">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around items-center py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.key} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center space-y-1 p-2 h-auto min-h-[60px] transition-all duration-200",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                  <span className="text-xs font-medium truncate max-w-[60px]">
                    {item.label.split(' ')[0]}
                  </span>
                </Button>
              </Link>
            );
          })}
          
          {/* More button for additional items */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center space-y-1 p-2 h-auto min-h-[60px] text-gray-600 dark:text-gray-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-medium">Еще</span>
          </Button>
        </div>
      </div>
    </div>
  );
}