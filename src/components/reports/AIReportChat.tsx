import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpenText, Bot, Send, User, Loader2, Info, X } from "lucide-react";
import { AIChatMessage } from '@/types/reports';
import { aiChatService } from '@/integrations/supabase/aiChatService';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface AIReportChatProps {
  reportId?: string;
  userId: string;
  className?: string;
  initialPrompt?: string;
}

export const AIReportChat: React.FC<AIReportChatProps> = ({
  reportId,
  userId,
  className,
  initialPrompt
}) => {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen && !conversationId) {
      initializeChat();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && conversationId && messages.length === 1) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, conversationId, messages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);

      // Create a new chat context
      const context = await aiChatService.createChatContext(userId, reportId);
      setConversationId(context.conversation_id);

      // Add the initial system message
      const initialMessage = await aiChatService.addChatMessage(context.conversation_id, {
        role: 'system',
        content: 'I\'m your AI assistant for report analysis. Ask me anything about your report data and I\'ll provide insights and analysis based on your questions.',
        timestamp: new Date().toISOString(),
      });

      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize chat. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content = currentMessage) => {
    if (!content.trim() || !conversationId) return;

    try {
      setIsLoading(true);
      setCurrentMessage('');

      // Add the user message to the UI immediately
      const userMessage: AIChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        conversation_id: conversationId
      };

      setMessages(prev => [...prev, userMessage]);

      // Process the query and get AI response
      const response = await aiChatService.processQuery(
        conversationId,
        content,
        { report_id: reportId }
      );

      // Update messages with the response
      setMessages(prev => [
        ...prev.filter(m => m.id !== userMessage.id), // Remove temp message
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
          conversation_id: conversationId
        },
        response
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your query. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const renderMessageContent = (message: AIChatMessage) => {
    // Split the message content by newlines and render each part
    return message.content.split('\n').map((line, index) => (
      <div key={index} className={line.trim() === '' ? 'h-4' : ''}>
        {line}
      </div>
    ));
  };

  if (!isChatOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg"
        onClick={toggleChat}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 w-96 h-[500px] shadow-lg flex flex-col z-50", className)}>
      <CardHeader className="pb-4 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-avatar.png" alt="AI" />
              <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Report AI Assistant</CardTitle>
              {reportId && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                  Connected to Report
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="overflow-hidden flex-1 p-0">
        <ScrollArea className="h-full pb-0 px-4">
          <div className="space-y-4 pt-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 pb-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role !== 'user' && message.role !== 'system' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[80%]",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : message.role === 'system'
                        ? "bg-muted"
                        : "bg-muted"
                  )}
                >
                  {renderMessageContent(message)}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 pt-3 border-t flex gap-2">
        <Input
          placeholder="Ask about your report data..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading || !conversationId}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !conversationId || !currentMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIReportChat; 