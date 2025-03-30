import { useState } from 'react';
import { useTaskStore, User } from '@/store/taskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Search, Users, BarChart, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = {
  'todo': '#e11d48',
  'in-progress': '#fb923c', 
  'review': '#3b82f6',
  'done': '#10b981'
};

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done'
};

const Team = () => {
  const { users, tasks, addUser } = useTaskStore();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'workload'>('name');
  
  // Filter users by search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      // Sort by workload (task count)
      const aTaskCount = tasks.filter(task => task.assigneeId === a.id).length;
      const bTaskCount = tasks.filter(task => task.assigneeId === b.id).length;
      return bTaskCount - aTaskCount;
    }
  });
  
  // Calculate task distribution for each user
  const getUserTaskDistribution = (userId: string) => {
    const userTasks = tasks.filter(task => task.assigneeId === userId);
    const distribution = userTasks.reduce<Record<string, number>>(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      { 'todo': 0, 'in-progress': 0, 'review': 0, 'done': 0 }
    );
    
    return Object.entries(distribution).map(([status, count]) => ({
      name: statusLabels[status as keyof typeof statusLabels] || status,
      value: count,
      status
    }));
  };
  
  // Calculate completion rate for each user
  const getUserCompletionRate = (userId: string) => {
    const userTasks = tasks.filter(task => task.assigneeId === userId);
    if (userTasks.length === 0) return 0;
    
    const completedTasks = userTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / userTasks.length) * 100);
  };
  
  // Handle adding new user
  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    
    addUser({
      name: newUserName,
      avatar: `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(newUserName)}`
    });
    
    setNewUserName('');
    setIsAddUserDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> Team Members
          </h1>
          <p className="text-muted-foreground">Manage and view team workload</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-[200px] rounded-full"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'workload')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by name</SelectItem>
              <SelectItem value="workload">Sort by workload</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsAddUserDialogOpen(true)} variant="default" className="rounded-full">
            <UserPlus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </div>
      </div>
      
      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedUsers.map((user) => {
          const userTasks = tasks.filter(task => task.assigneeId === user.id);
          const completionRate = getUserCompletionRate(user.id);
          const isSelected = selectedUser === user.id;
          
          return (
            <Card 
              key={user.id} 
              className={`hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-xl ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedUser(isSelected ? null : user.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>
                        {userTasks.length} {userTasks.length === 1 ? 'task' : 'tasks'} assigned
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="rounded-full">
                    <Link to={`/kanban?assignee=${user.id}`}>View Tasks</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Completion Rate</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                    {/* Fix: Update Progress component to use updated interface */}
                    <Progress 
                      value={completionRate} 
                      className="h-2" 
                      indicatorClassName={
                        completionRate > 66 ? "bg-green-500" : 
                        completionRate > 33 ? "bg-amber-500" : 
                        "bg-red-500"
                      } 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between p-1.5 rounded bg-red-500/10">
                        <span className="text-muted-foreground">To Do</span>
                        <span className="font-medium">{userTasks.filter(t => t.status === 'todo').length}</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-amber-500/10">
                        <span className="text-muted-foreground">In Progress</span>
                        <span className="font-medium">{userTasks.filter(t => t.status === 'in-progress').length}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between p-1.5 rounded bg-blue-500/10">
                        <span className="text-muted-foreground">Review</span>
                        <span className="font-medium">{userTasks.filter(t => t.status === 'review').length}</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-green-500/10">
                        <span className="text-muted-foreground">Done</span>
                        <span className="font-medium">{userTasks.filter(t => t.status === 'done').length}</span>
                      </div>
                    </div>
                  </div>
                  
                  {userTasks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {userTasks
                        .filter(t => t.status !== 'done')
                        .slice(0, 3)
                        .map(task => (
                          <Badge 
                            key={task.id} 
                            variant="outline" 
                            className="truncate max-w-[120px] text-xs rounded-full"
                          >
                            {task.title}
                          </Badge>
                        ))}
                      {userTasks.filter(t => t.status !== 'done').length > 3 && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          +{userTasks.filter(t => t.status !== 'done').length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Selected user details */}
      {selectedUser && (
        <Card className="mt-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                {users.find(u => u.id === selectedUser)?.name}'s Workload
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="rounded-full">
                Close
              </Button>
            </div>
            <CardDescription>
              Detailed task distribution and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getUserTaskDistribution(selectedUser)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {getUserTaskDistribution(selectedUser).map((entry) => (
                        <Cell 
                          key={entry.status} 
                          fill={STATUS_COLORS[entry.status] || '#ccc'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <BarChart className="h-4 w-4" /> Task Summary
                </h3>
                <ul className="space-y-4">
                  {Object.entries(statusLabels).map(([status, label]) => {
                    const count = tasks.filter(
                      t => t.assigneeId === selectedUser && t.status === status
                    ).length;
                    
                    return (
                      <li key={status} className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-3"
                          style={{ backgroundColor: STATUS_COLORS[status] }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{label}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                          {/* Fix: Update Progress component to use updated interface */}
                          <Progress 
                            value={count} 
                            max={tasks.filter(t => t.assigneeId === selectedUser).length || 1} 
                            className="h-1.5 mt-1"
                            indicatorClassName={`bg-[${STATUS_COLORS[status]}]`}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Add Team Member
            </DialogTitle>
            <DialogDescription>
              Add a new team member to assign tasks to them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={newUserName} 
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter team member name" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="rounded-full">
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center rounded-xl shadow-sm">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-medium mb-2">No team members found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No members match your search criteria." : "Add team members to get started."}
            </p>
            <Button onClick={() => setIsAddUserDialogOpen(true)} className="rounded-full">
              <UserPlus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Team;
