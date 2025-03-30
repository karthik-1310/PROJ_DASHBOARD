
import { useState } from 'react';
import { useTaskStore, Tag, BoardConfig } from '@/store/taskStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, MouseSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Trash2, AlertCircle, Grip } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';

// SortableItem component for DnD
const SortableItem = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const Settings = () => {
  const { tags, addTag, deleteTag, boardConfig, updateBoardConfig } = useTaskStore();
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#93C5FD');
  const [columns, setColumns] = useState<BoardConfig['columns']>(boardConfig.columns);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    darkMode: document.documentElement.classList.contains('dark'),
    compactView: localStorage.getItem('compactView') === 'true',
  });
  
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Handle adding new tag
  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    addTag({
      name: newTagName,
      color: newTagColor
    });
    
    toast({
      title: "Tag created",
      description: `New tag "${newTagName}" has been added.`,
    });
    
    setNewTagName('');
    setNewTagColor('#93C5FD');
    setIsAddTagDialogOpen(false);
  };
  
  // Handle deleting a tag
  const handleDeleteTag = (tagId: string) => {
    deleteTag(tagId);
    toast({
      title: "Tag deleted",
      description: "The tag has been deleted successfully.",
      variant: "destructive",
    });
  };
  
  // Handle adding a new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    // Generate a unique ID for the new column
    let id = newColumnTitle.toLowerCase().replace(/\s+/g, '-');
    let counter = 1;
    
    // Make sure ID is unique
    while (columns.some(col => col.id === id)) {
      id = `${newColumnTitle.toLowerCase().replace(/\s+/g, '-')}-${counter}`;
      counter++;
    }
    
    const updatedColumns = [...columns, { id, title: newColumnTitle }];
    setColumns(updatedColumns);
    updateBoardConfig({ columns: updatedColumns });
    
    toast({
      title: "Column added",
      description: `New column "${newColumnTitle}" has been added.`,
    });
    
    setNewColumnTitle('');
    setIsAddColumnDialogOpen(false);
  };
  
  // Handle deleting a column
  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) {
      toast({
        title: "Cannot delete column",
        description: "You must have at least one column in the board.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedColumns = columns.filter(col => col.id !== columnId);
    setColumns(updatedColumns);
    updateBoardConfig({ columns: updatedColumns });
    
    toast({
      title: "Column deleted",
      description: "The column has been deleted.",
      variant: "destructive",
    });
  };
  
  // Handle column drag end
  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update the board configuration
        updateBoardConfig({ columns: reordered });
        
        return reordered;
      });
      
      toast({
        title: "Columns reordered",
        description: "The column order has been updated.",
      });
    }
  };
  
  // Toggle dark mode
  const handleToggleDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    setLocalSettings(prev => ({ ...prev, darkMode: enabled }));
  };
  
  // Toggle compact view
  const handleToggleCompactView = (enabled: boolean) => {
    localStorage.setItem('compactView', enabled.toString());
    setLocalSettings(prev => ({ ...prev, compactView: enabled }));
    
    // In a real app, this would update task card styling via state
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board Settings</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        {/* Board Settings Tab */}
        <TabsContent value="board">
          <Card>
            <CardHeader>
              <CardTitle>Board Columns</CardTitle>
              <CardDescription>
                Customize the columns on your Kanban board. Drag to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleColumnDragEnd}
                >
                  <SortableContext 
                    items={columns.map(col => col.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {columns.map((column) => (
                        <SortableItem key={column.id} id={column.id}>
                          <div className="flex items-center space-x-2 border rounded-md p-2">
                            <Grip className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1">
                              <div className="font-medium">{column.title}</div>
                              <div className="text-xs text-muted-foreground">{column.id}</div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Column</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the "{column.title}" column? 
                                    This will also move any tasks in this column to the first available column.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteColumn(column.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                <Button onClick={() => setIsAddColumnDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Column
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tags Tab */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Manage Tags</CardTitle>
              <CardDescription>
                Create and manage tags to categorize your tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tags.map((tag) => (
                    <div 
                      key={tag.id} 
                      className="border rounded-md p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span>{tag.name}</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{tag.name}" tag? 
                              This will remove the tag from all tasks.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTag(tag.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
                
                <Button onClick={() => setIsAddTagDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of your Kanban board
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a low-light interface
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={localSettings.darkMode} 
                  onCheckedChange={handleToggleDarkMode} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-view" className="text-base">Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Display tasks in a more compact layout
                  </p>
                </div>
                <Switch 
                  id="compact-view" 
                  checked={localSettings.compactView} 
                  onCheckedChange={handleToggleCompactView} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Data Management Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import or reset your board data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Data</CardTitle>
                    <CardDescription>
                      Download your board data as a JSON file
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" onClick={() => {
                      const data = localStorage.getItem('kanban-task-storage');
                      if (data) {
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'kanban-board-data.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        toast({
                          title: "Data exported",
                          description: "Your board data has been exported successfully.",
                        });
                      }
                    }}>
                      Export
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Data</CardTitle>
                    <CardDescription>
                      Import board data from a JSON file
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'application/json';
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const data = event.target?.result as string;
                              // Validate JSON structure before importing
                              JSON.parse(data);
                              localStorage.setItem('kanban-task-storage', data);
                              
                              toast({
                                title: "Data imported",
                                description: "Board data imported successfully. The page will reload.",
                              });
                              
                              // Reload the page after a short delay
                              setTimeout(() => {
                                window.location.reload();
                              }, 1500);
                            } catch (error) {
                              toast({
                                title: "Import failed",
                                description: "The file contains invalid JSON data.",
                                variant: "destructive",
                              });
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}>
                      Import
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Danger Zone</AlertTitle>
                <AlertDescription>
                  The following actions are destructive and cannot be undone.
                </AlertDescription>
              </Alert>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Reset All Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your tasks, columns, and settings.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        localStorage.removeItem('kanban-task-storage');
                        
                        toast({
                          title: "Data reset",
                          description: "All data has been reset. The page will reload.",
                          variant: "destructive",
                        });
                        
                        // Reload the page after a short delay
                        setTimeout(() => {
                          window.location.reload();
                        }, 1500);
                      }}
                    >
                      Reset All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Tag Dialog */}
      <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-color">Tag Color</Label>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  id="tag-color"
                  className="w-12 h-8 p-1"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                />
                <Input
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Column Dialog */}
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
              <p className="text-xs text-muted-foreground">
                An ID will be generated automatically based on the title.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
