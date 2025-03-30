
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { Task, Tag, User, Priority } from '@/store/taskStore';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Draggable } from '@/components/dnd/Draggable';
import { AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  tags: Tag[];
  users: User[];
  onClick: (taskId: string) => void;
}

const priorityClasses: Record<Priority, string> = {
  high: 'border-l-4 border-priority-high',
  medium: 'border-l-4 border-priority-medium',
  low: 'border-l-4 border-priority-low'
};

const TaskCard = ({ task, index, tags, users, onClick }: TaskCardProps) => {
  const assignee = users.find(user => user.id === task.assigneeId);
  const taskTags = tags.filter(tag => task.tags.includes(tag.id));
  
  const isDeadlinePassed = task.deadline && isPast(parseISO(task.deadline));
  const deadlineLabel = task.deadline 
    ? formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })
    : null;
  
  return (
    <Draggable id={task.id} index={index}>
      <div 
        className={`task-card ${priorityClasses[task.priority]}`}
        onClick={() => onClick(task.id)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm">{task.title}</h3>
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar} alt={assignee.name} />
              <AvatarFallback>
                {assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {taskTags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="outline" 
              className="text-xs px-1" 
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        
        {task.deadline && (
          <div className={`text-xs flex items-center mt-1 ${isDeadlinePassed ? 'text-priority-high' : 'text-muted-foreground'}`}>
            {isDeadlinePassed && <AlertCircle className="h-3 w-3 mr-1" />}
            {deadlineLabel}
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default TaskCard;
