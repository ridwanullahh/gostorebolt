import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, HelpCircle, BookOpen, MessageCircle, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import StoreLayout from '../../components/store/StoreLayout';
import StoreSDK from '../../lib/store-sdk';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

interface HelpArticle {
  id: string;
  storeId: string;
  title: string;
  content: string;
  slug: string;
  categoryId?: string;
  status: 'published' | 'draft';
  views: number;
  createdAt: string;
}

const StoreHelpPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    loadHelpArticles();
  }, [storeSlug]);

  const loadHelpArticles = async () => {
    if (!storeSlug) return;
    
    try {
      setIsLoading(true);
      const store = await storeSDK.getStoreBySlug(storeSlug);
      if (!store) return;
      
      const allArticles = await storeSDK.get<HelpArticle>('help_articles');
      const storeArticles = allArticles.filter(article => 
        article.storeId === store.id && article.status === 'published'
      );
      setArticles(storeArticles);
    } catch (error) {
      console.error('Failed to load help articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularArticles = articles
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading help center...</p>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle className="h-8 w-8 text-primary-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Help Center
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Find answers to your questions and get the help you need
          </motion.p>
        </div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Articles</h3>
            <p className="text-gray-600 mb-4">Find detailed guides and tutorials</p>
            <Button variant="outline" size="sm">
              View All Articles
            </Button>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-600 mb-4">Get help from our support team</p>
            <Link to={`/${storeSlug}/contact`}>
              <Button variant="outline" size="sm">
                Contact Us
              </Button>
            </Link>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">Speak directly with our team</p>
            <Button variant="outline" size="sm">
              View Phone Numbers
            </Button>
          </Card>
        </motion.div>

        {/* Popular Articles */}
        {popularArticles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {article.views} views
                      </span>
                      <Link
                        to={`/${storeSlug}/help/${article.slug}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Read More →
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Articles */}
        {filteredArticles.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {searchTerm ? 'Search Results' : 'All Articles'}
            </h2>
            <div className="space-y-4">
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {article.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{article.views} views</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link
                        to={`/${storeSlug}/help/${article.slug}`}
                        className="ml-4 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Read →
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <Card className="p-12 text-center">
            <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or browse our popular articles above'
                : 'Help articles will be available soon'
              }
            </p>
            <Link to={`/${storeSlug}/contact`}>
              <Button variant="primary">
                Contact Support Instead
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreHelpPage;
