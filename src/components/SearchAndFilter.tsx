
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { useTaskStore, User, Tag, Priority } from '@/store/taskStore';
import { format } from 'date-fns';

interface SearchAndFilterProps {
  users: User[];
  tags: Tag[];
}

const SearchAndFilter = ({ users, tags }: SearchAndFilterProps) => {
  const { setSearchTerm, setFilters, clearFilters, filters } = useTaskStore();
  const [searchInput, setSearchInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    assignee: false,
    priority: false,
    dateRange: false,
    tags: false
  });
  
  // Filter selections
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(filters.assignee || null);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(filters.priority || []);
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | undefined>(
    filters.dateRange?.from ? new Date(filters.dateRange.from) : undefined
  );
  const [selectedDateTo, setSelectedDateTo] = useState<Date | undefined>(
    filters.dateRange?.to ? new Date(filters.dateRange.to) : undefined
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  
  const handleSearch = () => {
    setSearchTerm(searchInput);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };
  
  const handleApplyFilters = () => {
    setFilters({
      assignee: activeFilters.assignee ? selectedAssignee : null,
      priority: activeFilters.priority ? selectedPriorities : null,
      dateRange: activeFilters.dateRange ? {
        from: selectedDateFrom ? format(selectedDateFrom, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") : null,
        to: selectedDateTo ? format(selectedDateTo, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") : null
      } : null,
      tags: activeFilters.tags ? selectedTags : null
    });
  };
  
  const handleClearFilters = () => {
    setSelectedAssignee(null);
    setSelectedPriorities([]);
    setSelectedDateFrom(undefined);
    setSelectedDateTo(undefined);
    setSelectedTags([]);
    setActiveFilters({
      assignee: false,
      priority: false,
      dateRange: false,
      tags: false
    });
    clearFilters();
  };
  
  const handlePriorityChange = (priority: Priority) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
    } else {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };
  
  const handleTagChange = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // Count active filters
  const activeFilterCount = 
    (activeFilters.assignee && selectedAssignee ? 1 : 0) +
    (activeFilters.priority && selectedPriorities.length ? 1 : 0) +
    (activeFilters.dateRange && (selectedDateFrom || selectedDateTo) ? 1 : 0) +
    (activeFilters.tags && selectedTags.length ? 1 : 0);
  
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between">
      <div className="flex flex-1 max-w-md relative">
        <Input
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="pr-8"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {searchInput ? (
            <X 
              className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
              onClick={handleClearSearch}
            />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          onClick={handleSearch} 
          className="flex-shrink-0"
        >
          Search
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="font-medium">Filter Tasks</div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="assignee-filter" className="text-sm">Assignee</Label>
                  <Checkbox 
                    id="assignee-active"
                    checked={activeFilters.assignee}
                    onCheckedChange={(checked) => {
                      setActiveFilters({...activeFilters, assignee: !!checked});
                      if (!checked) setSelectedAssignee(null);
                    }}
                  />
                </div>
                <Select 
                  disabled={!activeFilters.assignee}
                  value={selectedAssignee || ''}
                  onValueChange={setSelectedAssignee}
                >
                  <SelectTrigger id="assignee-filter">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Priority</Label>
                  <Checkbox 
                    checked={activeFilters.priority}
                    onCheckedChange={(checked) => {
                      setActiveFilters({...activeFilters, priority: !!checked});
                      if (!checked) setSelectedPriorities([]);
                    }}
                  />
                </div>
                <div className="space-y-1" aria-disabled={!activeFilters.priority}>
                  {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`priority-${priority}`} 
                        disabled={!activeFilters.priority}
                        checked={selectedPriorities.includes(priority)}
                        onCheckedChange={() => handlePriorityChange(priority)}
                      />
                      <label 
                        htmlFor={`priority-${priority}`}
                        className={`text-sm capitalize ${!activeFilters.priority ? 'opacity-50' : ''}`}
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Deadline Range</Label>
                  <Checkbox 
                    checked={activeFilters.dateRange}
                    onCheckedChange={(checked) => {
                      setActiveFilters({...activeFilters, dateRange: !!checked});
                      if (!checked) {
                        setSelectedDateFrom(undefined);
                        setSelectedDateTo(undefined);
                      }
                    }}
                  />
                </div>
                <div className={`space-y-2 ${!activeFilters.dateRange ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="grid gap-2">
                    <Label htmlFor="date-from" className="text-xs">From</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDateFrom}
                      onSelect={setSelectedDateFrom}
                      disabled={!activeFilters.dateRange}
                      className="border rounded-md"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date-to" className="text-xs">To</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDateTo}
                      onSelect={setSelectedDateTo}
                      disabled={!activeFilters.dateRange || !selectedDateFrom}
                      fromDate={selectedDateFrom}
                      className="border rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Tags</Label>
                  <Checkbox 
                    checked={activeFilters.tags}
                    onCheckedChange={(checked) => {
                      setActiveFilters({...activeFilters, tags: !!checked});
                      if (!checked) setSelectedTags([]);
                    }}
                  />
                </div>
                <div className={`flex flex-wrap gap-2 ${!activeFilters.tags ? 'opacity-50 pointer-events-none' : ''}`}>
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={{
                        background: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                        borderColor: tag.color,
                        color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                        opacity: !activeFilters.tags ? 0.5 : 1
                      }}
                      onClick={() => activeFilters.tags && handleTagChange(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear All
                </Button>
                <Button size="sm" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default SearchAndFilter;
