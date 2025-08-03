import StoreSDK from './store-sdk';

export interface EmailTemplate {
  id: string;
  storeId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'welcome' | 'abandoned_cart' | 'order_confirmation' | 'shipping' | 'newsletter' | 'promotional' | 'custom';
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  storeId: string;
  name: string;
  templateId: string;
  subject: string;
  recipients: string[];
  segmentId?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: string;
  sentAt?: string;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailSubscriber {
  id: string;
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  source: 'newsletter' | 'checkout' | 'account' | 'popup' | 'import';
  tags: string[];
  customFields: Record<string, any>;
  subscribedAt: string;
  unsubscribedAt?: string;
}

export interface AutomationRule {
  id: string;
  storeId: string;
  name: string;
  trigger: {
    type: 'welcome' | 'abandoned_cart' | 'post_purchase' | 'birthday' | 'custom';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'send_email' | 'add_tag' | 'remove_tag' | 'wait';
    delay?: number; // in hours
    templateId?: string;
    tag?: string;
  }>;
  isActive: boolean;
  stats: {
    triggered: number;
    completed: number;
  };
  createdAt: string;
  updatedAt: string;
}

class EmailMarketing {
  private storeSDK: StoreSDK;
  private storeId: string;

  constructor(storeId: string) {
    this.storeSDK = new StoreSDK();
    this.storeId = storeId;
  }

