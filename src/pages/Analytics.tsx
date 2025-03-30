
import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as RechartBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  BarChart2, 
  CalendarClock, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  ClipboardList, 
  MoreHorizontal, 
  TrendingUp 
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const COLORS = {
  'todo': '#e11d48',
  'in-progress': '#fb923c', 
  'review': '#3b82f6',
  'done': '#10b981',
  'high': '#ef4444',
  'medium': '#f59e0b',
  'low': '#10b981'
};

const Analytics = () => {
  const { tasks, users } = useTaskStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks'>('overview');
  
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, status: 'todo' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, status: 'in-progress' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, status: 'review' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, status: 'done' },
  ];
  
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, priority: 'high' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, priority: 'medium' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, priority: 'low' },
  ];
  
  const assigneeData = users.map(user => ({
    name: user.name,
    total: tasks.filter(t => t.assigneeId === user.id).length,
    completed: tasks.filter(t => t.assigneeId === user.id && t.status === 'done').length,
  })).sort((a, b) => b.total - a.total);
  
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Weekly task completion data
  const weeklyData = [
    { name: 'Mon', completed: 5, created: 8 },
    { name: 'Tue', completed: 7, created: 6 },
    { name: 'Wed', completed: 4, created: 9 },
    { name: 'Thu', completed: 8, created: 5 },
    { name: 'Fri', completed: 6, created: 4 },
    { name: 'Sat', completed: 2, created: 1 },
    { name: 'Sun', completed: 1, created: 2 },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Visualizing task performance and team productivity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('overview')}
            className="rounded-full"
          >
            Overview
          </Button>
          <Button 
            variant={activeTab === 'team' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('team')}
            className="rounded-full"
          >
            Team
          </Button>
          <Button 
            variant={activeTab === 'tasks' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('tasks')}
            className="rounded-full"
          >
            Tasks
          </Button>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tasks.filter(t => t.status !== 'done').length} tasks pending
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <h3 className="text-2xl font-bold mt-1">{completionRate}%</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks} tasks completed
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.filter(t => t.status === 'in-progress').length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Active tasks being worked on
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden border-t-4 border-t-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.filter(t => t.priority === 'high').length}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Critical tasks requiring attention
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Task Distribution</CardTitle>
              <CardDescription>Current distribution of tasks by status</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.status]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Tasks by Priority</CardTitle>
              <CardDescription>Distribution of tasks by priority level</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart
                data={priorityData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Tasks">
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.priority]} 
                    />
                  ))}
                </Bar>
              </RechartBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Weekly activity chart */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Weekly Activity</CardTitle>
            <CardDescription>Tasks created vs completed over the week</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" name="Tasks Created" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" name="Tasks Completed" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Team Member Performance</CardTitle>
            <CardDescription>Task distribution and completion rates by team member</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/team">View Team <ChevronRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartBarChart
              data={assigneeData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 30,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total Tasks" fill="#94a3b8" />
              <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" />
            </RechartBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Recent Tasks</CardTitle>
            <CardDescription>Recently created tasks in the system</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/kanban">View All <ChevronRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.map(task => {
              const assignee = users.find(u => u.id === task.assigneeId);
              const task_progress = Math.random() * 100;
              
              return (
                <div key={task.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[task.status] }}
                      ></div>
                      <p className="font-medium">{task.title}</p>
                    </div>
                    <Badge 
                      variant={
                        task.status === 'done' ? 'default' :
                        task.priority === 'high' ? 'destructive' : 'outline'
                      } 
                      className="text-xs"
                    >
                      {task.status === 'done' ? 'Complete' : task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{task.status === 'done' ? '100' : Math.round(task_progress)}%</span>
                  </div>
                  
                  <Progress 
                    className="h-1.5" 
                    value={task.status === 'done' ? 100 : task_progress}
                    indicatorClassName={
                      task.status === 'done' ? "bg-green-500" :
                      task_progress > 66 ? "bg-blue-500" : 
                      task_progress > 33 ? "bg-amber-500" : 
                      "bg-red-500"
                    }
                  />
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
                    </div>
                    
                    {assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={assignee.avatar} 
                          alt={assignee.name} 
                        />
                        <AvatarFallback>
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
            
            {recentTasks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tasks created yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
