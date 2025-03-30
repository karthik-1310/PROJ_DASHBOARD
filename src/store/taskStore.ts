
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatISO } from 'date-fns';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  createdAt: string;
  deadline?: string;
  assigneeId?: string;
  tags: string[];
  history: {
    timestamp: string;
    status: Status;
  }[];
};

export type Column = {
  id: Status;
  title: string;
  limit?: number;
};

export type BoardConfig = {
  columns: Column[];
};

export type TaskActivity = {
  id: string;
  taskId: string;
  type: 'create' | 'update' | 'delete' | 'comment' | 'status-change';
  timestamp: string;
  userId?: string;
  message: string;
  oldValue?: string;
  newValue?: string;
};

interface TaskState {
  tasks: Task[];
  tags: Tag[];
  users: User[];
  activities: TaskActivity[];
  boardConfig: BoardConfig;
  searchTerm: string;
  filters: {
    assignee: string | null;
    priority: Priority[] | null;
    dateRange: { from: string | null; to: string | null } | null;
    tags: string[] | null;
  };
  
  // Actions
  initializeTasks: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'history'>) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'history'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, destination: Status) => void;
  addTag: (tag: Omit<Tag, 'id'>) => string;
  deleteTag: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => string;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  clearFilters: () => void;
  updateBoardConfig: (config: Partial<BoardConfig>) => void;
}

