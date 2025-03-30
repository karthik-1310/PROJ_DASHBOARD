
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './Sidebar';
import { useTaskStore } from '@/store/taskStore';
import ThemeToggle from './ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';

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
          <header className="border-b p-4 flex justify-between items-center sticky top-0 bg-background z-20">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Kanban Garden Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
          <main className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((col) => (
                    <div key={col} className="w-[300px] h-[calc(100vh-10rem)] rounded-md">
                      <Skeleton className="h-10 w-full mb-4" />
                      {[1, 2, 3].map((item) => (
                        <Skeleton key={item} className="h-28 w-full mb-3" />
                      ))}
                    </div>
                  ))}
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
