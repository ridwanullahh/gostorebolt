import StoreSDK from './store-sdk';

export interface PlatformBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  readingTime: number;
  views: number;
  likes: number;
  comments: PlatformBlogComment[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformBlogComment {
  id: string;
  postId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parentId?: string; // For nested comments
  createdAt: string;
}

export interface PlatformBlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
  createdAt: string;
}

class PlatformBlogManager {
  private storeSDK: StoreSDK;

  constructor() {
    this.storeSDK = new StoreSDK();
  }

  // Blog Posts Management
  async createPost(postData: Partial<PlatformBlogPost>): Promise<PlatformBlogPost> {
    const slug = this.generateSlug(postData.title || '');
    const readingTime = this.calculateReadingTime(postData.content || '');
    
    return await this.storeSDK.create('platform_blog_posts', {
      ...postData,
      slug,
      readingTime,
      views: 0,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updatePost(postId: string, updates: Partial<PlatformBlogPost>): Promise<PlatformBlogPost> {
    if (updates.title) {
      updates.slug = this.generateSlug(updates.title);
    }
    if (updates.content) {
      updates.readingTime = this.calculateReadingTime(updates.content);
    }
    
    return await this.storeSDK.update('platform_blog_posts', postId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async deletePost(postId: string): Promise<void> {
    return await this.storeSDK.delete('platform_blog_posts', postId);
  }

  async getPost(postId: string): Promise<PlatformBlogPost | null> {
    return await this.storeSDK.getItem('platform_blog_posts', postId);
  }

  async getPostBySlug(slug: string): Promise<PlatformBlogPost | null> {
    const posts = await this.storeSDK.queryBuilder<PlatformBlogPost>('platform_blog_posts')
      .where(post => post.slug === slug && post.status === 'published')
      .exec();
    
    return posts[0] || null;
  }

  async getAllPosts(filters?: {
    status?: string;
    category?: string;
    author?: string;
    limit?: number;
    offset?: number;
  }): Promise<PlatformBlogPost[]> {
    let query = this.storeSDK.queryBuilder<PlatformBlogPost>('platform_blog_posts');
    
    if (filters?.status) {
      query = query.where(post => post.status === filters.status);
    }
    if (filters?.category) {
      query = query.where(post => post.category === filters.category);
    }
    if (filters?.author) {
      query = query.where(post => post.author.id === filters.author);
    }
    
    const posts = await query.exec();
    
    // Sort by publishedAt or createdAt
    posts.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
    
    if (filters?.offset) {
      posts.splice(0, filters.offset);
    }
    if (filters?.limit) {
      posts.splice(filters.limit);
    }
    
    return posts;
  }

  async getPublishedPosts(limit: number = 10, offset: number = 0): Promise<PlatformBlogPost[]> {
    return await this.getAllPosts({
      status: 'published',
      limit,
      offset
    });
  }

  async searchPosts(query: string): Promise<PlatformBlogPost[]> {
    const allPosts = await this.getAllPosts({ status: 'published' });
    
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Categories Management
  async createCategory(categoryData: Partial<PlatformBlogCategory>): Promise<PlatformBlogCategory> {
    const slug = this.generateSlug(categoryData.name || '');
    
    return await this.storeSDK.create('platform_blog_categories', {
      ...categoryData,
      slug,
      postCount: 0,
      createdAt: new Date().toISOString()
    });
  }

  async updateCategory(categoryId: string, updates: Partial<PlatformBlogCategory>): Promise<PlatformBlogCategory> {
    if (updates.name) {
      updates.slug = this.generateSlug(updates.name);
    }
    
    return await this.storeSDK.update('platform_blog_categories', categoryId, updates);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return await this.storeSDK.delete('platform_blog_categories', categoryId);
  }

  async getCategories(): Promise<PlatformBlogCategory[]> {
    const categories = await this.storeSDK.get('platform_blog_categories');
    
    // Update post counts
    for (const category of categories) {
      const posts = await this.getAllPosts({ category: category.id, status: 'published' });
      category.postCount = posts.length;
    }
    
    return categories;
  }

  // Comments Management
  async addComment(commentData: Partial<PlatformBlogComment>): Promise<PlatformBlogComment> {
    const comment = await this.storeSDK.create('platform_blog_comments', {
      ...commentData,
      status: 'pending', // All comments start as pending
      createdAt: new Date().toISOString()
    });
    
    // Add comment to post
    const post = await this.getPost(commentData.postId!);
    if (post) {
      post.comments.push(comment);
      await this.updatePost(post.id, { comments: post.comments });
    }
    
    return comment;
  }

  async moderateComment(commentId: string, status: 'approved' | 'spam'): Promise<PlatformBlogComment> {
    return await this.storeSDK.update('platform_blog_comments', commentId, { status });
  }

  async deleteComment(commentId: string): Promise<void> {
    return await this.storeSDK.delete('platform_blog_comments', commentId);
  }

  // Analytics
  async incrementViews(postId: string): Promise<void> {
    const post = await this.getPost(postId);
    if (post) {
      await this.updatePost(postId, { views: post.views + 1 });
    }
  }

  async toggleLike(postId: string, increment: boolean = true): Promise<void> {
    const post = await this.getPost(postId);
    if (post) {
      const newLikes = increment ? post.likes + 1 : Math.max(0, post.likes - 1);
      await this.updatePost(postId, { likes: newLikes });
    }
  }

  // Utility Methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // SEO Helpers
  generateSEOData(post: PlatformBlogPost): {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  } {
    return {
      title: post.seo.metaTitle || `${post.title} | GoStore Blog`,
      description: post.seo.metaDescription || post.excerpt,
      keywords: post.seo.keywords || post.tags,
      ogImage: post.featuredImage
    };
  }

  // RSS Feed Generation
  async generateRSSFeed(): Promise<string> {
    const posts = await this.getPublishedPosts(20);
    
    const rssItems = posts.map(post => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <description><![CDATA[${post.excerpt}]]></description>
        <link>https://gostore.com/blog/${post.slug}</link>
        <guid>https://gostore.com/blog/${post.slug}</guid>
        <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
        <author>${post.author.email} (${post.author.name})</author>
        <category>${post.category}</category>
      </item>
    `).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>GoStore Blog</title>
          <description>Latest news and insights from GoStore</description>
          <link>https://gostore.com/blog</link>
          <language>en-us</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${rssItems}
        </channel>
      </rss>`;
  }
}

export default PlatformBlogManager;