// Initialize with sample data
export const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Design Dashboard UI',
    description: 'Create wireframes and mockups for the main dashboard screen',
    status: 'todo',
    priority: 'high',
    createdAt: formatISO(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    deadline: formatISO(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
    assigneeId: '1',
    tags: ['1', '3'],
    history: [
      {
        timestamp: formatISO(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        status: 'todo'
      }
    ]
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Set up user authentication with JWT and secure routes',
    status: 'in-progress',
    priority: 'high',
    createdAt: formatISO(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    deadline: formatISO(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
    assigneeId: '2',
    tags: ['2'],
    history: [
      {
        timestamp: formatISO(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        status: 'todo'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        status: 'in-progress'
      }
    ]
  },
  {
    id: '3',
    title: 'API Integration',
    description: 'Connect frontend to backend APIs for data retrieval and updates',
    status: 'in-progress',
    priority: 'medium',
    createdAt: formatISO(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    deadline: formatISO(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
    assigneeId: '1',
    tags: ['2', '4'],
    history: [
      {
        timestamp: formatISO(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
        status: 'todo'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        status: 'in-progress'
      }
    ]
  },
  {
    id: '4',
    title: 'Write Documentation',
    description: 'Create comprehensive API documentation for developers',
    status: 'review',
    priority: 'low',
    createdAt: formatISO(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
    deadline: formatISO(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
    assigneeId: '3',
    tags: ['5'],
    history: [
      {
        timestamp: formatISO(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
        status: 'todo'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)),
        status: 'in-progress'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        status: 'review'
      }
    ]
  },
  {
    id: '5',
    title: 'Code Review',
    description: 'Perform code review for the authentication module',
    status: 'done',
    priority: 'medium',
    createdAt: formatISO(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    assigneeId: '2',
    tags: ['2', '5'],
    history: [
      {
        timestamp: formatISO(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
        status: 'todo'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        status: 'in-progress'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        status: 'review'
      },
      {
        timestamp: formatISO(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        status: 'done'
      }
    ]
  },
];

export const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Alex'
  },
  {
    id: '2',
    name: 'Jordan Lee',
    avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Jordan'
  },
  {
    id: '3',
    name: 'Taylor Smith',
    avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Taylor'
  },
];

export const defaultTags: Tag[] = [
  { id: '1', name: 'UI', color: '#93C5FD' },   // blue-300
  { id: '2', name: 'Backend', color: '#A7F3D0' },  // green-200
  { id: '3', name: 'Design', color: '#FDE68A' },  // amber-200
  { id: '4', name: 'API', color: '#DDD6FE' },   // violet-200
  { id: '5', name: 'Documentation', color: '#FBCFE8' },  // pink-200
];

export const defaultBoardConfig: BoardConfig = {
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ]
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      tags: [],
      users: [],
      activities: [],
      boardConfig: defaultBoardConfig,
      searchTerm: '',
      filters: {
        assignee: null,
        priority: null,
        dateRange: null,
        tags: null
      },
      
      initializeTasks: () => {
        // Only initialize if store is empty
        if (get().tasks.length === 0) {
          set({
            tasks: defaultTasks,
            tags: defaultTags,
            users: defaultUsers,
          });
        }
      },
      
      addTask: (taskData) => {
        const id = crypto.randomUUID();
        const now = formatISO(new Date());
        
        const newTask: Task = {
          id,
          ...taskData,
          createdAt: now,
          history: [{ timestamp: now, status: taskData.status }],
          tags: taskData.tags || []
        };
        
        set((state) => {
          // Add new task
          const updatedTasks = [...state.tasks, newTask];
          
          // Generate activity
          const activity: TaskActivity = {
            id: crypto.randomUUID(),
            taskId: id,
            type: 'create',
            timestamp: now,
            message: `Task "${newTask.title}" was created`,
            userId: taskData.assigneeId
          };
          
          return {
            tasks: updatedTasks,
            activities: [...state.activities, activity]
          };
        });
        
        return id;
      },
      
      updateTask: (id, updates) => {
        const now = formatISO(new Date());
        
        set((state) => {
          const taskIndex = state.tasks.findIndex(task => task.id === id);
          if (taskIndex === -1) return state;
          
          const currentTask = state.tasks[taskIndex];
          const updatedTask = { ...currentTask, ...updates };
          
          // Create new history entry if status changed
          let history = [...currentTask.history];
          if (updates.status && updates.status !== currentTask.status) {
            history = [...history, { timestamp: now, status: updates.status }];
          }
          
          const updatedTasks = [...state.tasks];
          updatedTasks[taskIndex] = { ...updatedTask, history };
          
          // Generate activity
          const activityEntries: TaskActivity[] = [];
          
          if (updates.status && updates.status !== currentTask.status) {
            activityEntries.push({
              id: crypto.randomUUID(),
              taskId: id,
              type: 'status-change',
              timestamp: now,
              message: `Task "${currentTask.title}" moved from ${currentTask.status} to ${updates.status}`,
              oldValue: currentTask.status,
              newValue: updates.status,
              userId: currentTask.assigneeId
            });
          } else {
            activityEntries.push({
              id: crypto.randomUUID(),
              taskId: id,
              type: 'update',
              timestamp: now,
              message: `Task "${currentTask.title}" was updated`,
              userId: currentTask.assigneeId
            });
          }
          
          return {
            tasks: updatedTasks,
            activities: [...state.activities, ...activityEntries]
          };
        });
      },
      
      deleteTask: (id) => {
        const now = formatISO(new Date());
        
        set((state) => {
          const taskToDelete = state.tasks.find(task => task.id === id);
          if (!taskToDelete) return state;
          
          // Generate activity
          const activity: TaskActivity = {
            id: crypto.randomUUID(),
            taskId: id,
            type: 'delete',
            timestamp: now,
            message: `Task "${taskToDelete.title}" was deleted`,
            userId: taskToDelete.assigneeId
          };
          
          return {
            tasks: state.tasks.filter(task => task.id !== id),
            activities: [...state.activities, activity]
          };
        });
      },
      
      moveTask: (taskId, destination) => {
        get().updateTask(taskId, { status: destination });
      },
      
      addTag: (tagData) => {
        const id = crypto.randomUUID();
        const newTag = { id, ...tagData };
        
        set((state) => ({
          tags: [...state.tags, newTag]
        }));
        
        return id;
      },
      
      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter(tag => tag.id !== id),
          // Also remove this tag from all tasks
          tasks: state.tasks.map(task => ({
            ...task,
            tags: task.tags.filter(tagId => tagId !== id)
          }))
        }));
      },
      
      addUser: (userData) => {
        const id = crypto.randomUUID();
        const newUser = { id, ...userData };
        
        set((state) => ({
          users: [...state.users, newUser]
        }));
        
        return id;
      },
      
      setSearchTerm: (term) => {
        set({ searchTerm: term });
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },
      
      clearFilters: () => {
        set({
          filters: {
            assignee: null,
            priority: null,
            dateRange: null,
            tags: null
          }
        });
      },
      
      updateBoardConfig: (config) => {
        set((state) => ({
          boardConfig: { ...state.boardConfig, ...config }
        }));
      }
    }),
    {
      name: 'kanban-task-storage'
    }
  )
);
