
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export function Droppable({ id, children }: DroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id
  });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`h-full flex-grow ${isOver ? 'bg-secondary/50' : ''}`}
    >
      {children}
    </div>
  );
}