  // Email Templates
  async createTemplate(templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return await this.storeSDK.create('email_templates', {
      ...templateData,
      storeId: this.storeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    return await this.storeSDK.queryBuilder<EmailTemplate>('email_templates')
      .where(template => template.storeId === this.storeId)
      .exec();
  }

  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return await this.storeSDK.update('email_templates', templateId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  // Email Campaigns
  async createCampaign(campaignData: Partial<EmailCampaign>): Promise<EmailCampaign> {
    return await this.storeSDK.create('email_campaigns', {
      ...campaignData,
      storeId: this.storeId,
      status: 'draft',
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    return await this.storeSDK.queryBuilder<EmailCampaign>('email_campaigns')
      .where(campaign => campaign.storeId === this.storeId)
      .exec();
  }

  async sendCampaign(campaignId: string): Promise<boolean> {
    try {
      const campaign = await this.storeSDK.getItem<EmailCampaign>('email_campaigns', campaignId);
      if (!campaign || campaign.status !== 'draft') {
        throw new Error('Campaign not found or not in draft status');
      }

      // Update status to sending
      await this.storeSDK.update('email_campaigns', campaignId, {
        status: 'sending',
        updatedAt: new Date().toISOString()
      });

      // Simulate sending emails
      const template = await this.storeSDK.getItem<EmailTemplate>('email_templates', campaign.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Get subscribers
      const subscribers = await this.getSubscribers();
      const recipients = campaign.recipients.length > 0 
        ? subscribers.filter(sub => campaign.recipients.includes(sub.email))
        : subscribers.filter(sub => sub.status === 'subscribed');

      // Simulate email sending process
      let sent = 0;
      let delivered = 0;
      let bounced = 0;

      for (const recipient of recipients) {
        // Simulate email delivery (95% success rate)
        const isDelivered = Math.random() > 0.05;
        sent++;
        
        if (isDelivered) {
          delivered++;
          
          // Create email log
          await this.storeSDK.create('email_logs', {
            storeId: this.storeId,
            campaignId,
            templateId: campaign.templateId,
            recipientEmail: recipient.email,
            status: 'delivered',
            sentAt: new Date().toISOString()
          });
        } else {
          bounced++;
          
          await this.storeSDK.create('email_logs', {
            storeId: this.storeId,
            campaignId,
            templateId: campaign.templateId,
            recipientEmail: recipient.email,
            status: 'bounced',
            sentAt: new Date().toISOString()
          });
        }
      }

      // Update campaign with final stats
      await this.storeSDK.update('email_campaigns', campaignId, {
        status: 'sent',
        sentAt: new Date().toISOString(),
        stats: {
          sent,
          delivered,
          opened: 0, // Will be updated when opens are tracked
          clicked: 0, // Will be updated when clicks are tracked
          bounced,
          unsubscribed: 0
        },
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Failed to send campaign:', error);
      
      // Update status to failed
      await this.storeSDK.update('email_campaigns', campaignId, {
        status: 'draft', // Reset to draft so it can be sent again
        updatedAt: new Date().toISOString()
      });
      
      return false;
    }
  }

  // Email Subscribers
  async addSubscriber(subscriberData: Partial<EmailSubscriber>): Promise<EmailSubscriber> {
    // Check if subscriber already exists
    const existing = await this.storeSDK.queryBuilder<EmailSubscriber>('email_subscribers')
      .where(sub => sub.storeId === this.storeId && sub.email === subscriberData.email)
      .exec();

    if (existing.length > 0) {
      // Update existing subscriber
      return await this.storeSDK.update('email_subscribers', existing[0].id, {
        status: 'subscribed',
        subscribedAt: new Date().toISOString(),
        ...subscriberData
      });
    }

    return await this.storeSDK.create('email_subscribers', {
      ...subscriberData,
      storeId: this.storeId,
      status: 'subscribed',
      tags: subscriberData.tags || [],
      customFields: subscriberData.customFields || {},
      subscribedAt: new Date().toISOString()
    });
  }

  async getSubscribers(): Promise<EmailSubscriber[]> {
    return await this.storeSDK.queryBuilder<EmailSubscriber>('email_subscribers')
      .where(subscriber => subscriber.storeId === this.storeId)
      .exec();
  }

  async unsubscribe(email: string): Promise<boolean> {
    try {
      const subscribers = await this.storeSDK.queryBuilder<EmailSubscriber>('email_subscribers')
        .where(sub => sub.storeId === this.storeId && sub.email === email)
        .exec();

      if (subscribers.length > 0) {
        await this.storeSDK.update('email_subscribers', subscribers[0].id, {
          status: 'unsubscribed',
          unsubscribedAt: new Date().toISOString()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  // Automation Rules
  async createAutomation(automationData: Partial<AutomationRule>): Promise<AutomationRule> {
    return await this.storeSDK.create('automation_rules', {
      ...automationData,
      storeId: this.storeId,
      isActive: true,
      stats: {
        triggered: 0,
        completed: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async getAutomations(): Promise<AutomationRule[]> {
    return await this.storeSDK.queryBuilder<AutomationRule>('automation_rules')
      .where(rule => rule.storeId === this.storeId)
      .exec();
  }

  // Trigger automation based on events
  async triggerAutomation(triggerType: string, data: Record<string, any>): Promise<void> {
    try {
      const automations = await this.storeSDK.queryBuilder<AutomationRule>('automation_rules')
        .where(rule => 
          rule.storeId === this.storeId && 
          rule.isActive && 
          rule.trigger.type === triggerType
        )
        .exec();

      for (const automation of automations) {
        // Check if conditions are met
        if (this.checkAutomationConditions(automation.trigger.conditions, data)) {
          await this.executeAutomation(automation, data);
        }
      }
    } catch (error) {
      console.error('Failed to trigger automation:', error);
    }
  }

  private checkAutomationConditions(conditions: Record<string, any>, data: Record<string, any>): boolean {
    // Simple condition checking - can be expanded
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private async executeAutomation(automation: AutomationRule, data: Record<string, any>): Promise<void> {
    try {
      // Update triggered count
      await this.storeSDK.update('automation_rules', automation.id, {
        stats: {
          ...automation.stats,
          triggered: automation.stats.triggered + 1
        },
        updatedAt: new Date().toISOString()
      });

      // Execute actions
      for (const action of automation.actions) {
        if (action.delay) {
          // In a real implementation, this would be handled by a job queue
          await new Promise(resolve => setTimeout(resolve, action.delay * 1000));
        }

        switch (action.type) {
          case 'send_email':
            if (action.templateId && data.email) {
              await this.sendAutomationEmail(action.templateId, data.email, data);
            }
            break;
          case 'add_tag':
            if (action.tag && data.email) {
              await this.addTagToSubscriber(data.email, action.tag);
            }
            break;
          case 'remove_tag':
            if (action.tag && data.email) {
              await this.removeTagFromSubscriber(data.email, action.tag);
            }
            break;
        }
      }

      // Update completed count
      await this.storeSDK.update('automation_rules', automation.id, {
        stats: {
          ...automation.stats,
          completed: automation.stats.completed + 1
        },
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to execute automation:', error);
    }
  }

  private async sendAutomationEmail(templateId: string, email: string, data: Record<string, any>): Promise<void> {
    // Implementation for sending automated emails
    await this.storeSDK.create('email_logs', {
      storeId: this.storeId,
      templateId,
      recipientEmail: email,
      status: 'delivered',
      type: 'automation',
      sentAt: new Date().toISOString()
    });
  }

  private async addTagToSubscriber(email: string, tag: string): Promise<void> {
    const subscribers = await this.storeSDK.queryBuilder<EmailSubscriber>('email_subscribers')
      .where(sub => sub.storeId === this.storeId && sub.email === email)
      .exec();

    if (subscribers.length > 0) {
      const subscriber = subscribers[0];
      const tags = [...new Set([...subscriber.tags, tag])];
      
      await this.storeSDK.update('email_subscribers', subscriber.id, { tags });
    }
  }

  private async removeTagFromSubscriber(email: string, tag: string): Promise<void> {
    const subscribers = await this.storeSDK.queryBuilder<EmailSubscriber>('email_subscribers')
      .where(sub => sub.storeId === this.storeId && sub.email === email)
      .exec();

    if (subscribers.length > 0) {
      const subscriber = subscribers[0];
      const tags = subscriber.tags.filter(t => t !== tag);
      
      await this.storeSDK.update('email_subscribers', subscriber.id, { tags });
    }
  }
}

export default EmailMarketing;
