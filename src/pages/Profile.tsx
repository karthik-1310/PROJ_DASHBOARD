
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { useTaskStore } from '@/store/taskStore';
import { format, isToday, isSameDay, isSameMonth, addDays } from 'date-fns';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  User, 
  Calendar as CalendarIcon, 
  Settings, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Filter, 
  Heart,
  MessageSquare,
  Video,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { tasks, users, tags } = useTaskStore();
  
  // Get user's tasks
  const currentUser = users.find(user => user.id === '1'); // Using Alex as the current user
  const userProjects = tasks.filter(task => task.assigneeId === '1')
    .slice(0, 3) // Only take the first 3 for display
    .map(task => ({
      id: task.id,
      title: task.title,
      date: new Date(task.createdAt),
      progress: Math.floor(Math.random() * 60) + 20, // Random progress between 20-80%
      type: tags.find(tag => task.tags.includes(tag.id))?.name || 'Task',
      daysLeft: task.deadline ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 3,
      team: task.tags.map(tagId => {
        const assignedUser = users.find(user => user.id === task.assigneeId);
        return {
          id: assignedUser?.id || '',
          name: assignedUser?.name || '',
          avatar: assignedUser?.avatar || ''
        };
      })
    }));
  
  // Sample messages (would connect to a real messaging system in a full implementation)
  const messages = [
    {
      id: '1',
      sender: {
        name: userProjects[0]?.title || 'Web Designing',
        avatar: '/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png'
      },
      content: 'Hey tell me about progress of project? Waiting for your response',
      isNew: true
    },
    {
      id: '2',
      sender: {
        name: 'Stephanie',
        avatar: '/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png'
      },
      content: 'I got your first assignment. It was quite good'
    },
    {
      id: '3',
      sender: {
        name: 'William',
        avatar: '/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png'
      },
      content: 'I want some changes in previous work you sent me. Waiting for your reply.'
    }
  ];
  
  // Generate calendar events based on task deadlines
  const taskEvents = tasks
    .filter(task => task.deadline)
    .map(task => new Date(task.deadline));
  
  // Handle date selection in calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Check if there are tasks due on this date
    const tasksOnSelectedDate = tasks.filter(task => 
      task.deadline && isSameDay(new Date(task.deadline), date)
    );
    
    if (tasksOnSelectedDate.length > 0) {
      toast({
        title: `Tasks due on ${format(date, 'MMMM dd, yyyy')}`,
        description: tasksOnSelectedDate.map(task => task.title).join(', '),
      });
    }
  };
  
  // Handle contact button click
  const handleContact = (type: string) => {
    toast({
      title: `${type} contact initiated`,
      description: `You're contacting Robert Smith via ${type.toLowerCase()}`,
    });
  };
  
  // Function to determine calendar day styling
  const getDayClass = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (isToday(date)) return 'bg-red-400 text-white hover:bg-red-500';
    if (isSameDay(date, selectedDate)) return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
    
    // Check if this day has a task deadline
    const hasTask = taskEvents.some(taskDate => isSameDay(taskDate, date));
    if (hasTask) return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300';
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend) return 'text-gray-400';
    
    return '';
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-1.5">
            {tasks.filter(task => task.status === 'in-progress').length} Tasks In Progress
          </Badge>
          <Badge variant="outline" className="px-4 py-1.5">
            {format(new Date(), 'MMMM, yyyy')}
          </Badge>
          <Button variant="outline" size="icon" className="rounded-full">
            <CalendarIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Information */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={currentUser?.avatar || "/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png"} />
                  <AvatarFallback>{currentUser?.name.charAt(0) || "R"}S</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{currentUser?.name || "Robert Smith"}</h2>
                <p className="text-gray-500">Product Designer</p>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full bg-black text-white border-none hover:bg-gray-800"
                    onClick={() => handleContact('Email')}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => handleContact('Phone')}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => handleContact('Message')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => handleContact('Video')}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Time Slots</p>
                    <div className="flex items-center gap-2">
                      <span>{format(currentDate, 'MMMM, yyyy')}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                        <CalendarIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm">Meetings</p>
                    <Badge className="bg-black text-white">{tasks.filter(task => task.status === 'review').length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold">Detailed Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">{currentUser?.name || "Robert Smith"}</p>
                </div>
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100">Online</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="font-medium">{currentUser?.name.toLowerCase().replace(' ', '')}64@gmail.com</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleContact('Email')}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Contact Number</p>
                  <p className="font-medium">(555) 555-5674</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleContact('Phone')}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Designation</p>
                  <p className="font-medium">Product Designer</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Availability</p>
                  <p className="font-medium">Schedule the time slot</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Projects */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between border-b">
                <Button variant="default" className="rounded-full bg-black text-white hover:bg-gray-800">
                  Ongoing Projects
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link to="/kanban">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                {userProjects.map((project, index) => (
                  <div key={project.id} className={`rounded-lg p-4 ${
                    index === 0 ? 'bg-amber-50' : 
                    index === 1 ? 'bg-blue-50' : 
                    'bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-white">
                        {format(project.date, 'MMMM dd, yyyy')}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          toast({
                            title: project.title,
                            description: `Project type: ${project.type}, Progress: ${project.progress}%`,
                          });
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h4 className="font-medium mb-2">{project.title}</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{project.type}</span>
                        <Badge variant="outline" className="bg-white">
                          {project.progress}% Progress
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={project.progress}
                        className="h-2 bg-white" 
                      />
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center -space-x-2">
                          {project.team.map((member, idx) => (
                            <Avatar key={`${member.id}-${idx}`} className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 rounded-full bg-white ml-1"
                            onClick={() => {
                              toast({
                                title: "Team management",
                                description: "Team management feature will be available soon",
                              });
                            }}
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge className={`
                          ${index === 0 ? 'bg-amber-100 text-amber-800' : 
                          index === 1 ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}
                        `}>
                          {project.daysLeft} Days Left
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Calendar and Inbox */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader className="flex items-center justify-between space-y-0">
              <h3 className="text-lg font-bold">Calendar</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <CalendarIcon className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    const prevMonth = new Date(currentDate);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setCurrentDate(prevMonth);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-bold">{format(currentDate, 'MMMM')}</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    const nextMonth = new Date(currentDate);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentDate(nextMonth);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={`header-${i}`} className="text-center text-xs text-gray-500 font-medium p-1">
                    {day}
                  </div>
                ))}
                
                {/* Empty days at start of month */}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }, (_, i) => (
                  <div key={`empty-start-${i}`} className="h-10 w-10"></div>
                ))}
                
                {/* Days of the month */}
                {Array.from(
                  { length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, 
                  (_, i) => i + 1
                ).map((day) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  
                  return (
                    <Button
                      key={`day-${day}`}
                      variant="ghost"
                      className={`h-10 w-10 rounded-md p-0 ${getDayClass(day)}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Inbox */}
          <Card>
            <CardHeader className="flex items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Inbox</h3>
                <Badge className="bg-gray-200 text-gray-800">{messages.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    toast({
                      title: `Message from ${message.sender.name}`,
                      description: message.content,
                    });
                  }}
                >
                  {message.isNew && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-red-500"></div>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={message.sender.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${message.sender.name}`} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{message.sender.name}</h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <User className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{message.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
