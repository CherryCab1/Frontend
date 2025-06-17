import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search, MoreVertical, Phone, Video, Bot, MessageCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Conversation, Message } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: number) => void;
  platformColor: string;
}

function ConversationItem({ conversation, isSelected, onSelect, platformColor }: ConversationItemProps) {
  return (
    <motion.div
      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-primary/20 border border-primary/30' 
          : 'hover:bg-muted/50'
      }`}
      onClick={() => onSelect(conversation.id)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <div className={`w-12 h-12 bg-gradient-to-r ${platformColor} rounded-full flex items-center justify-center`}>
          <span className="text-sm font-semibold text-white">
            {conversation.initials}
          </span>
        </div>
        <div className={`absolute -top-1 -right-1 w-4 h-4 border-2 border-background rounded-full ${
          conversation.isOnline ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{conversation.name}</p>
        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">{conversation.time}</p>
        {conversation.unreadCount && conversation.unreadCount > 0 && (
          <div className="w-5 h-5 bg-[hsl(190,100%,50%)] rounded-full text-xs flex items-center justify-center mt-1 text-white">
            {conversation.unreadCount}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/conversations/${selectedConversation?.id}/messages`, {
        content,
        isFromBot: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation?.id, "messages"] });
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const filteredConversations = conversations?.filter(conversation => {
    if (selectedPlatform === "all") return true;
    return conversation.platform === selectedPlatform;
  }) || [];

  if (conversationsLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid md:grid-cols-3 gap-6 h-96">
            <div className="bg-muted rounded-xl" />
            <div className="md:col-span-2 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-4 md:p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Manage customer conversations across all platforms</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-40 bg-card border-muted">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="telegram_bot">Telegram Bot</SelectItem>
              <SelectItem value="telegram_personal">Personal Telegram</SelectItem>
              <SelectItem value="messenger">Messenger</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-280px)] md:h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-0 h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="space-y-4 overflow-y-auto h-full">
                <AnimatePresence>
                  {filteredConversations.map((conversation) => (
                    <DropdownMenu key={conversation.id}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-3 w-full justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-[hsl(280,89%,68%)] rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {conversation.initials}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <p className="font-semibold truncate">{conversation.name}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {conversation.platform === 'telegram_bot' && (
                                      <><Bot className="w-3 h-3 mr-1" />Bot</>
                                    )}
                                    {conversation.platform === 'telegram_personal' && (
                                      <><Send className="w-3 h-3 mr-1" />Telegram</>
                                    )}
                                    {conversation.platform === 'messenger' && (
                                      <><MessageCircle className="w-3 h-3 mr-1" />Messenger</>
                                    )}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{conversation.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">{conversation.unreadCount}</span>
                              </div>
                            )}
                            <div className={`w-2 h-2 rounded-full ${conversation.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" forceMount>
                        <DropdownMenuItem onClick={() => setSelectedConversation(conversation)}>
                          <Users className="w-4 h-4 mr-2" /> View Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Messages */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="glass border-0 h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-muted">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-[hsl(280,89%,68%)] rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {selectedConversation?.initials}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{selectedConversation?.name}</p>
                  <p className="text-sm text-green-400">
                    {selectedConversation?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 overflow-y-auto space-y-4">
              <AnimatePresence>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className={`h-16 bg-muted rounded-2xl max-w-xs ${
                          i % 2 === 0 ? '' : 'ml-auto'
                        }`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  messages?.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.isFromBot ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        <div className={`rounded-2xl p-4 ${
                          message.isFromBot 
                            ? 'bg-primary text-primary-foreground rounded-tr-md' 
                            : 'bg-muted rounded-tl-md'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 ${
                          message.isFromBot ? 'text-right' : ''
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-6 border-t border-muted">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-card border-muted resize-none"
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={sendMessageMutation.isPending || !newMessage.trim()}
                >
                  {sendMessageMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}