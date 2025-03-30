
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  BarChart2, 
  Calendar, 
  Users, 
  Settings, 
  Kanban, 
  CheckSquare,
  Clock
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard
  },
  {
    title: 'Kanban Board',
    path: '/kanban',
    icon: Kanban
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart2
  },
  {
    title: 'Calendar',
    path: '/calendar',
    icon: Calendar
  },
  {
    title: 'Team',
    path: '/team',
    icon: Users
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings
  }
];

const Sidebar = () => {
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    // Get from localStorage, default to true
    const stored = localStorage.getItem('sidebarExpanded');
    return stored ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    // Save sidebar state to localStorage when it changes
    localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const handleToggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <>
      <SidebarComponent expanded={isSidebarExpanded} className="shadow-md">
        <div className="flex items-center h-16 px-4 border-b">
          <div className="flex items-center gap-2">
            {isSidebarExpanded && <span className="text-lg font-bold">Kanban Garden</span>}
            {!isSidebarExpanded && <Kanban className="h-6 w-6" />}
          </div>
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={!isSidebarExpanded ? 'sr-only' : ''}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild active={location.pathname === item.path}>
                      <a 
                        href={item.path} 
                        className="flex items-center gap-3"
                        aria-current={location.pathname === item.path ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                        {isSidebarExpanded && <span>{item.title}</span>}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {isSidebarExpanded && (
            <SidebarGroup>
              <SidebarGroupLabel>Recent Tasks</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#" className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <span className="truncate">Design Homepage UI</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#" className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="truncate">API Integration</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </SidebarComponent>
      
      <div className="absolute left-4 bottom-4 z-50">
        <SidebarTrigger onClick={handleToggleSidebar} />
      </div>
    </>
  );
};

export default Sidebar;
