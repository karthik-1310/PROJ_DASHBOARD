
import { DragOverlay } from '@dnd-kit/core';
import { Task, Tag, User } from '@/store/taskStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface TaskDragOverlayProps {
  activeTask: Task | null;
  tags: Tag[];
  users: User[];
}

export function TaskDragOverlay({ activeTask, tags, users }: TaskDragOverlayProps) {
  if (!activeTask) return null;
  
  const assignee = users.find(user => user.id === activeTask.assigneeId);
  const taskTags = tags.filter(tag => activeTask.tags.includes(tag.id));
  
  const isDeadlinePassed = activeTask.deadline && isPast(parseISO(activeTask.deadline));
  const deadlineLabel = activeTask.deadline 
    ? formatDistanceToNow(parseISO(activeTask.deadline), { addSuffix: true })
    : null;

  const priorityClasses: Record<string, string> = {
    high: 'border-l-4 border-priority-high',
    medium: 'border-l-4 border-priority-medium',
    low: 'border-l-4 border-priority-low'
  };

  return (
    <DragOverlay>
      <div className={`task-card shadow-xl w-[300px] ${priorityClasses[activeTask.priority]}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm">{activeTask.title}</h3>
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
          {activeTask.description}
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
        
        {activeTask.deadline && (
          <div className={`text-xs flex items-center mt-1 ${isDeadlinePassed ? 'text-priority-high' : 'text-muted-foreground'}`}>
            {isDeadlinePassed && <AlertCircle className="h-3 w-3 mr-1" />}
            {deadlineLabel}
          </div>
        )}
      </div>
    </DragOverlay>
  );
}
