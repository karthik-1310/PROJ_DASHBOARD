import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { BarChart2, CalendarClock, CheckSquare, Clock, ClipboardList } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  
  // Calculate task status distribution
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, status: 'todo' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, status: 'in-progress' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, status: 'review' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, status: 'done' },
  ];
  
  // Calculate priority distribution
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, priority: 'high' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, priority: 'medium' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, priority: 'low' },
  ];
  
  // Calculate tasks per assignee
  const assigneeData = users.map(user => ({
    name: user.name,
    total: tasks.filter(t => t.assigneeId === user.id).length,
    completed: tasks.filter(t => t.assigneeId === user.id && t.status === 'done').length,
  })).sort((a, b) => b.total - a.total);
  
  // Calculate completion rate
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  // Get recent tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6" /> Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visualizing task performance and team productivity
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {tasks.filter(t => t.status !== 'done').length} tasks pending
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <h3 className="text-2xl font-bold mt-1">{completionRate}%</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} tasks completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.filter(t => t.status === 'in-progress').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active tasks being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <h3 className="text-2xl font-bold mt-1">{tasks.filter(t => t.priority === 'high').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Critical tasks requiring attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="rounded-xl hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>
              Current distribution of tasks by status
            </CardDescription>
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
        
        {/* Priority Distribution */}
        <Card className="rounded-xl hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>
              Distribution of tasks by priority level
            </CardDescription>
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
      
      {/* Team Performance */}
      <Card className="rounded-xl hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Team Member Performance</CardTitle>
          <CardDescription>
            Task distribution and completion rates by team member
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
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
      
      {/* Recent Activity */}
      <Card className="rounded-xl hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            Recently created tasks in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.map(task => {
              const assignee = users.find(u => u.id === task.assigneeId);
              
              return (
                <div key={task.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {assignee ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Clock className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{task.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 
                        'bg-green-500'
                      }`}></span>
                      <span className="text-xs text-muted-foreground">
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority • 
                        Created {formatDistanceToNow(new Date(task.createdAt))} ago
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'todo' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      task.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' :
                      task.status === 'review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {task.status === 'todo' ? 'To Do' :
                       task.status === 'in-progress' ? 'In Progress' :
                       task.status === 'review' ? 'Review' : 'Done'}
                    </span>
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
