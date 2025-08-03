import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, HelpCircle, BookOpen } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import StoreSDK from '../../lib/store-sdk';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
  updatedAt: string;
}

const HelpPage: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [storeSDK] = useState(() => new StoreSDK());

  useEffect(() => {
    loadHelpArticles();
  }, []);

  const loadHelpArticles = async () => {
    if (!user?.storeId) return;
    
    try {
      setIsLoading(true);
      const articlesData = await storeSDK.get<HelpArticle>('help_articles');
      const storeArticles = articlesData.filter(article => article.storeId === user.storeId);
      setArticles(storeArticles);
    } catch (error) {
      console.error('Failed to load help articles:', error);
      toast.error('Failed to load help articles');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this help article?')) return;
    
    try {
      await storeSDK.delete('help_articles', articleId);
      setArticles(articles.filter(a => a.id !== articleId));
      toast.success('Help article deleted successfully');
    } catch (error) {
      toast.error('Failed to delete help article');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading help articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-1">Manage your store's help documentation</p>
        </div>
        <Button variant="primary" className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Help Articles */}
      {filteredArticles.length === 0 ? (
        <Card className="p-12 text-center">
          <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No help articles found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create helpful articles to assist your customers'
            }
          </p>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Article
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${getStatusColor(article.status)}
                  `}>
                    {article.status}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.content.substring(0, 120)}...
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {article.views} views
                </div>
                <div>
                  {new Date(article.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteArticle(article.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {articles.filter(a => a.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published Articles</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {articles.filter(a => a.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Draft Articles</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {articles.reduce((sum, a) => sum + a.views, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {articles.length > 0 
                ? Math.round(articles.reduce((sum, a) => sum + a.views, 0) / articles.length)
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">Avg. Views</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
