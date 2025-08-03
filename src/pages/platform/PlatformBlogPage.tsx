import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, User, Clock, Eye, Heart, Share2, 
  Search, Tag, ArrowRight, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PlatformBlogManager, { PlatformBlogPost, PlatformBlogCategory } from '../../lib/platform-blog';
import { Helmet } from 'react-helmet-async';

const PlatformBlogPage: React.FC = () => {
  const { slug } = useParams();
  const [posts, setPosts] = useState<PlatformBlogPost[]>([]);
  const [categories, setCategories] = useState<PlatformBlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<PlatformBlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<PlatformBlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [blogManager] = useState(() => new PlatformBlogManager());

  useEffect(() => {
    loadBlogData();
  }, [slug]);

  const loadBlogData = async () => {
    try {
      setIsLoading(true);
      
      if (slug) {
        // Load single post
        const post = await blogManager.getPostBySlug(slug);
        if (post) {
          setCurrentPost(post);
          await blogManager.incrementViews(post.id);
          
          // Load related posts
          const relatedPosts = await blogManager.getAllPosts({
            status: 'published',
            category: post.category,
            limit: 3
          });
          setFeaturedPosts(relatedPosts.filter(p => p.id !== post.id));
        }
      } else {
        // Load blog archive
        const [allPosts, allCategories] = await Promise.all([
          blogManager.getPublishedPosts(20),
          blogManager.getCategories()
        ]);
        
        setPosts(allPosts);
        setCategories(allCategories);
        setFeaturedPosts(allPosts.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load blog data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const searchResults = await blogManager.searchPosts(searchTerm);
      setPosts(searchResults);
    } else {
      const allPosts = await blogManager.getPublishedPosts(20);
      setPosts(allPosts);
    }
  };

  const handleCategoryFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'all') {
      const allPosts = await blogManager.getPublishedPosts(20);
      setPosts(allPosts);
    } else {
      const filteredPosts = await blogManager.getAllPosts({
        status: 'published',
        category: categoryId,
        limit: 20
      });
      setPosts(filteredPosts);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  // Single Post View
  if (slug && currentPost) {
    const seoData = blogManager.generateSEOData(currentPost);
    
    return (
      <>
        <Helmet>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords.join(', ')} />
          {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}
          <meta property="og:title" content={seoData.title} />
          <meta property="og:description" content={seoData.description} />
          <meta property="og:type" content="article" />
        </Helmet>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
              <li>/</li>
              <li><Link to="/blog" className="hover:text-gray-700">Blog</Link></li>
              <li>/</li>
              <li className="text-gray-900">{currentPost.title}</li>
            </ol>
          </nav>

          {/* Post Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {categories.find(c => c.id === currentPost.category)?.name || 'Uncategorized'}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{currentPost.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(currentPost.publishedAt || currentPost.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatReadingTime(currentPost.readingTime)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <span>{currentPost.views.toLocaleString()} views</span>
              </div>
            </div>

            {currentPost.featuredImage && (
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
                <img
                  src={currentPost.featuredImage}
                  alt={currentPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Post Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
          </article>

          {/* Post Footer */}
          <footer className="border-t border-gray-200 pt-8 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  {currentPost.likes} Likes
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {currentPost.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </footer>

          {/* Related Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPosts.map(post => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {post.featuredImage && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary-600">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        <span>{formatReadingTime(post.readingTime)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({currentPost.comments.length})
            </h2>
            
            {currentPost.comments.length > 0 ? (
              <div className="space-y-6">
                {currentPost.comments
                  .filter(comment => comment.status === 'approved')
                  .map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                          <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                <p className="text-gray-600">Be the first to share your thoughts!</p>
              </div>
            )}
          </section>
        </div>
      </>
    );
  }

  // Blog Archive View
  return (
    <>
      <Helmet>
        <title>Blog | GoStore - E-commerce Insights & Updates</title>
        <meta name="description" content="Stay updated with the latest e-commerce trends, platform updates, and business insights from GoStore." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GoStore Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest e-commerce trends, platform updates, and business insights.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Posts
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.postCount})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && selectedCategory === 'all' && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    {post.featuredImage && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col h-full">
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {categories.find(c => c.id === post.category)?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary-600">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          <span>{formatReadingTime(post.readingTime)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'Latest Posts'}
            </h2>
            <span className="text-gray-600">{posts.length} posts</span>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    {post.featuredImage && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col h-full">
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {categories.find(c => c.id === post.category)?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary-600">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{post.views}</span>
                          </div>
                          <span>{formatReadingTime(post.readingTime)}</span>
                        </div>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No posts available in this category'
                }
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default PlatformBlogPage;
