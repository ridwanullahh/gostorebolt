import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, X, Minimize2, Maximize2, 
  Paperclip, Smile, Phone, Video, Image, File
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MessagingSystem, { Conversation, Message, TypingIndicator } from '../../lib/messaging';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CustomerMessagingWidgetProps {
  storeId: string;
  storeAdminId: string;
  storeAdminName: string;
  storeName: string;
  position?: 'bottom-right' | 'bottom-left';
}

const CustomerMessagingWidget: React.FC<CustomerMessagingWidgetProps> = ({
  storeId,
  storeAdminId,
  storeAdminName,
  storeName,
  position = 'bottom-right'
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [messagingSystem] = useState(() => new MessagingSystem());

  useEffect(() => {
    if (user && isOpen) {
      initializeConversation();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      
      // Subscribe to real-time updates
      const messageSub = messagingSystem.subscribeToMessages(conversation.id, (message) => {
        setMessages(prev => [...prev, message]);
        
        // Update unread count if widget is minimized or closed
        if (isMinimized || !isOpen) {
          if (message.senderType === 'store_admin') {
            setUnreadCount(prev => prev + 1);
          }
        }
        
        scrollToBottom();
      });

      const typingSub = messagingSystem.subscribeToTyping(conversation.id, (typing) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== typing.userId);
          return typing.isTyping ? [...filtered, typing] : filtered;
        });
      });

      return () => {
        messagingSystem.unsubscribe(messageSub);
        messagingSystem.unsubscribe(typingSub);
      };
    }
  }, [conversation, isMinimized, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when widget is opened and not minimized
    if (isOpen && !isMinimized && conversation && user) {
      messagingSystem.markMessagesAsRead(conversation.id, user.id, 'customer');
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized, conversation, user]);

  const initializeConversation = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Try to find existing conversation
      let existingConversation = await messagingSystem.getConversationByParticipants(
        storeId,
        user.id,
        storeAdminId
      );

      if (!existingConversation) {
        // Create new conversation
        existingConversation = await messagingSystem.createConversation({
          storeId,
          customerId: user.id,
          customerName: user.name || user.email,
          customerEmail: user.email,
          storeAdminId,
          storeAdminName
        });
      }

      setConversation(existingConversation);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      const conversationMessages = await messagingSystem.getMessages(conversation.id);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || !user) return;

    try {
      const messageData = {
        conversationId: conversation.id,
        senderId: user.id,
        senderType: 'customer' as const,
        senderName: user.name || user.email,
        content: newMessage.trim(),
        type: 'text' as const
      };

      await messagingSystem.sendMessage(messageData);
      setNewMessage('');
      
      // Stop typing indicator
      await messagingSystem.setTyping(conversation.id, user.id, user.name || user.email, false);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = async (value: string) => {
    setNewMessage(value);
    
    if (!conversation || !user) return;

    const isCurrentlyTyping = value.length > 0;
    
    if (isCurrentlyTyping !== isTyping) {
      setIsTyping(isCurrentlyTyping);
      await messagingSystem.setTyping(
        conversation.id, 
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
        await messagingSystem.setTyping(conversation.id, user.id, user.name || user.email, false);
      }, 2000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversation || !user) return;

    try {
      const uploadResult = await messagingSystem.uploadFile(file, conversation.id);
      
      const messageData = {
        conversationId: conversation.id,
        senderId: user.id,
        senderType: 'customer' as const,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`mb-4 bg-white rounded-lg shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{storeName}</h4>
                  <p className="text-xs opacity-90">
                    {typingUsers.filter(t => t.userId !== user?.id).length > 0
                      ? 'Typing...'
                      : 'We\'re here to help!'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 h-64 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message) => {
                      const isOwn = message.senderType === 'customer';
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                isOwn
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {message.type === 'text' && (
                                <p>{message.content}</p>
                              )}
                              
                              {message.type === 'image' && (
                                <div>
                                  <img
                                    src={message.fileUrl}
                                    alt={message.fileName}
                                    className="max-w-full h-auto rounded"
                                  />
                                  {message.content !== 'Image' && (
                                    <p className="mt-1">{message.content}</p>
                                  )}
                                </div>
                              )}
                              
                              {message.type === 'file' && (
                                <div className="flex items-center space-x-2">
                                  <File className="h-4 w-4" />
                                  <div>
                                    <p className="font-medium">{message.fileName}</p>
                                    <p className="text-xs opacity-75">
                                      {(message.fileSize! / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <span className={`text-xs block mt-1 ${
                                isOwn ? 'text-primary-200' : 'text-gray-500'
                              }`}>
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Start a conversation with us!</p>
                    </div>
                  )}
                  
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
                        <div className="bg-gray-100 px-3 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="text-sm"
                        disabled={!user}
                      />
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !user}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {!user && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please log in to start a conversation
                    </p>
                  )}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center relative"
      >
        <MessageCircle className="h-6 w-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default CustomerMessagingWidget;
