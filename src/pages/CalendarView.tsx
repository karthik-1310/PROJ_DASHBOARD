
import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { parseISO, isWithinInterval, startOfMonth, endOfMonth, format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { TaskDetailDialog } from '@/components';
import TaskFormDialog from '@/components/TaskFormDialog';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CalendarView = () => {
  const { tasks, tags, users, addTask } = useTaskStore();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Helper to get date range for the view
  const getDateRange = () => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return { start, end };
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { start, end };
    }
  };
  
  // Get all days in the range
  const dateRange = getDateRange();
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  
  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = parseISO(task.deadline);
      return isSameDay(taskDate, date);
    });
  };
  
  // Navigation functions
  const goToToday = () => setCurrentDate(new Date());
  
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      // Go back a week
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };
  
  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      // Go forward a week
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };
  
  // Handle task click
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailDialogOpen(true);
  };
  
  // Handle day click to create task
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setFormDialogOpen(true);
  };
  
  const handleSaveTask = (taskData: any) => {
    addTask(taskData);
    setFormDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            {viewMode === 'month' 
              ? format(currentDate, 'MMMM yyyy')
              : `Week of ${format(getDateRange().start, 'MMM d')} - ${format(getDateRange().end, 'MMM d, yyyy')}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Tabs defaultValue="month" className="w-auto" onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="mx-2" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        {viewMode === 'month' ? (
          <div>
            {/* Month view header */}
            <div className="grid grid-cols-7 text-center border-b">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-3 font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month view body */}
            <div className="grid grid-cols-7 min-h-[600px]">
              {days.map((day, i) => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={i}
                    className={`border-b border-r min-h-[100px] p-2 relative ${
                      isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className={`flex items-center justify-between mb-2 ${!isCurrentMonth && 'text-muted-foreground'}`}>
                      <div className={`h-6 w-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      {dayTasks.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayClick(day);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1 overflow-y-auto max-h-[80px]">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div 
                          key={task.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer border-l-2 border-l-priority-${task.priority}`}
                          style={{ backgroundColor: 'hsl(var(--card))' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(task.id);
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          + {dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* Week view */}
            <div className="grid grid-cols-8 border-b">
              <div className="border-r p-3 text-center font-medium">Time</div>
              {days.map((day) => (
                <div key={day.toString()} className="p-3 text-center border-r">
                  <div className="font-medium">{format(day, 'EEE')}</div>
                  <div className={`text-sm ${isSameDay(day, new Date()) ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {format(day, 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Week time slots */}
            <div className="relative min-h-[600px]">
              {/* Time slots (9am - 5pm) */}
              {Array.from({ length: 9 }, (_, i) => i + 9).map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b">
                  <div className="border-r p-2 text-xs text-muted-foreground text-right">
                    {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}
                  </div>
                  {days.map((day) => {
                    // Find tasks roughly scheduled for this hour
                    const dayTasks = tasks.filter(task => {
                      if (!task.deadline) return false;
                      const taskDate = parseISO(task.deadline);
                      return isSameDay(taskDate, day) && taskDate.getHours() === hour;
                    });
                    
                    return (
                      <div 
                        key={day.toString()} 
                        className="border-r p-1 min-h-[60px]"
                        onClick={() => {
                          const newDate = new Date(day);
                          newDate.setHours(hour);
                          handleDayClick(newDate);
                        }}
                      >
                        {dayTasks.map((task) => (
                          <div 
                            key={task.id}
                            className={`text-xs p-1 mb-1 rounded truncate cursor-pointer border-l-2 border-l-priority-${task.priority}`}
                            style={{ backgroundColor: 'hsl(var(--card))' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(task.id);
                            }}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      
      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        taskId={selectedTaskId}
      />
      
      <TaskFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSave={handleSaveTask}
        users={users}
        tags={tags}
        initialStatus="todo"
        initialDeadline={selectedDate}
      />
    </div>
  );
};

export default CalendarView;
