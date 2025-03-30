
import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTaskStore, Task, Status } from '@/store/taskStore';
import KanbanColumn from '@/components/KanbanColumn';
import { TaskDragOverlay } from '@/components/dnd/DragOverlay';
import TaskFormDialog from '@/components/TaskFormDialog';
import TaskDetailDialog from '@/components/TaskDetailDialog';
import SearchAndFilter from '@/components/SearchAndFilter';
import { isPast, parseISO, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Kanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KanbanBoard = () => {
  const { 
    tasks, 
    tags, 
    users, 
    boardConfig,
    moveTask,
    addTask,
    searchTerm,
    filters
  } = useTaskStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<Status | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  );
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    // Search term filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Assignee filter
    if (filters.assignee && task.assigneeId !== filters.assignee) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority.length > 0 && 
        !filters.priority.includes(task.priority)) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange && task.deadline) {
      const taskDate = parseISO(task.deadline);
      const fromDate = filters.dateRange.from ? parseISO(filters.dateRange.from) : null;
      const toDate = filters.dateRange.to ? parseISO(filters.dateRange.to) : null;
      
      if (fromDate && toDate) {
        if (!isWithinInterval(taskDate, { start: fromDate, end: toDate })) {
          return false;
        }
      } else if (fromDate && taskDate < fromDate) {
        return false;
      } else if (toDate && taskDate > toDate) {
        return false;
      }
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!task.tags.some(tagId => filters.tags!.includes(tagId))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Group tasks by status
  const tasksByStatus = boardConfig.columns.reduce<Record<Status, Task[]>>((acc, column) => {
    acc[column.id] = filteredTasks
      .filter(task => task.status === column.id)
      .sort((a, b) => {
        // Sort by priority first (high -> medium -> low)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by deadline (closer deadlines first)
        if (a.deadline && b.deadline) {
          return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
        }
        
        // Deadline takes precedence over non-deadline
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        
        // Finally by creation date (newer first)
        return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
      });
    return acc;
  }, { 'todo': [], 'in-progress': [], 'review': [], 'done': [] });
  
  // Find the currently dragged task
  const activeTask = activeId ? tasks.find(task => task.id === activeId) || null : null;
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const taskId = String(active.id);
      const destination = String(over.id) as Status;
      
      moveTask(taskId, destination);
      toast({
        title: "Task moved",
        description: `Task moved to ${destination.replace('-', ' ')}.`,
      });
    }
    
    setActiveId(null);
  };
  
  const handleAddTask = (status: Status) => {
    setInitialStatus(status);
    setFormDialogOpen(true);
  };

  const handleAddTaskGeneral = () => {
    setInitialStatus('todo');
    setFormDialogOpen(true);
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'history'>) => {
    const newTaskId = addTask(taskData);
    toast({
      title: "Task created",
      description: "New task has been created successfully.",
    });
    return newTaskId;
  };
  
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailDialogOpen(true);
  };
  
  // Count tasks by status for column headers
  const taskCounts = Object.entries(tasksByStatus).reduce((acc, [status, tasks]) => {
    acc[status as Status] = tasks.length;
    return acc;
  }, {} as Record<Status, number>);
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Kanban className="h-6 w-6" /> Kanban Board
          </h1>
          <p className="text-muted-foreground">Drag and drop tasks between columns to update their status</p>
        </div>
        
        <Button onClick={handleAddTaskGeneral} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>
      
      <SearchAndFilter users={users} tags={tags} />
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 mt-4">
          {boardConfig.columns.map(column => (
            <KanbanColumn
              key={column.id}
              status={column.id}
              title={`${column.title} (${taskCounts[column.id] || 0})`}
              tasks={tasksByStatus[column.id]}
              tags={tags}
              users={users}
              onAddTask={handleAddTask}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
        
        <TaskDragOverlay 
          activeTask={activeTask}
          tags={tags}
          users={users}
        />
      </DndContext>
      
      <TaskFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSave={handleSaveTask}
        users={users}
        tags={tags}
        initialStatus={initialStatus}
      />
      
      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        taskId={selectedTaskId}
      />
    </>
  );
};

export default KanbanBoard;
