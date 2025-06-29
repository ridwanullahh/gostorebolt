// Chutes AI Integration
interface ChutesAIConfig {
  apiToken: string;
  baseUrl?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ChutesAI {
  private apiToken: string;
  private baseUrl: string;

  constructor(config: ChutesAIConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || 'https://llm.chutes.ai/v1';
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'deepseek-ai/DeepSeek-V3-0324',
        messages: request.messages,
        stream: request.stream || false,
        max_tokens: request.max_tokens || 1024,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chutes AI API error: ${response.statusText}`);
    }

    return response.json();
  }

  async generateProductName(description: string): Promise<string> {
    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert e-commerce product naming specialist. Generate catchy, SEO-friendly product names that are concise and appealing to customers.'
        },
        {
          role: 'user',
          content: `Generate a compelling product name for: ${description}. Return only the product name, nothing else.`
        }
      ],
      max_tokens: 50,
      temperature: 0.8
    });

    return response.choices[0]?.message?.content?.trim() || 'Unnamed Product';
  }

  async generateProductDescription(productName: string, features?: string[]): Promise<string> {
    const featuresText = features?.length ? `Key features: ${features.join(', ')}` : '';
    
    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert e-commerce copywriter. Write compelling, SEO-optimized product descriptions that highlight benefits and drive conversions.'
        },
        {
          role: 'user',
          content: `Write a compelling product description for "${productName}". ${featuresText}. Make it engaging and highlight the benefits to customers.`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content?.trim() || 'Product description coming soon.';
  }

  async generateMarketingCopy(productName: string, audience: string, copyType: 'email' | 'social' | 'ad'): Promise<string> {
    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are an expert marketing copywriter specializing in ${copyType} campaigns. Write compelling copy that drives conversions and engages the target audience.`
        },
        {
          role: 'user',
          content: `Create ${copyType} marketing copy for "${productName}" targeting ${audience}. Make it compelling and action-oriented.`
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    return response.choices[0]?.message?.content?.trim() || 'Marketing copy generated.';
  }

  async generateSEOKeywords(productName: string, category: string): Promise<string[]> {
    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an SEO specialist. Generate relevant, high-converting keywords for e-commerce products. Return only a comma-separated list of keywords.'
        },
        {
          role: 'user',
          content: `Generate 10 SEO keywords for "${productName}" in the ${category} category. Return only keywords separated by commas.`
        }
      ],
      max_tokens: 100,
      temperature: 0.6
    });

    const keywords = response.choices[0]?.message?.content?.trim() || '';
    return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  }

  async chatWithCustomer(message: string, context?: string): Promise<string> {
    const systemMessage = context 
      ? `You are a helpful customer service assistant for an e-commerce store. Context: ${context}. Be friendly, helpful, and professional.`
      : 'You are a helpful customer service assistant for an e-commerce store. Be friendly, helpful, and professional.';

    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content?.trim() || 'I apologize, I\'m having trouble responding right now. Please try again or contact support.';
  }
}

export default ChutesAI;
export type { ChutesAIConfig, ChatMessage, ChatCompletionRequest, ChatCompletionResponse };