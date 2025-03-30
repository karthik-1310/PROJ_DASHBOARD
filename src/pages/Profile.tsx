
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
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
import { format } from 'date-fns';

// Sample data structure for projects
interface Project {
  id: string;
  title: string;
  date: Date;
  progress: number;
  type: string;
  daysLeft: number;
  team: {
    id: string;
    name: string;
    avatar: string;
  }[];
}

// Sample data structure for messages
interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  isNew?: boolean;
}

const Profile = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Sample projects data
  const projects: Project[] = [
    {
      id: '1',
      title: 'Web Designing',
      date: new Date(2024, 2, 5), // March 5, 2024
      progress: 60,
      type: 'Prototyping',
      daysLeft: 2,
      team: [
        { id: '1', name: 'Alex', avatar: '/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png' },
        { id: '2', name: 'Jamie', avatar: '' },
        { id: '3', name: 'Taylor', avatar: '' }
      ]
    },
    {
      id: '2',
      title: 'Mobile App',
      date: new Date(2024, 2, 8), // March 8, 2024
      progress: 45,
      type: 'Design',
      daysLeft: 5,
      team: [
        { id: '1', name: 'Alex', avatar: '/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png' },
        { id: '4', name: 'Morgan', avatar: '' },
        { id: '5', name: 'Jordan', avatar: '' }
      ]
    },
    {
      id: '3',
      title: 'Dashboard',
      date: new Date(2024, 2, 12), // March 12, 2024
      progress: 25,
      type: 'Wireframe',
      daysLeft: 8,
      team: [
        { id: '1', name: 'Alex', avatar: '/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png' },
        { id: '6', name: 'Casey', avatar: '' },
        { id: '7', name: 'Riley', avatar: '' }
      ]
    }
  ];

  // Sample messages
  const messages: Message[] = [
    {
      id: '1',
      sender: {
        name: 'Web Designing',
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

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-1.5">
            Pending
          </Badge>
          <Badge variant="outline" className="px-4 py-1.5">
            March, 2024
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
                  <AvatarImage src="/lovable-uploads/87d10a65-1b42-4482-9055-b36ab30400c4.png" />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">Robert Smith</h2>
                <p className="text-gray-500">Product Designer</p>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="icon" className="rounded-full bg-black text-white border-none hover:bg-gray-800">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Time Slots</p>
                    <div className="flex items-center gap-2">
                      <span>April, 2024</span>
                      <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                        <CalendarIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm">Meetings</p>
                    <Badge className="bg-black text-white">3</Badge>
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
                  <p className="font-medium">Robert Smith</p>
                </div>
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100">Online</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-black"></div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="font-medium">robertsmith64@gmail.com</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                {projects.map(project => (
                  <div key={project.id} className={`rounded-lg p-4 ${
                    project.id === '1' ? 'bg-amber-50' : 
                    project.id === '2' ? 'bg-blue-50' : 
                    'bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-white">
                        {format(project.date, 'MMMM dd, yyyy')}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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
                        indicatorClassName={
                          project.id === '1' ? 'bg-amber-500' : 
                          project.id === '2' ? 'bg-blue-500' : 
                          'bg-red-500'
                        }
                      />
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center -space-x-2">
                          {project.team.map((member, index) => (
                            <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-white ml-1">
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge className={`
                          ${project.id === '1' ? 'bg-amber-100 text-amber-800' : 
                          project.id === '2' ? 'bg-blue-100 text-blue-800' : 
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
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-bold">March</h3>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isToday = day === 5;
                  const isSelected = day === 12;
                  const isWeekend = day % 7 === 0 || day % 7 === 6;
                  const isHighlighted = [23, 24, 25].includes(day);
                  
                  return (
                    <Button
                      key={day}
                      variant="ghost"
                      className={`h-10 w-10 rounded-md p-0 ${
                        isToday ? 'bg-red-400 text-white hover:bg-red-500' : 
                        isSelected ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' :
                        isHighlighted ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' :
                        isWeekend ? 'text-gray-400' : ''
                      }`}
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
                <Badge className="bg-gray-200 text-gray-800">3</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
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
