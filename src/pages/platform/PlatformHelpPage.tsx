import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, Book, HelpCircle, ArrowRight, ThumbsUp, 
  ThumbsDown, Eye, Clock, ChevronRight, Star,
  MessageCircle, FileText, Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PlatformHelpManager, { 
  PlatformHelpArticle, 
  PlatformHelpCategory, 
  HelpSearchResult 
} from '../../lib/platform-help';
import { Helmet } from 'react-helmet-async';

const PlatformHelpPage: React.FC = () => {
  const { category: categorySlug, article: articleSlug } = useParams();
  const [categories, setCategories] = useState<PlatformHelpCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<PlatformHelpCategory | null>(null);
  const [currentArticle, setCurrentArticle] = useState<PlatformHelpArticle | null>(null);
  const [featuredArticles, setFeaturedArticles] = useState<PlatformHelpArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<PlatformHelpArticle[]>([]);
  const [searchResults, setSearchResults] = useState<HelpSearchResult[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; url: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [helpManager] = useState(() => new PlatformHelpManager());

  useEffect(() => {
    loadHelpData();
  }, [categorySlug, articleSlug]);

  const loadHelpData = async () => {
    try {
      setIsLoading(true);
      
      if (articleSlug && categorySlug) {
        // Load single article
        const article = await helpManager.getArticleBySlug(categorySlug, articleSlug);
        if (article) {
          setCurrentArticle(article);
          await helpManager.incrementViews(article.id);
          
          // Load category for context
          const category = await helpManager.getCategoryBySlug(categorySlug);
          setCurrentCategory(category);
          
          // Generate breadcrumbs
          const crumbs = await helpManager.generateBreadcrumbs(categorySlug, articleSlug);
          setBreadcrumbs(crumbs);
        }
      } else if (categorySlug) {
        // Load category page
        const category = await helpManager.getCategoryBySlug(categorySlug);
        if (category) {
          setCurrentCategory(category);
          
          // Load category articles
          const articles = await helpManager.getCategoryArticles(category.id);
          setFeaturedArticles(articles);
          
          // Generate breadcrumbs
          const crumbs = await helpManager.generateBreadcrumbs(categorySlug);
          setBreadcrumbs(crumbs);
        }
      } else {
        // Load help center home
        const [allCategories, featured, popular] = await Promise.all([
          helpManager.getCategories(),
          helpManager.getFeaturedArticles(),
          helpManager.getPopularArticles(5)
        ]);
        
        setCategories(allCategories);
        setFeaturedArticles(featured);
        setPopularArticles(popular);
        setBreadcrumbs([{ name: 'Help Center', url: '/help' }]);
      }
    } catch (error) {
      console.error('Failed to load help data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await helpManager.searchArticles(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHelpfulVote = async (articleId: string, helpful: boolean) => {
    try {
      await helpManager.markHelpful(articleId, helpful);
      // Reload article to get updated counts
      if (currentArticle && currentArticle.id === articleId) {
        const updatedArticle = await helpManager.getArticle(articleId);
        if (updatedArticle) {
          setCurrentArticle(updatedArticle);
        }
      }
    } catch (error) {
      console.error('Failed to record vote:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading help center...</p>
        </div>
      </div>
    );
  }

  // Single Article View
  if (articleSlug && currentArticle) {
    const seoData = helpManager.generateSEOData(currentArticle);
    
    return (
      <>
        <Helmet>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords.join(', ')} />
        </Helmet>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <li>
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-gray-900">{crumb.name}</span>
                    ) : (
                      <Link to={crumb.url} className="hover:text-gray-700">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentArticle.title}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Updated {formatDate(currentArticle.updatedAt)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{currentArticle.views.toLocaleString()} views</span>
              </div>
              {currentArticle.lastReviewed && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  <span>Reviewed {formatDate(currentArticle.lastReviewed)}</span>
                </div>
              )}
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: currentArticle.content }} />
          </article>

          {/* Article Footer */}
          <footer className="border-t border-gray-200 pt-8 mb-12">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Was this article helpful?</h3>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleHelpfulVote(currentArticle.id, true)}
                  className="flex items-center space-x-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes ({currentArticle.helpful})</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleHelpfulVote(currentArticle.id, false)}
                  className="flex items-center space-x-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>No ({currentArticle.notHelpful})</span>
                </Button>
              </div>
            </div>
          </footer>

          {/* Related Articles */}
          {currentCategory && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">More from {currentCategory.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles
                  .filter(article => article.id !== currentArticle.id)
                  .slice(0, 4)
                  .map(article => (
                    <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        <Link 
                          to={`/help/${currentCategory.slug}/${article.slug}`}
                          className="hover:text-primary-600"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{article.views} views</span>
                        <span>Updated {formatDate(article.updatedAt)}</span>
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
          )}
        </div>
      </>
    );
  }

  // Category View
  if (categorySlug && currentCategory) {
    return (
      <>
        <Helmet>
          <title>{currentCategory.name} | GoStore Help Center</title>
          <meta name="description" content={currentCategory.description || `Help articles for ${currentCategory.name}`} />
        </Helmet>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <li>
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-gray-900">{crumb.name}</span>
                    ) : (
                      <Link to={crumb.url} className="hover:text-gray-700">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Category Header */}
          <div className="text-center mb-12">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4`} 
                 style={{ backgroundColor: currentCategory.color + '20' }}>
              <span className="text-2xl">{currentCategory.icon}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentCategory.name}</h1>
            {currentCategory.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{currentCategory.description}</p>
            )}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <Link 
                      to={`/help/${currentCategory.slug}/${article.slug}`}
                      className="hover:text-primary-600"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{article.views} views</span>
                    </div>
                    <span>Updated {formatDate(article.updatedAt)}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {featuredArticles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600">Articles for this category will appear here.</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // Help Center Home
  return (
    <>
      <Helmet>
        <title>Help Center | GoStore - Get Support & Documentation</title>
        <meta name="description" content="Find answers to your questions with our comprehensive help center. Get support for GoStore platform features and functionality." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Search our knowledge base or browse categories to find the answers you need.
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 py-3 text-lg"
                />
              </div>
              <Button 
                variant="primary" 
                onClick={handleSearch}
                disabled={isSearching}
                className="px-8 py-3"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.map(({ article, relevanceScore, matchedTerms }) => (
                <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <Link 
                          to={`/help/${categories.find(c => c.id === article.category)?.slug}/${article.slug}`}
                          className="hover:text-primary-600"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-3">{article.excerpt}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{article.views} views</span>
                        <span>•</span>
                        <span>Matched: {matchedTerms.join(', ')}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {Math.round(relevanceScore)}% match
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {!searchResults.length && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/help/${category.slug}`}>
                      <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                             style={{ backgroundColor: category.color + '20' }}>
                          <span className="text-xl">{category.icon}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-600 mb-4">{category.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{category.articleCount} articles</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                        <div className="flex items-center mb-3">
                          <Star className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium text-yellow-700">Featured</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          <Link 
                            to={`/help/${categories.find(c => c.id === article.category)?.slug}/${article.slug}`}
                            className="hover:text-primary-600"
                          >
                            {article.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{article.views} views</span>
                          </div>
                          <span>Updated {formatDate(article.updatedAt)}</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Articles */}
            {popularArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularArticles.map((article, index) => (
                    <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            <Link 
                              to={`/help/${categories.find(c => c.id === article.category)?.slug}/${article.slug}`}
                              className="hover:text-primary-600"
                            >
                              {article.title}
                            </Link>
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Eye className="h-3 w-3 mr-1" />
                            <span>{article.views.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Contact Support */}
        <section className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
          <MessageCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary">
              Contact Support
            </Button>
            <Button variant="outline">
              Join Community
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default PlatformHelpPage;
