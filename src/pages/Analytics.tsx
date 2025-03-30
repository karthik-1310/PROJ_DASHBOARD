
import { useState, useMemo } from 'react';
import { useTaskStore, Task, Status } from '@/store/taskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { parseISO, format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, isBefore } from 'date-fns';

const COLORS = ['#e11d48', '#fb923c', '#3b82f6', '#10b981'];
const STATUS_COLORS = {
  'todo': '#e11d48',
  'in-progress': '#fb923c', 
  'review': '#3b82f6',
  'done': '#10b981'
};

const PRIORITY_COLORS = {
  'high': '#DC2626',
  'medium': '#F59E0B',
  'low': '#10B981'
};

const statusLabels: Record<Status, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done'
};

const Analytics = () => {
  const { tasks } = useTaskStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  
  // Status distribution data
  const statusDistribution = useMemo(() => {
    const distribution = tasks.reduce<Record<Status, number>>(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      { 'todo': 0, 'in-progress': 0, 'review': 0, 'done': 0 }
    );
    
    return Object.entries(distribution).map(([status, count]) => ({
      name: statusLabels[status as Status],
      value: count,
      status: status
    }));
  }, [tasks]);
  
  // Priority distribution
  const priorityDistribution = useMemo(() => {
    const distribution = tasks.reduce<Record<string, number>>(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
    
    return Object.entries(distribution).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      priority: priority
    }));
  }, [tasks]);
  
  // Task completion over time
  const completionOverTime = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;
    
    // Set start date based on selected time range
    if (timeRange === 'week') {
      start = startOfWeek(now);
    } else if (timeRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // Quarter - 3 months ago
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    }
    
    // Get all days in the interval
    const days = eachDayOfInterval({ start, end });
    
    // Map days to completion counts
    return days.map(day => {
      // Count tasks completed on this day
      const completed = tasks.filter(task => {
        if (task.status === 'done' && task.history.length > 0) {
          // Find when the task was marked as done
          const doneEvent = task.history.find(h => h.status === 'done');
          if (doneEvent) {
            const doneDate = parseISO(doneEvent.timestamp);
            // Check if completion date is on the current day
            return format(doneDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
          }
        }
        return false;
      }).length;
      
      return {
        date: format(day, 'MM/dd'),
        completed,
        fullDate: day
      };
    });
  }, [tasks, timeRange]);
  
  // Calculate completion rate
  const completionRate = useMemo(() => {
    const completed = tasks.filter(task => task.status === 'done').length;
    const total = tasks.length;
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [tasks]);
  
  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const upcoming = tasks
      .filter(task => task.deadline && !isPast(parseISO(task.deadline)) && task.status !== 'done')
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
        }
        return 0;
      })
      .slice(0, 5);
    
    return upcoming.map(task => ({
      id: task.id,
      title: task.title,
      deadline: task.deadline ? format(parseISO(task.deadline), 'MMM dd') : 'No deadline',
      status: task.status,
      priority: task.priority
    }));
  }, [tasks]);
  
  // Average time in each status
  const averageTimeInStatus = useMemo(() => {
    const statusDurations: Record<Status, number[]> = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': []
    };
    
    tasks.forEach(task => {
      const { history } = task;
      
      if (history.length > 1) {
        // Calculate duration for each status change
        for (let i = 0; i < history.length - 1; i++) {
          const currentEntry = history[i];
          const nextEntry = history[i + 1];
          const status = currentEntry.status;
          
          const startTime = parseISO(currentEntry.timestamp);
          const endTime = parseISO(nextEntry.timestamp);
          
          // Calculate duration in hours
          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          statusDurations[status].push(durationHours);
        }
        
        // For the last status (current status), calculate time from last change until now
        const lastEntry = history[history.length - 1];
        const lastStatus = lastEntry.status;
        const startTime = parseISO(lastEntry.timestamp);
        const endTime = new Date();
        
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        statusDurations[lastStatus].push(durationHours);
      }
    });
    
    // Calculate averages
    return Object.entries(statusDurations).map(([status, durations]) => {
      const average = durations.length > 0 
        ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
        : 0;
      
      return {
        name: statusLabels[status as Status],
        hours: Math.round(average * 10) / 10, // Round to 1 decimal
        status
      };
    });
  }, [tasks]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
      
      <Tabs defaultValue="week" className="mb-8">
        <TabsList>
          <TabsTrigger value="week" onClick={() => setTimeRange('week')}>This Week</TabsTrigger>
          <TabsTrigger value="month" onClick={() => setTimeRange('month')}>This Month</TabsTrigger>
          <TabsTrigger value="quarter" onClick={() => setTimeRange('quarter')}>This Quarter</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
            <CardDescription>Overall task completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="text-sm text-muted-foreground">
              {tasks.filter(task => task.status === 'done').length} of {tasks.length} tasks completed
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Completion Time</CardTitle>
            <CardDescription>From creation to done</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageTimeInStatus.reduce((sum, status) => sum + status.hours, 0).toFixed(1)} hours
            </div>
            <div className="text-sm text-muted-foreground">
              Across all completed tasks
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasks In Progress</CardTitle>
            <CardDescription>Current active tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tasks.filter(task => task.status === 'in-progress').length}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((tasks.filter(task => task.status === 'in-progress').length / tasks.length) * 100)}% of all tasks
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overdue Tasks</CardTitle>
            <CardDescription>Tasks past deadline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-priority-high">
              {tasks.filter(task => 
                task.deadline && 
                isPast(parseISO(task.deadline)) && 
                task.status !== 'done'
              ).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Require immediate attention
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status as Status]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityDistribution}
                  margin={{
                    top: 5,
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
                  <Bar dataKey="value" name="Tasks">
                    {priorityDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PRIORITY_COLORS[entry.priority as 'high' | 'medium' | 'low']} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Over Time</CardTitle>
            <CardDescription>Tasks completed over {timeRange}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={completionOverTime}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Tasks Completed"
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Average Time in Each Status</CardTitle>
            <CardDescription>Hours spent in each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={averageTimeInStatus}
                  margin={{
                    top: 5,
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
                  <Bar dataKey="hours" name="Average hours">
                    {averageTimeInStatus.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status as Status]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Tasks with the closest deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Task</th>
                  <th className="text-left py-3 px-2">Deadline</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-3 text-muted-foreground">
                      No upcoming deadlines
                    </td>
                  </tr>
                ) : (
                  upcomingDeadlines.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-muted/40">
                      <td className="py-3 px-2">{task.title}</td>
                      <td className="py-3 px-2">{task.deadline}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center">
                          <span 
                            className="h-2 w-2 rounded-full mr-2"
                            style={{ backgroundColor: STATUS_COLORS[task.status as Status] }}
                          ></span>
                          {statusLabels[task.status as Status]}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className="inline-block px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: PRIORITY_COLORS[task.priority as 'high' | 'medium' | 'low'],
                            color: 'white'
                          }}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
