
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/store/taskStore';
import { formatDistanceToNow, isPast, parseISO, format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Bell, 
  CheckCircle, 
  Clock, 
  FileEdit, 
  Info,
  BarChart2,
  PieChart,
  TrendingUp,
  Users
} from 'lucide-react';
import { PieChart as ReChartPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  'todo': '#e11d48',
  'in-progress': '#fb923c', 
  'review': '#3b82f6',
  'done': '#10b981'
};

const Dashboard = () => {
  const { tasks, users, tags, activities } = useTaskStore();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // Status distribution data
  const statusDistribution = Object.entries(
    tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => {
    const statusLabels: Record<string, string> = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'review': 'Review',
      'done': 'Done'
    };
    
    return {
      name: statusLabels[status] || status,
      value: count,
      status
    };
  });
  
  // Get priority breakdown
  const priorityBreakdown = Object.entries(
    tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {})
  ).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    color: priority === 'high' ? '#DC2626' : priority === 'medium' ? '#F59E0B' : '#10B981'
  }));
  
  // Calculate completion rate
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  // Find overdue tasks
  const overdueTasks = tasks.filter(
    task => task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'done'
  ).sort((a, b) => {
    if (a.deadline && b.deadline) {
      return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
    }
    return 0;
  });
  
  // Get recent activities
  const recentActivities = [...activities]
    .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())
    .slice(0, 5);
  
  // Get recently completed tasks
  const recentlyCompletedTasks = tasks
    .filter(task => task.status === 'done')
    .sort((a, b) => {
      const aCompletedAt = a.history.find(h => h.status === 'done')?.timestamp;
      const bCompletedAt = b.history.find(h => h.status === 'done')?.timestamp;
      
      if (aCompletedAt && bCompletedAt) {
        return parseISO(bCompletedAt).getTime() - parseISO(aCompletedAt).getTime();
      }
      return 0;
    })
    .slice(0, 3);
  
  // Get high priority tasks
  const highPriorityTasks = tasks
    .filter(task => task.priority === 'high' && task.status !== 'done')
    .slice(0, 3);
  
  const dismissAlert = (taskId: string) => {
    setDismissedAlerts([...dismissedAlerts, taskId]);
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <FileEdit className="h-5 w-5 text-green-500" />;
      case 'update': return <Info className="h-5 w-5 text-blue-500" />;
      case 'delete': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'status-change': return <CheckCircle className="h-5 w-5 text-amber-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      
      {/* Alert for overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="grid gap-3">
          {overdueTasks
            .filter(task => !dismissedAlerts.includes(task.id))
            .slice(0, 3)
            .map(task => (
              <Alert key={task.id} variant="destructive" className="flex justify-between items-center rounded-xl shadow-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <AlertTitle>Overdue Task</AlertTitle>
                    <AlertDescription>
                      "{task.title}" is overdue by{' '}
                      {formatDistanceToNow(parseISO(task.deadline!), { addSuffix: false })}
                    </AlertDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/kanban">View Task</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dismissAlert(task.id)}>
                    Dismiss
                  </Button>
                </div>
              </Alert>
            ))}
          {overdueTasks.length > 3 && (
            <div className="text-sm text-muted-foreground text-center">
              + {overdueTasks.length - 3} more overdue tasks
            </div>
          )}
        </div>
      )}
      
      {/* Stats row - Bento grid style with icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-xs text-muted-foreground">
              Across all projects
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">
              {completedTasks} of {tasks.length} tasks completed
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(task => task.status === 'in-progress').length}
            </div>
            <div className="text-xs text-muted-foreground">
              Active tasks
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-priority-high">
              {overdueTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Tasks past deadline
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts row - Improved bento grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Task Status</CardTitle>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Distribution of tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReChartPie>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry) => (
                      <Cell 
                        key={entry.status} 
                        fill={STATUS_COLORS[entry.status] || '#ccc'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </ReChartPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Task Priority</CardTitle>
              <BarChart2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Breakdown by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityBreakdown}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Tasks">
                    {priorityBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity and tasks row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Activity</CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Latest updates across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">No recent activities</div>
              ) : (
                recentActivities.map((activity) => {
                  const relativeTime = formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true });
                  
                  return (
                    <div key={activity.id} className="flex p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="mr-4 flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {relativeTime}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>High Priority Tasks</CardTitle>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <CardDescription>Tasks that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highPriorityTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-3">No high priority tasks</div>
                ) : (
                  highPriorityTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[task.status] }}
                      ></div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex items-center">
                          {task.deadline && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{format(parseISO(task.deadline), 'MMM dd')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {task.assigneeId && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={users.find(u => u.id === task.assigneeId)?.avatar} 
                            alt={users.find(u => u.id === task.assigneeId)?.name} 
                          />
                          <AvatarFallback>
                            {users.find(u => u.id === task.assigneeId)?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recently Completed</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <CardDescription>Tasks that were recently finished</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentlyCompletedTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-3">No completed tasks yet</div>
                ) : (
                  recentlyCompletedTasks.map((task) => {
                    const completedEntry = task.history.find(h => h.status === 'done');
                    const completedDate = completedEntry 
                      ? formatDistanceToNow(parseISO(completedEntry.timestamp), { addSuffix: true }) 
                      : 'recently';
                    
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                        <div className="bg-green-500 h-3 w-3 rounded-full"></div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Completed {completedDate}
                          </p>
                        </div>
                        
                        {task.tags.length > 0 && (
                          <div className="flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                color: tags.find(t => t.id === task.tags[0])?.color,
                                borderColor: tags.find(t => t.id === task.tags[0])?.color
                              }}
                              className="rounded-full"
                            >
                              {tags.find(t => t.id === task.tags[0])?.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Get Started Card */}
      {tasks.length === 0 && (
        <Card className="mt-6 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader>
            <CardTitle>Welcome to Your Kanban Project Management Board</CardTitle>
            <CardDescription>Get started by creating your first task</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="max-w-md text-center mb-6">
              <p className="mb-4">
                This board helps you track tasks, collaborate with team members, and visualize workflow progress.
              </p>
              <Button asChild>
                <Link to="/kanban">Go to Kanban Board</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
              <div className="border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                <h3 className="font-medium mb-1">Create Tasks</h3>
                <p className="text-sm text-muted-foreground">Add and organize your tasks by status</p>
              </div>
              <div className="border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                <h3 className="font-medium mb-1">Drag & Drop</h3>
                <p className="text-sm text-muted-foreground">Move tasks between columns as they progress</p>
              </div>
              <div className="border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                <h3 className="font-medium mb-1">Track Progress</h3>
                <p className="text-sm text-muted-foreground">Monitor progress with visual analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
