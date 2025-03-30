
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './Sidebar';
import { useTaskStore } from '@/store/taskStore';
import ThemeToggle from './ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Search, User } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [loading, setLoading] = useState(true);
  const { initializeTasks } = useTaskStore();

  useEffect(() => {
    // Initialize tasks from localStorage
    initializeTasks();
    
    // Simulate loading for skeleton UI
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [initializeTasks]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <header className="border-b p-4 flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-20 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Kanban Garden Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full bg-muted/50 focus:bg-muted focus:outline-none focus:ring-1 focus:ring-primary w-[180px] text-sm"
                />
              </div>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5" />
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
