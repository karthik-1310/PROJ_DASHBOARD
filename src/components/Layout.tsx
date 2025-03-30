
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './Sidebar';
import { useTaskStore } from '@/store/taskStore';
import ThemeToggle from './ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Search, Plus, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [loading, setLoading] = useState(true);
  const { initializeTasks, users } = useTaskStore();
  const location = useLocation();

  useEffect(() => {
    // Initialize tasks from localStorage
    initializeTasks();
    
    // Simulate loading for skeleton UI
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [initializeTasks]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/kanban': return 'Kanban Board';
      case '/analytics': return 'Analytics';
      case '/calendar': return 'Calendar';
      case '/team': return 'Team';
      case '/profile': return 'Profile';
      case '/settings': return 'Settings';
      default: return 'Kanban Garden';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <header className="border-b p-3 px-5 flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-20 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full bg-muted/50 focus:bg-muted focus:outline-none focus:ring-1 focus:ring-primary w-[220px] text-sm"
                />
              </div>
              
              <Button size="sm" variant="outline" className="rounded-full">
                <Plus className="h-4 w-4 mr-1" /> New Task
              </Button>
              
              <div className="relative">
                <Button size="icon" variant="ghost" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </div>
              
              <ThemeToggle />
              
              <div className="flex items-center gap-2 pl-2 border-l">
                {users[0] && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={users[0].avatar} alt={users[0].name} />
                      <AvatarFallback>{users[0].name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium flex items-center">
                        {users[0].name}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                  <Skeleton className="h-28 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Skeleton className="h-[300px] rounded-xl" />
                  <Skeleton className="h-[300px] rounded-xl" />
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
