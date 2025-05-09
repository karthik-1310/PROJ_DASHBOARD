
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  Clock,
  PanelLeft,
  User
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
    title: 'Profile',
    path: '/profile',
    icon: User
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
      <SidebarComponent className="shadow-md bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Kanban className={`h-6 w-6 text-sidebar-primary ${isSidebarExpanded ? 'mr-2' : ''}`} />
            {isSidebarExpanded && <span className="text-lg font-bold text-sidebar-foreground">Kanban Garden</span>}
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
                    <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                      <Link
                        to={item.path} 
                        className="flex items-center gap-3 rounded-lg hover:bg-sidebar-accent transition-colors"
                        aria-current={location.pathname === item.path ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                        {isSidebarExpanded && <span>{item.title}</span>}
                      </Link>
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
                      <Link to="/kanban" className="flex items-center gap-3 rounded-lg hover:bg-sidebar-accent transition-colors">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <span className="truncate">Design Homepage UI</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/kanban" className="flex items-center gap-3 rounded-lg hover:bg-sidebar-accent transition-colors">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="truncate">API Integration</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </SidebarComponent>
      
      <div className="absolute left-4 bottom-4 z-50">
        <SidebarTrigger onClick={handleToggleSidebar} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80">
          <PanelLeft className="h-4 w-4" />
        </SidebarTrigger>
      </div>
    </>
  );
};

export default Sidebar;
