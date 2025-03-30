
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTaskStore } from '@/store/taskStore';
import { format, parseISO, subDays, subMonths, isWithinInterval } from 'date-fns';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  LineChart, Line, AreaChart, Area, Legend 
} from 'recharts';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Users, 
  Clock, 
  Calendar,
  TrendingUp,
  CheckSquare,
  Tag
} from 'lucide-react';

const STATUS_COLORS = {
  'todo': '#e11d48',
  'in-progress': '#fb923c', 
  'review': '#3b82f6',
  'done': '#10b981'
};

const STATUS_LABELS = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done'
};

const TIME_PERIODS = {
  '7days': 'Last 7 Days',
  '30days': 'Last 30 Days',
  '90days': 'Last 90 Days',
  'all': 'All Time'
};

const Analytics = () => {
  const { tasks, users, tags } = useTaskStore();
  const [timePeriod, setTimePeriod] = useState<keyof typeof TIME_PERIODS>('30days');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter tasks based on selected time period
  const getFilteredTasks = () => {
    if (timePeriod === 'all') return tasks;
    
    const now = new Date();
    let startDate: Date;
    
    switch (timePeriod) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    return tasks.filter(task => {
      const taskDate = parseISO(task.createdAt);
      return taskDate >= startDate && taskDate <= now;
    });
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Status distribution data for pie chart
  const statusDistribution = Object.entries(
    filteredTasks.reduce<Record<string, number>>(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, 
      { 'todo': 0, 'in-progress': 0, 'review': 0, 'done': 0 }
    )
  ).map(([status, count]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value: count,
    status
  }));
  
  // Priority distribution data for bar chart
  const priorityDistribution = Object.entries(
    filteredTasks.reduce<Record<string, number>>(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, 
      { 'low': 0, 'medium': 0, 'high': 0 }
    )
  ).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    color: priority === 'high' ? '#DC2626' : priority === 'medium' ? '#F59E0B' : '#10B981'
  }));
  
  // Task completion over time data for line chart
  const getCompletionOverTime = () => {
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let interval: number;
    
    // Determine time range and formatting based on selected period
    switch (timePeriod) {
      case '7days':
        startDate = subDays(now, 7);
        dateFormat = 'MMM dd';
        interval = 1; // daily
        break;
      case '30days':
        startDate = subDays(now, 30);
        dateFormat = 'MMM dd';
        interval = 3; // every 3 days
        break;
      case '90days':
        startDate = subDays(now, 90);
        dateFormat = 'MMM dd';
        interval = 7; // weekly
        break;
      case 'all':
      default:
        startDate = subMonths(now, 6);
        dateFormat = 'MMM yyyy';
        interval = 30; // monthly
    }
    
    // Generate date points based on interval
    const datePoints: Date[] = [];
    for (let d = new Date(startDate); d <= now; d = addDays(d, interval)) {
      datePoints.push(new Date(d));
    }
    
    // Ensure the current date is included
    if (datePoints[datePoints.length - 1].getTime() !== now.getTime()) {
      datePoints.push(now);
    }
    
    // Map date points to data points with completion counts
    return datePoints.map(date => {
      const dateStr = format(date, dateFormat);
      const endDate = addDays(date, interval);
      
      // Count tasks completed on or before this date point
      const completedCount = filteredTasks.filter(task => {
        const completedEvent = task.history.find(h => h.status === 'done');
        if (!completedEvent) return false;
        
        const completedDate = parseISO(completedEvent.timestamp);
        return completedDate <= date;
      }).length;
      
      // Count tasks created on or before this date point
      const createdCount = filteredTasks.filter(task => {
        const createdDate = parseISO(task.createdAt);
        return createdDate <= date;
      }).length;
      
      return {
        date: dateStr,
        completed: completedCount,
        created: createdCount,
        completion_rate: createdCount > 0 ? Math.round((completedCount / createdCount) * 100) : 0
      };
    });
  };
  
  // Helper function to add days to a date
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  // User productivity data
  const userProductivity = users.map(user => {
    const userTasks = filteredTasks.filter(task => task.assigneeId === user.id);
    const completedTasks = userTasks.filter(task => task.status === 'done');
    const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
    
    return {
      id: user.id,
      name: user.name,
      total: userTasks.length,
      completed: completedTasks.length,
      inProgress: userTasks.filter(task => task.status === 'in-progress').length,
      completionRate,
    };
  }).sort((a, b) => b.total - a.total);
  
  // Tag distribution data
  const tagDistribution = tags.map(tag => {
    const taggedTasks = filteredTasks.filter(task => task.tags.includes(tag.id));
    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: taggedTasks.length,
      completedCount: taggedTasks.filter(task => task.status === 'done').length
    };
  }).sort((a, b) => b.count - a.count);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track project progress and team performance</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as keyof typeof TIME_PERIODS)}>
            <TabsList>
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Main Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              During {TIME_PERIODS[timePeriod]}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTasks.length > 0 ? 
                Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredTasks.filter(t => t.status === 'done').length} of {filteredTasks.length} completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const completedTasks = filteredTasks.filter(task => task.status === 'done');
                if (completedTasks.length === 0) return '0 days';
                
                let totalDays = 0;
                for (const task of completedTasks) {
                  const completedEvent = task.history.find(h => h.status === 'done');
                  if (completedEvent) {
                    const start = parseISO(task.createdAt);
                    const end = parseISO(completedEvent.timestamp);
                    const diffTime = end.getTime() - start.getTime();
                    const diffDays = diffTime / (1000 * 3600 * 24);
                    totalDays += diffDays;
                  }
                }
                
                return (totalDays / completedTasks.length).toFixed(1) + ' days';
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to complete tasks
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredTasks.map(t => t.assigneeId).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Members with assigned tasks
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" /> Trends
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Team
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Task Status</CardTitle>
                  <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell 
                          key={entry.status} 
                          fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#ccc'} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Priority Distribution */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Priority Levels</CardTitle>
                  <BarChartIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priorityDistribution}
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
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Tasks">
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Tag Distribution */}
            <Card className="shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Task Tags</CardTitle>
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Tasks by tag usage</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tagDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="count" name="Total Tasks" stackId="a">
                      {tagDistribution.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                    <Bar dataKey="completedCount" name="Completed" stackId="b">
                      {tagDistribution.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} fillOpacity={0.4} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Task Completion Over Time */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Task Completion Trend</CardTitle>
                  <LineChartIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Completion progress over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getCompletionOverTime()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      name="Created Tasks"
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      name="Completed Tasks"
                      stroke="#10B981" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Completion Rate Over Time */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Percentage of completed tasks over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getCompletionOverTime()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                    <XAxis dataKey="date" />
                    <YAxis unit="%" />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="completion_rate" 
                      name="Completion Rate"
                      stroke="#3b82f6" 
                      fill="#3b82f680" 
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Team Productivity */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Team Workload</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Task distribution among team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userProductivity.map(user => (
                    <div key={user.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.total} tasks ({user.completionRate}% complete)
                          </div>
                        </div>
                        <div className="text-sm font-medium">{user.completed}/{user.total}</div>
                      </div>
                      
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        {user.total > 0 && (
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${user.completionRate}%` }}
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-2 text-xs">
                        <div className="bg-primary/20 text-primary rounded-full px-2 py-0.5">
                          {user.completed} Completed
                        </div>
                        <div className="bg-amber-500/20 text-amber-500 rounded-full px-2 py-0.5">
                          {user.inProgress} In Progress
                        </div>
                        <div className="bg-red-500/20 text-red-500 rounded-full px-2 py-0.5">
                          {user.total - user.completed - user.inProgress} To Do
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {userProductivity.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No team members with assigned tasks in this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
