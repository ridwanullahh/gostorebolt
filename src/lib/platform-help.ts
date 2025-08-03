import StoreSDK from './store-sdk';

export interface PlatformHelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  subcategory?: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  order: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  views: number;
  helpful: number;
  notHelpful: number;
  lastReviewed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformHelpCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  order: number;
  parentId?: string;
  subcategories: PlatformHelpCategory[];
  articleCount: number;
  featured: boolean;
  createdAt: string;
}

export interface HelpSearchResult {
  article: PlatformHelpArticle;
  relevanceScore: number;
  matchedTerms: string[];
}

class PlatformHelpManager {
  private storeSDK: StoreSDK;

  constructor() {
    this.storeSDK = new StoreSDK();
  }

  // Article Management
  async createArticle(articleData: Partial<PlatformHelpArticle>): Promise<PlatformHelpArticle> {
    const slug = this.generateSlug(articleData.title || '');
    
    return await this.storeSDK.create('platform_help_articles', {
      ...articleData,
      slug,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updateArticle(articleId: string, updates: Partial<PlatformHelpArticle>): Promise<PlatformHelpArticle> {
    if (updates.title) {
      updates.slug = this.generateSlug(updates.title);
    }
    
    return await this.storeSDK.update('platform_help_articles', articleId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteArticle(articleId: string): Promise<void> {
    return await this.storeSDK.delete('platform_help_articles', articleId);
  }

  async getArticle(articleId: string): Promise<PlatformHelpArticle | null> {
    return await this.storeSDK.getItem('platform_help_articles', articleId);
  }

  async getArticleBySlug(categorySlug: string, articleSlug: string): Promise<PlatformHelpArticle | null> {
    const articles = await this.storeSDK.queryBuilder<PlatformHelpArticle>('platform_help_articles')
      .where(article => article.slug === articleSlug && article.status === 'published')
      .exec();
    
    if (articles.length === 0) return null;
    
    const article = articles[0];
    
    // Verify category matches
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category || article.category !== category.id) {
      return null;
    }
    
    return article;
  }

  async getAllArticles(filters?: {
    status?: string;
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PlatformHelpArticle[]> {
    let query = this.storeSDK.queryBuilder<PlatformHelpArticle>('platform_help_articles');
    
    if (filters?.status) {
      query = query.where(article => article.status === filters.status);
    }
    if (filters?.category) {
      query = query.where(article => article.category === filters.category);
    }
    if (filters?.featured !== undefined) {
      query = query.where(article => article.featured === filters.featured);
    }
    
    const articles = await query.exec();
    
    // Sort by order, then by title
    articles.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
    
    if (filters?.offset) {
      articles.splice(0, filters.offset);
    }
    if (filters?.limit) {
      articles.splice(filters.limit);
    }
    
    return articles;
  }

  async getPublishedArticles(limit: number = 50): Promise<PlatformHelpArticle[]> {
    return await this.getAllArticles({
      status: 'published',
      limit
    });
  }

  async getFeaturedArticles(): Promise<PlatformHelpArticle[]> {
    return await this.getAllArticles({
      status: 'published',
      featured: true,
      limit: 10
    });
  }

  // Category Management
  async createCategory(categoryData: Partial<PlatformHelpCategory>): Promise<PlatformHelpCategory> {
    const slug = this.generateSlug(categoryData.name || '');
    
    return await this.storeSDK.create('platform_help_categories', {
      ...categoryData,
      slug,
      subcategories: [],
      articleCount: 0,
      createdAt: new Date().toISOString()
    });
  }

  async updateCategory(categoryId: string, updates: Partial<PlatformHelpCategory>): Promise<PlatformHelpCategory> {
    if (updates.name) {
      updates.slug = this.generateSlug(updates.name);
    }
    
    return await this.storeSDK.update('platform_help_categories', categoryId, updates);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    // Check if category has articles
    const articles = await this.getAllArticles({ category: categoryId });
    if (articles.length > 0) {
      throw new Error('Cannot delete category with existing articles');
    }
    
    return await this.storeSDK.delete('platform_help_categories', categoryId);
  }

  async getCategories(): Promise<PlatformHelpCategory[]> {
    const categories = await this.storeSDK.get('platform_help_categories');
    
    // Update article counts and build hierarchy
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const articles = await this.getAllArticles({ 
          category: category.id, 
          status: 'published' 
        });
        
        return {
          ...category,
          articleCount: articles.length
        };
      })
    );
    
    // Build hierarchy
    const rootCategories = categoriesWithCounts.filter(cat => !cat.parentId);
    const subcategories = categoriesWithCounts.filter(cat => cat.parentId);
    
    rootCategories.forEach(rootCat => {
      rootCat.subcategories = subcategories.filter(sub => sub.parentId === rootCat.id);
    });
    
    // Sort by order
    rootCategories.sort((a, b) => a.order - b.order);
    rootCategories.forEach(cat => {
      cat.subcategories.sort((a, b) => a.order - b.order);
    });
    
    return rootCategories;
  }

  async getCategoryBySlug(slug: string): Promise<PlatformHelpCategory | null> {
    const categories = await this.storeSDK.queryBuilder<PlatformHelpCategory>('platform_help_categories')
      .where(category => category.slug === slug)
      .exec();
    
    return categories[0] || null;
  }

  async getCategoryArticles(categoryId: string): Promise<PlatformHelpArticle[]> {
    return await this.getAllArticles({
      status: 'published',
      category: categoryId
    });
  }

  // Search Functionality
  async searchArticles(query: string): Promise<HelpSearchResult[]> {
    const allArticles = await this.getPublishedArticles();
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    const results: HelpSearchResult[] = [];
    
    allArticles.forEach(article => {
      let relevanceScore = 0;
      const matchedTerms: string[] = [];
      
      searchTerms.forEach(term => {
        // Title matches (highest weight)
        if (article.title.toLowerCase().includes(term)) {
          relevanceScore += 10;
          matchedTerms.push(term);
        }
        
        // Content matches
        if (article.content.toLowerCase().includes(term)) {
          relevanceScore += 5;
          if (!matchedTerms.includes(term)) matchedTerms.push(term);
        }
        
        // Tag matches
        if (article.tags.some(tag => tag.toLowerCase().includes(term))) {
          relevanceScore += 3;
          if (!matchedTerms.includes(term)) matchedTerms.push(term);
        }
        
        // Excerpt matches
        if (article.excerpt.toLowerCase().includes(term)) {
          relevanceScore += 2;
          if (!matchedTerms.includes(term)) matchedTerms.push(term);
        }
      });
      
      if (relevanceScore > 0) {
        results.push({
          article,
          relevanceScore,
          matchedTerms
        });
      }
    });
    
    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results;
  }

  // Analytics
  async incrementViews(articleId: string): Promise<void> {
    const article = await this.getArticle(articleId);
    if (article) {
      await this.updateArticle(articleId, { views: article.views + 1 });
    }
  }

  async markHelpful(articleId: string, helpful: boolean): Promise<void> {
    const article = await this.getArticle(articleId);
    if (article) {
      const updates = helpful
        ? { helpful: article.helpful + 1 }
        : { notHelpful: article.notHelpful + 1 };
      
      await this.updateArticle(articleId, updates);
    }
  }

  async getPopularArticles(limit: number = 10): Promise<PlatformHelpArticle[]> {
    const articles = await this.getPublishedArticles();
    
    // Sort by views
    articles.sort((a, b) => b.views - a.views);
    
    return articles.slice(0, limit);
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

  // SEO Helpers
  generateSEOData(article: PlatformHelpArticle): {
    title: string;
    description: string;
    keywords: string[];
  } {
    return {
      title: article.seo.metaTitle || `${article.title} | GoStore Help`,
      description: article.seo.metaDescription || article.excerpt,
      keywords: article.seo.keywords || article.tags
    };
  }

  // Breadcrumb Generation
  async generateBreadcrumbs(categorySlug: string, articleSlug?: string): Promise<Array<{
    name: string;
    url: string;
  }>> {
    const breadcrumbs = [
      { name: 'Help Center', url: '/help' }
    ];
    
    const category = await this.getCategoryBySlug(categorySlug);
    if (category) {
      breadcrumbs.push({
        name: category.name,
        url: `/help/${category.slug}`
      });
      
      if (articleSlug) {
        const article = await this.getArticleBySlug(categorySlug, articleSlug);
        if (article) {
          breadcrumbs.push({
            name: article.title,
            url: `/help/${category.slug}/${article.slug}`
          });
        }
      }
    }
    
    return breadcrumbs;
  }

  // Sitemap Generation
  async generateSitemap(): Promise<Array<{
    url: string;
    lastModified: string;
    priority: number;
  }>> {
    const sitemap = [];
    
    // Add help center home
    sitemap.push({
      url: '/help',
      lastModified: new Date().toISOString(),
      priority: 0.8
    });
    
    // Add categories
    const categories = await this.getCategories();
    categories.forEach(category => {
      sitemap.push({
        url: `/help/${category.slug}`,
        lastModified: new Date().toISOString(),
        priority: 0.7
      });
    });
    
    // Add articles
    const articles = await this.getPublishedArticles();
    for (const article of articles) {
      const category = await this.storeSDK.getItem('platform_help_categories', article.category);
      if (category) {
        sitemap.push({
          url: `/help/${category.slug}/${article.slug}`,
          lastModified: article.updatedAt,
          priority: article.featured ? 0.9 : 0.6
        });
      }
    }
    
    return sitemap;
  }
}

export default PlatformHelpManager;
