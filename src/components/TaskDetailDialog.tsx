
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Task, 
  User, 
  Tag, 
  useTaskStore,
  Status
} from '@/store/taskStore';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import TaskFormDialog from './TaskFormDialog';
import { useToast } from '@/hooks/use-toast';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
}

const TaskDetailDialog = ({ open, onOpenChange, taskId }: TaskDetailDialogProps) => {
  const { tasks, users, tags, updateTask, deleteTask } = useTaskStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return null;
  
  const assignee = users.find(user => user.id === task.assigneeId);
  const taskTags = tags.filter(tag => task.tags.includes(tag.id));
  
  const handleUpdateTask = (updatedTaskData: Omit<Task, 'id' | 'createdAt' | 'history'>) => {
    updateTask(task.id, updatedTaskData);
    toast({
      title: "Task updated",
      description: "The task has been updated successfully.",
    });
  };
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    onOpenChange(false);
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully.",
      variant: "destructive",
    });
  };
  
  const statusLabels: Record<Status, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'done': 'Done'
  };
  
  const priorityLabels: Record<string, { label: string, color: string }> = {
    'high': { label: 'High Priority', color: 'text-priority-high' },
    'medium': { label: 'Medium Priority', color: 'text-priority-medium' },
    'low': { label: 'Low Priority', color: 'text-priority-low' }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-xl">{task.title}</span>
              <Badge variant="outline" className={priorityLabels[task.priority].color}>
                {priorityLabels[task.priority].label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {assignee && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Assignee:</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{assignee.name}</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Status: <span className="font-medium text-foreground">{statusLabels[task.status]}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <div className="text-sm bg-muted/40 p-3 rounded-md whitespace-pre-wrap">
                {task.description || "No description provided."}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(task.createdAt), 'PP')} ({formatDistanceToNow(parseISO(task.createdAt), { addSuffix: true })})
                </p>
              </div>
              
              {task.deadline && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Deadline</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(task.deadline), 'PP')} ({formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })})
                  </p>
                </div>
              )}
            </div>
            
            {taskTags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {taskTags.map(tag => (
                    <Badge 
                      key={tag.id} 
                      variant="outline" 
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">History</h3>
              <ul className="space-y-2">
                {task.history.map((entry, index) => (
                  <li key={index} className="text-xs flex">
                    <div className="mr-2 flex-shrink-0">
                      {format(parseISO(entry.timestamp), 'PP p')}:
                    </div>
                    <div>
                      Status changed to <span className="font-medium">{statusLabels[entry.status]}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this task? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="default" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <TaskFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateTask}
        editTask={task}
        users={users}
        tags={tags}
      />
    </>
  );
};

export default TaskDetailDialog;
