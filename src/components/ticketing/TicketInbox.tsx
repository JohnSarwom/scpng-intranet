import React, { useState } from 'react';
import { 
  Search, 
  Mail, 
  Eye, 
  X, 
  Paperclip,
  Mic,
  Link,
  Image,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Sample ticket data
const sampleTickets = [
  {
    id: '1100669518',
    title: 'Laudantium neque veritatis',
    code: 'OPS - 102',
    status: 'To Do',
    date: 'Jun 2',
    selected: true
  },
  {
    id: '1100669519',
    title: 'Soluta quam velit',
    code: 'APPS - 216',
    status: 'To Do',
    date: 'Jun 2',
    selected: false
  },
  {
    id: '1100669520',
    title: 'Molestiae saepe illum',
    code: 'APPS - 216',
    status: 'To Do',
    date: 'Jun 1',
    selected: false
  },
  {
    id: '1100669521',
    title: 'Dignissimos maiores porro',
    code: 'APPS - 216',
    status: 'To Do',
    date: 'May 31',
    selected: false
  }
];

// Sample conversations
const sampleConversations = [
  {
    id: 1,
    sender: {
      name: 'Allie Harmon',
      avatar: 'AH'
    },
    recipient: 'Danny Amacher <danny@capacity.com>',
    content: 'Ex beatae aliquid mollitia. Enim doloremque molestiae voluptatem recusandae. Maxime beatae nostrum ut. Deserunt totam aut nihil quo beatae. Quas non delectus praesentium est illum vitae nemo iure.',
    date: 'Feb 9, 2022 10:31 AM',
    attachments: [
      { name: 'Screen_shot.png', date: '16 Jun 2022, 1:30 PM' },
      { name: 'Screen_shot2.png', date: '16 Jun 2022, 1:30 PM' }
    ]
  },
  {
    id: 2,
    sender: {
      name: 'Allie Harmon',
      avatar: 'AH'
    },
    recipient: 'Danny Amacher <danny@capacity.com>',
    content: 'Dolorem similique et aliquid illum dolor. Vel quo magnam.',
    date: 'Feb 9, 2022 10:31 AM',
    attachments: []
  }
];

interface TicketAttachmentProps {
  name: string;
  date: string;
}

const TicketAttachment: React.FC<TicketAttachmentProps> = ({ name, date }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2 flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
      <Image className="w-4 h-4 text-gray-400" />
      <span>{name}</span>
      <span className="text-xs text-gray-400">{date}</span>
    </div>
  );
};

interface ConversationMessageProps {
  sender: {
    name: string;
    avatar: string;
  };
  recipient: string;
  content: string;
  date: string;
  attachments: { name: string; date: string }[];
}

const ConversationMessage: React.FC<ConversationMessageProps> = ({ 
  sender, 
  recipient, 
  content, 
  date, 
  attachments 
}) => {
  return (
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{sender.avatar}</AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-1">
          <div className="font-medium text-sm">{sender.name}</div>
          <div className="text-xs text-gray-500">{date}</div>
        </div>
        <div className="text-xs text-gray-500 mb-3">To {recipient}</div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {content}
        </p>
        {attachments.length > 0 && (
          <div className="flex space-x-2 flex-wrap">
            {attachments.map((attachment, idx) => (
              <TicketAttachment 
                key={idx} 
                name={attachment.name} 
                date={attachment.date} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TicketInbox: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState(sampleTickets[0]);
  
  return (
    <div className="flex w-full h-[calc(100vh-220px)] min-h-[700px]">
      {/* Ticket List Sidebar */}
      <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg font-semibold">My Tickets</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <Input type="text" placeholder="Search tickets" className="w-full" />
        </div>

        <nav className="flex-1 px-2 space-y-1 pb-4 overflow-y-auto">
          {sampleTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "w-full text-left rounded-md",
                ticket.selected ? 
                  "bg-blue-50 border-l-4 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-400" : 
                  "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              )}
            >
              <div className="flex items-center px-2 py-3 text-sm font-medium">
                <div className="flex-1">
                  <p className={cn(ticket.selected && "font-semibold")}>{ticket.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.code} 
                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 px-1.5 py-0.5 text-xs">
                      {ticket.status}
                    </Badge>
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.date}</span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Ticket View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Ticket Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold">{selectedTicket.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTicket.code} (ID: {selectedTicket.id}) | Created 11/14/22 12:32 PST
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">2</span>
            <Button variant="ghost" size="icon">
              <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
            
            <div className="flex -space-x-2">
              <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
            </div>
            
            <Button variant="default">{selectedTicket.status}</Button>
            
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </header>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {/* Reply Box */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <Tabs defaultValue="public-reply">
                <TabsList className="bg-transparent border-0">
                  <TabsTrigger 
                    value="public-reply"
                    className="border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Public Reply
                  </TabsTrigger>
                  <TabsTrigger 
                    value="private-comment"
                    className="border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Private Comment
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">To:</span>
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 pl-2 pr-0.5 py-0.5 flex items-center space-x-1">
                  <span>Allison Westervelt &lt;awestervelt@email.com&gt;</span>
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
                <button className="text-sm text-blue-600 hover:underline cursor-pointer">Cc</button>
              </div>

              <Textarea
                rows={3}
                placeholder="Add a reply..."
                className="w-full p-2 focus:ring-2 focus:ring-blue-500"
              />

              <div className="mt-2 flex justify-between items-center">
                <div className="flex space-x-2 text-gray-500">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" className="text-sm">
                    Add to KB
                  </Button>
                  <Button variant="default" className="text-sm">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="space-y-6">
            {sampleConversations.map((message) => (
              <ConversationMessage
                key={message.id}
                sender={message.sender}
                recipient={message.recipient}
                content={message.content}
                date={message.date}
                attachments={message.attachments}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Details Sidebar */}
      <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto p-5 flex-shrink-0 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
          <Select defaultValue="medium">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned To</label>
          <div className="flex items-center justify-between">
            <Select defaultValue="allie">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allie">Allie Harmon</SelectItem>
                <SelectItem value="danny">Danny Amacher</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="link" size="sm" className="ml-2 text-xs">
              Assign to me
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project</label>
          <Select defaultValue="admin">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrative</SelectItem>
              <SelectItem value="dev">Development</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ticket Type</label>
          <Select defaultValue="task">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ticket Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</label>
          <Input type="text" placeholder="mm/dd/yyyy" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reporter</label>
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            <Avatar className="h-5 w-5">
              <AvatarFallback>AH</AvatarFallback>
            </Avatar>
            <span className="text-sm">Allie Harmon</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</label>
          <Button variant="outline" className="w-full border-dashed">
            Add Tag +
          </Button>
        </div>

        <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Button variant="ghost" className="justify-between w-full text-left py-2">
            <span>TASKS</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
          <Button variant="ghost" className="justify-between w-full text-left py-2">
            <span>COLLECTED FIELDS</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
          <Button variant="ghost" className="justify-between w-full text-left py-2">
            <span className="flex items-center">
              LINKED TICKETS 
              <Badge variant="outline" className="ml-1">2</Badge>
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
          <Button variant="ghost" className="justify-between w-full text-left py-2">
            <span>HISTORY</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default TicketInbox; 