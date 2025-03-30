
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
  Users,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { PieChart as ReChartPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { Progress } from '@/components';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold mb-2">
          Start Your Day & Be Productive ✌️
        </h1>
        <div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/kanban">
              <span>Today's Tasks</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Alert for overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
              <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium">You have {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}</h3>
              <p className="text-sm text-muted-foreground">Keep it up! Complete your tasks to increase your productivity.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all projects
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <h3 className="text-2xl font-bold mt-1">{completionRate}%</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks} of {tasks.length} completed
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.filter(task => task.status === 'in-progress').length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Active tasks
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <h3 className="text-2xl font-bold mt-1 text-destructive">{overdueTasks.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks past deadline
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Progress and Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Task Progress</CardTitle>
              <CardDescription>Distribution of tasks by status</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status] || '#ccc'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Task Timeline</CardTitle>
              <CardDescription>Breakdown by priority level</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>Latest updates across projects</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/kanban">See All <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Today's Tasks</CardTitle>
                <CardDescription>Tasks that need immediate attention</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/kanban">See All <ChevronRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highPriorityTasks.length === 0 ? (
                  <div className="text-center text-muted-foreground py-3">No high priority tasks</div>
                ) : (
                  highPriorityTasks.map((task) => {
                    const task_progress = Math.random() * 100;
                    
                    return (
                      <div key={task.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[task.status] }}
                            ></div>
                            <p className="font-medium">{task.title}</p>
                          </div>
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{Math.round(task_progress)}%</span>
                        </div>
                        
                        <Progress 
                          className="h-1.5" 
                          value={task_progress}
                          indicatorClassName={
                            task_progress > 66 ? "bg-green-500" : 
                            task_progress > 33 ? "bg-amber-500" : 
                            "bg-red-500"
                          }
                        />
                        
                        <div className="flex items-center justify-between mt-2">
                          {task.deadline && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{format(parseISO(task.deadline), 'MMM dd')}</span>
                            </div>
                          )}
                          
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
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Recently Completed</CardTitle>
                <CardDescription>Tasks that were recently finished</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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
