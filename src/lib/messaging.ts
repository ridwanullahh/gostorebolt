import StoreSDK from './store-sdk';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'store_admin' | 'customer';
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string; // Message ID being replied to
  reactions: MessageReaction[];
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  storeAdminId: string;
  storeAdminName: string;
  storeAdminAvatar?: string;
  lastMessage?: Message;
  unreadCount: {
    customer: number;
    admin: number;
  };
  status: 'active' | 'archived' | 'closed';
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string; // Store admin ID
  metadata: {
    customerInfo?: any;
    orderContext?: string;
    productContext?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

class MessagingSystem {
  private storeSDK: StoreSDK;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private onlineStatusInterval?: NodeJS.Timeout;
  private messageSubscriptions: Map<string, (message: Message) => void> = new Map();
  private conversationSubscriptions: Map<string, (conversation: Conversation) => void> = new Map();
  private typingSubscriptions: Map<string, (typing: TypingIndicator) => void> = new Map();

  constructor() {
    this.storeSDK = new StoreSDK();
    this.initializeOnlineStatus();
  }

  // Conversation Management
  async createConversation(data: {
    storeId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    storeAdminId: string;
    storeAdminName: string;
    initialMessage?: string;
  }): Promise<Conversation> {
    // Check if conversation already exists
    const existingConversation = await this.getConversationByParticipants(
      data.storeId,
      data.customerId,
      data.storeAdminId
    );

    if (existingConversation) {
      return existingConversation;
    }

    const conversation: Conversation = {
      id: this.generateId(),
      storeId: data.storeId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      storeAdminId: data.storeAdminId,
      storeAdminName: data.storeAdminName,
      unreadCount: { customer: 0, admin: 0 },
      status: 'active',
      tags: [],
      priority: 'normal',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdConversation = await this.storeSDK.create('conversations', conversation);

    // Send initial message if provided
    if (data.initialMessage) {
      await this.sendMessage({
        conversationId: createdConversation.id,
        senderId: data.customerId,
        senderType: 'customer',
        senderName: data.customerName,
        content: data.initialMessage,
        type: 'text'
      });
    }

    return createdConversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return await this.storeSDK.getItem('conversations', conversationId);
  }

  async getConversationByParticipants(
    storeId: string,
    customerId: string,
    storeAdminId: string
  ): Promise<Conversation | null> {
    const conversations = await this.storeSDK.queryBuilder<Conversation>('conversations')
      .where(conv => 
        conv.storeId === storeId &&
        conv.customerId === customerId &&
        conv.storeAdminId === storeAdminId
      )
      .exec();

    return conversations[0] || null;
  }

  async getStoreConversations(storeId: string, adminId?: string): Promise<Conversation[]> {
    let query = this.storeSDK.queryBuilder<Conversation>('conversations')
      .where(conv => conv.storeId === storeId);

    if (adminId) {
      query = query.where(conv => conv.storeAdminId === adminId || conv.assignedTo === adminId);
    }

    const conversations = await query.exec();

    // Sort by last message timestamp
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || a.updatedAt;
      const timeB = b.lastMessage?.createdAt || b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return conversations;
  }

  async getCustomerConversations(customerId: string): Promise<Conversation[]> {
    const conversations = await this.storeSDK.queryBuilder<Conversation>('conversations')
      .where(conv => conv.customerId === customerId)
      .exec();

    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || a.updatedAt;
      const timeB = b.lastMessage?.createdAt || b.updatedAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return conversations;
  }

  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<Conversation> {
    return await this.storeSDK.update('conversations', conversationId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  // Message Management
  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: 'store_admin' | 'customer';
    senderName: string;
    senderAvatar?: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'voice';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    replyTo?: string;
  }): Promise<Message> {
    const message: Message = {
      id: this.generateId(),
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderType: data.senderType,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      content: data.content,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      status: 'sent',
      replyTo: data.replyTo,
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdMessage = await this.storeSDK.create('messages', message);

    // Update conversation with last message and unread count
    const conversation = await this.getConversation(data.conversationId);
    if (conversation) {
      const unreadCount = { ...conversation.unreadCount };
      if (data.senderType === 'customer') {
        unreadCount.admin += 1;
      } else {
        unreadCount.customer += 1;
      }

      await this.updateConversation(data.conversationId, {
        lastMessage: createdMessage,
        unreadCount,
        updatedAt: new Date().toISOString()
      });
    }

    // Trigger real-time updates
    this.notifyMessageSubscribers(createdMessage);

    return createdMessage;
  }

  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const messages = await this.storeSDK.queryBuilder<Message>('messages')
      .where(msg => msg.conversationId === conversationId && !msg.deletedAt)
      .exec();

    // Sort by creation time (oldest first)
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Apply pagination
    return messages.slice(offset, offset + limit);
  }

  async markMessagesAsRead(conversationId: string, userId: string, userType: 'store_admin' | 'customer'): Promise<void> {
    const messages = await this.storeSDK.queryBuilder<Message>('messages')
      .where(msg => 
        msg.conversationId === conversationId &&
        msg.senderId !== userId &&
        msg.status !== 'read'
      )
      .exec();

    // Update message statuses
    await Promise.all(
      messages.map(message =>
        this.storeSDK.update('messages', message.id, { status: 'read' })
      )
    );

    // Update conversation unread count
    const conversation = await this.getConversation(conversationId);
    if (conversation) {
      const unreadCount = { ...conversation.unreadCount };
      if (userType === 'customer') {
        unreadCount.customer = 0;
      } else {
        unreadCount.admin = 0;
      }

      await this.updateConversation(conversationId, { unreadCount });
    }
  }

  async editMessage(messageId: string, newContent: string): Promise<Message> {
    return await this.storeSDK.update('messages', messageId, {
      content: newContent,
      editedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.storeSDK.update('messages', messageId, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Reactions
  async addReaction(messageId: string, userId: string, userName: string, emoji: string): Promise<MessageReaction> {
    const message = await this.storeSDK.getItem<Message>('messages', messageId);
    if (!message) throw new Error('Message not found');

    // Remove existing reaction from this user
    const filteredReactions = message.reactions.filter(r => r.userId !== userId);

    const reaction: MessageReaction = {
      id: this.generateId(),
      messageId,
      userId,
      userName,
      emoji,
      createdAt: new Date().toISOString()
    };

    const updatedReactions = [...filteredReactions, reaction];

    await this.storeSDK.update('messages', messageId, {
      reactions: updatedReactions,
      updatedAt: new Date().toISOString()
    });

    return reaction;
  }

  async removeReaction(messageId: string, userId: string): Promise<void> {
    const message = await this.storeSDK.getItem<Message>('messages', messageId);
    if (!message) throw new Error('Message not found');

    const filteredReactions = message.reactions.filter(r => r.userId !== userId);

    await this.storeSDK.update('messages', messageId, {
      reactions: filteredReactions,
      updatedAt: new Date().toISOString()
    });
  }

  // Typing Indicators
  async setTyping(conversationId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    const typingKey = `${conversationId}-${userId}`;
    
    if (isTyping) {
      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(typingKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout to auto-clear typing after 3 seconds
      const timeout = setTimeout(() => {
        this.setTyping(conversationId, userId, userName, false);
      }, 3000);

      this.typingTimeouts.set(typingKey, timeout);
    } else {
      // Clear timeout
      const existingTimeout = this.typingTimeouts.get(typingKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.typingTimeouts.delete(typingKey);
      }
    }

    const typingIndicator: TypingIndicator = {
      conversationId,
      userId,
      userName,
      isTyping,
      timestamp: new Date().toISOString()
    };

    // Store typing status temporarily
    await this.storeSDK.create('typing_indicators', {
      ...typingIndicator,
      id: typingKey,
      expiresAt: new Date(Date.now() + 5000).toISOString() // Expire in 5 seconds
    });

    // Notify subscribers
    this.notifyTypingSubscribers(typingIndicator);
  }

  async getTypingUsers(conversationId: string): Promise<TypingIndicator[]> {
    const indicators = await this.storeSDK.queryBuilder<TypingIndicator & { expiresAt: string }>('typing_indicators')
      .where(indicator => 
        indicator.conversationId === conversationId &&
        indicator.isTyping &&
        new Date(indicator.expiresAt) > new Date()
      )
      .exec();

    return indicators;
  }

  // Online Status
  private initializeOnlineStatus(): void {
    // Update online status every 30 seconds
    this.onlineStatusInterval = setInterval(() => {
      this.updateOnlineStatus();
    }, 30000);
  }

  private async updateOnlineStatus(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    await this.storeSDK.create('online_status', {
      id: userId,
      userId,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString() // Expire in 1 minute
    });
  }

  async getOnlineStatus(userId: string): Promise<OnlineStatus> {
    const status = await this.storeSDK.getItem<OnlineStatus & { expiresAt: string }>('online_status', userId);
    
    if (!status || new Date(status.expiresAt) <= new Date()) {
      return {
        userId,
        isOnline: false,
        lastSeen: status?.lastSeen || new Date().toISOString()
      };
    }

    return {
      userId: status.userId,
      isOnline: status.isOnline,
      lastSeen: status.lastSeen
    };
  }

  // File Upload
  async uploadFile(file: File, conversationId: string): Promise<{
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }> {
    // In a real implementation, this would upload to a file storage service
    // For now, we'll simulate with a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // Real-time Subscriptions
  subscribeToMessages(conversationId: string, callback: (message: Message) => void): string {
    const subscriptionId = this.generateId();
    this.messageSubscriptions.set(subscriptionId, callback);
    return subscriptionId;
  }

  subscribeToConversations(storeId: string, callback: (conversation: Conversation) => void): string {
    const subscriptionId = this.generateId();
    this.conversationSubscriptions.set(subscriptionId, callback);
    return subscriptionId;
  }

  subscribeToTyping(conversationId: string, callback: (typing: TypingIndicator) => void): string {
    const subscriptionId = this.generateId();
    this.typingSubscriptions.set(subscriptionId, callback);
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    this.messageSubscriptions.delete(subscriptionId);
    this.conversationSubscriptions.delete(subscriptionId);
    this.typingSubscriptions.delete(subscriptionId);
  }

  private notifyMessageSubscribers(message: Message): void {
    this.messageSubscriptions.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message subscription callback:', error);
      }
    });
  }

  private notifyTypingSubscribers(typing: TypingIndicator): void {
    this.typingSubscriptions.forEach(callback => {
      try {
        callback(typing);
      } catch (error) {
        console.error('Error in typing subscription callback:', error);
      }
    });
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentUserId(): string | null {
    // In a real implementation, this would get the current user ID from auth context
    return localStorage.getItem('currentUserId');
  }

  // Cleanup
  destroy(): void {
    if (this.onlineStatusInterval) {
      clearInterval(this.onlineStatusInterval);
    }
    
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    this.messageSubscriptions.clear();
    this.conversationSubscriptions.clear();
    this.typingSubscriptions.clear();
  }
}

export default MessagingSystem;
