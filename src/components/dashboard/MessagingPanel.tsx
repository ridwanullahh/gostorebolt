import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Paperclip, Smile, MoreHorizontal,
  Phone, Video, Search, Archive, Star, Tag,
  Image, File, Mic, X, Reply, Edit, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import MessagingSystem, { Conversation, Message, TypingIndicator } from '../../lib/messaging';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface MessagingPanelProps {
  storeId: string;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({ storeId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [messagingSystem] = useState(() => new MessagingSystem());

  useEffect(() => {
    loadConversations();
    
    // Subscribe to real-time updates
    const conversationSub = messagingSystem.subscribeToConversations(storeId, (conversation) => {
      setConversations(prev => {
        const existing = prev.find(c => c.id === conversation.id);
        if (existing) {
          return prev.map(c => c.id === conversation.id ? conversation : c);
        } else {
          return [conversation, ...prev];
        }
      });
    });

    return () => {
      messagingSystem.unsubscribe(conversationSub);
      messagingSystem.destroy();
    };
  }, [storeId]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      
      // Subscribe to messages for active conversation
      const messageSub = messagingSystem.subscribeToMessages(activeConversation.id, (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      // Subscribe to typing indicators
      const typingSub = messagingSystem.subscribeToTyping(activeConversation.id, (typing) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== typing.userId);
          return typing.isTyping ? [...filtered, typing] : filtered;
        });
      });

      // Mark messages as read
      if (user) {
        messagingSystem.markMessagesAsRead(activeConversation.id, user.id, 'store_admin');
      }

      return () => {
        messagingSystem.unsubscribe(messageSub);
        messagingSystem.unsubscribe(typingSub);
      };
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const storeConversations = await messagingSystem.getStoreConversations(storeId, user?.id);
      setConversations(storeConversations);
      
      if (storeConversations.length > 0 && !activeConversation) {
        setActiveConversation(storeConversations[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await messagingSystem.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    try {
      const messageData = {
        conversationId: activeConversation.id,
        senderId: user.id,
        senderType: 'store_admin' as const,
        senderName: user.name || user.email,
        content: newMessage.trim(),
        type: 'text' as const,
        replyTo: replyingTo?.id
      };

      await messagingSystem.sendMessage(messageData);
      setNewMessage('');
      setReplyingTo(null);
      
      // Stop typing indicator
      await messagingSystem.setTyping(activeConversation.id, user.id, user.name || user.email, false);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = async (value: string) => {
    setNewMessage(value);
    
    if (!activeConversation || !user) return;

    const isCurrentlyTyping = value.length > 0;
    
    if (isCurrentlyTyping !== isTyping) {
      setIsTyping(isCurrentlyTyping);
      await messagingSystem.setTyping(
        activeConversation.id, 
        user.id, 
        user.name || user.email, 
        isCurrentlyTyping
      );
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(async () => {
        setIsTyping(false);
        await messagingSystem.setTyping(activeConversation.id, user.id, user.name || user.email, false);
      }, 2000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeConversation || !user) return;

    try {
      const uploadResult = await messagingSystem.uploadFile(file, activeConversation.id);
      
      const messageData = {
        conversationId: activeConversation.id,
        senderId: user.id,
        senderType: 'store_admin' as const,
        senderName: user.name || user.email,
        content: file.type.startsWith('image/') ? 'Image' : 'File',
        type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
        fileUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType
      };

      await messagingSystem.sendMessage(messageData);
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      await messagingSystem.addReaction(messageId, user.id, user.name || user.email, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer ${
                  activeConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {conversation.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.customerName}
                      </h4>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conversation.unreadCount.admin > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-600 rounded-full">
                          {conversation.unreadCount.admin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
              <p className="text-gray-600">Customer messages will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {activeConversation.customerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {activeConversation.customerName}
                    </h4>
                    <p className="text-xs text-gray-500">{activeConversation.customerEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.senderType === 'store_admin';
                const showDate = index === 0 || 
                  formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        {message.replyTo && (
                          <div className="text-xs text-gray-500 mb-1 px-3">
                            Replying to: {messages.find(m => m.id === message.replyTo)?.content.substring(0, 30)}...
                          </div>
                        )}
                        
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.type === 'text' && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          
                          {message.type === 'image' && (
                            <div>
                              <img
                                src={message.fileUrl}
                                alt={message.fileName}
                                className="max-w-full h-auto rounded"
                              />
                              {message.content !== 'Image' && (
                                <p className="text-sm mt-2">{message.content}</p>
                              )}
                            </div>
                          )}
                          
                          {message.type === 'file' && (
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">{message.fileName}</p>
                                <p className="text-xs opacity-75">
                                  {(message.fileSize! / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs ${isOwn ? 'text-primary-200' : 'text-gray-500'}`}>
                              {formatTime(message.createdAt)}
                            </span>
                            
                            {message.reactions.length > 0 && (
                              <div className="flex space-x-1">
                                {message.reactions.map(reaction => (
                                  <span key={reaction.id} className="text-xs">
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {typingUsers.filter(t => t.userId !== user?.id).map(typing => (
                  <motion.div
                    key={typing.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Reply className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Replying to: {replyingTo.content.substring(0, 50)}...
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="resize-none"
                  />
                </div>
                
                <Button
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPanel;
