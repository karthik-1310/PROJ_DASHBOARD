
import { Button } from '@/components/ui/button';
import { Task, Tag, User, Status } from '@/store/taskStore';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { Droppable } from '@/components/dnd/Droppable';

interface KanbanColumnProps {
  status: Status;
  title: string;
  tasks: Task[];
  tags: Tag[];
  users: User[];
  onAddTask: (status: Status) => void;
  onTaskClick: (taskId: string) => void;
}

const KanbanColumn = ({ 
  status, 
  title, 
  tasks, 
  tags, 
  users, 
  onAddTask, 
  onTaskClick 
}: KanbanColumnProps) => {
  return (
    <div className="task-column">
      <div className="column-header">
        <div className="flex items-center">
          <h2>{title}</h2>
          <div className="ml-2 bg-muted text-muted-foreground rounded-full px-2 text-xs">
            {tasks.length}
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8"
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${title}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Droppable id={status}>
        <div className="column-content">
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-20 border border-dashed rounded-md bg-muted/40 text-muted-foreground text-sm">
              No tasks yet
            </div>
          )}
          {tasks.map((task, index) => (
            <TaskCard 
              key={task.id}
              task={task}
              index={index}
              tags={tags}
              users={users}
              onClick={onTaskClick}
            />
          ))}
        </div>
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
