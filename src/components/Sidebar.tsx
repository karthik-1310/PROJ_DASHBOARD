
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
  User,
  MessageSquare
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
  const { tasks, users } = useTaskStore();
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

  // Get high priority tasks for recent tasks section
  const recentTasks = tasks
    .filter(task => task.priority === 'high' && task.status !== 'done')
    .slice(0, 2);

  return (
    <>
      <SidebarComponent className="shadow-md bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Kanban className={`h-6 w-6 text-primary ${isSidebarExpanded ? 'mr-2' : ''}`} />
            {isSidebarExpanded && <span className="text-lg font-bold text-sidebar-foreground">Task Garden</span>}
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
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Recent Tasks</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {recentTasks.length > 0 ? (
                      recentTasks.map((task) => (
                        <SidebarMenuItem key={task.id}>
                          <SidebarMenuButton asChild>
                            <Link to="/kanban" className="flex items-center gap-3 rounded-lg hover:bg-sidebar-accent transition-colors">
                              {task.priority === 'high' ? (
                                <Clock className="h-4 w-4 text-amber-500" />
                              ) : (
                                <CheckSquare className="h-4 w-4 text-green-500" />
                              )}
                              <span className="truncate">{task.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-sidebar-foreground/70">
                        No high priority tasks
                      </div>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <SidebarGroup>
                <SidebarGroupLabel>Team</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-1 py-2">
                    <div className="flex flex-wrap gap-1">
                      {users.slice(0, 4).map(user => (
                        <div key={user.id} className="relative">
                          <Avatar className="h-8 w-8 border-2 border-sidebar-background">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-2 border-sidebar-background"></div>
                        </div>
                      ))}
                      
                      {users.length > 4 && (
                        <div className="bg-sidebar-accent h-8 w-8 rounded-full flex items-center justify-center text-xs">
                          +{users.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <div className="mt-auto p-3">
                <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={users[0]?.avatar} alt={users[0]?.name || 'User'} />
                    <AvatarFallback>{users[0]?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{users[0]?.name || 'User'}</div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
                      <span className="text-xs text-sidebar-foreground/70">Online</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center rounded-full">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Badge>
                </div>
              </div>
            </>
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
