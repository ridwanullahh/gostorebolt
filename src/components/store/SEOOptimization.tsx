import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, TrendingUp, Globe, Target, BarChart3,
  CheckCircle, AlertCircle, XCircle, Lightbulb,
  ExternalLink, Copy, Zap, Eye
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Product, Store } from '../../lib/store-sdk';
import ChutesAI from '../../lib/chutes-ai';
import { config } from '../../lib/config';
import toast from 'react-hot-toast';

interface SEOOptimizationProps {
  store: Store;
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onUpdateStore: (updates: Partial<Store>) => void;
}

interface SEOScore {
  overall: number;
  technical: number;
  content: number;
  performance: number;
}

interface SEOIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  fix: string;
  productId?: string;
}

const SEOOptimization: React.FC<SEOOptimizationProps> = ({
  store,
  products,
  onUpdateProduct,
  onUpdateStore
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [seoScore, setSeoScore] = useState<SEOScore>({ overall: 0, technical: 0, content: 0, performance: 0 });
  const [seoIssues, setSeoIssues] = useState<SEOIssue[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const chatAI = new ChutesAI({ apiToken: config.chutesAI.apiToken });

  useEffect(() => {
    analyzeSEO();
  }, [store, products]);

  const analyzeSEO = () => {
    const issues: SEOIssue[] = [];
    let technicalScore = 100;
    let contentScore = 100;
    let performanceScore = 100;

    // Store-level SEO analysis
    if (!store.settings?.seo?.title || store.settings.seo.title.length < 30) {
      issues.push({
        id: 'store-title',
        type: 'error',
        title: 'Store title too short',
        description: 'Your store title should be 30-60 characters for optimal SEO',
        impact: 'high',
        fix: 'Add a descriptive title that includes your main keywords'
      });
      contentScore -= 15;
    }

    if (!store.settings?.seo?.description || store.settings.seo.description.length < 120) {
      issues.push({
        id: 'store-description',
        type: 'error',
        title: 'Store description too short',
        description: 'Your store description should be 120-160 characters',
        impact: 'high',
        fix: 'Write a compelling description that summarizes your store'
      });
      contentScore -= 15;
    }

    if (!store.settings?.seo?.keywords || store.settings.seo.keywords.length === 0) {
      issues.push({
        id: 'store-keywords',
        type: 'warning',
        title: 'No store keywords defined',
        description: 'Keywords help search engines understand your store content',
        impact: 'medium',
        fix: 'Add relevant keywords for your store and products'
      });
      contentScore -= 10;
    }

    // Product-level SEO analysis
    products.forEach(product => {
      if (!product.seo?.title || product.seo.title.length < 30) {
        issues.push({
          id: `product-title-${product.id}`,
          type: 'warning',
          title: `Product "${product.name}" needs SEO title`,
          description: 'Product SEO titles should be 30-60 characters',
          impact: 'medium',
          fix: 'Add an SEO-optimized title for this product',
          productId: product.id
        });
        contentScore -= 5;
      }

      if (!product.seo?.description || product.seo.description.length < 120) {
        issues.push({
          id: `product-description-${product.id}`,
          type: 'warning',
          title: `Product "${product.name}" needs SEO description`,
          description: 'Product descriptions should be 120-160 characters',
          impact: 'medium',
          fix: 'Add an SEO-optimized description for this product',
          productId: product.id
        });
        contentScore -= 5;
      }

      if (!product.images || product.images.length === 0) {
        issues.push({
          id: `product-images-${product.id}`,
          type: 'error',
          title: `Product "${product.name}" has no images`,
          description: 'Products without images perform poorly in search results',
          impact: 'high',
          fix: 'Add high-quality images with descriptive alt text',
          productId: product.id
        });
        performanceScore -= 10;
      }

      if (product.images?.some(img => !img.alt)) {
        issues.push({
          id: `product-alt-text-${product.id}`,
          type: 'warning',
          title: `Product "${product.name}" missing alt text`,
          description: 'Images without alt text are not accessible to search engines',
          impact: 'medium',
          fix: 'Add descriptive alt text to all product images',
          productId: product.id
        });
        technicalScore -= 5;
      }
    });

    // Technical SEO checks
    if (!store.settings?.branding?.logo) {
      issues.push({
        id: 'store-logo',
        type: 'warning',
        title: 'No store logo',
        description: 'A logo helps with brand recognition in search results',
        impact: 'medium',
        fix: 'Upload a high-quality logo for your store'
      });
      technicalScore -= 10;
    }

    setSeoIssues(issues);
    setSeoScore({
      technical: Math.max(0, technicalScore),
      content: Math.max(0, contentScore),
      performance: Math.max(0, performanceScore),
      overall: Math.max(0, Math.round((technicalScore + contentScore + performanceScore) / 3))
    });
  };

  const generateKeywords = async (productId?: string) => {
    setIsGeneratingKeywords(true);
    try {
      if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const keywords = await chatAI.generateSEOKeywords(
            product.name,
            product.categories[0] || 'general'
          );
          
          onUpdateProduct(productId, {
            seo: {
              ...product.seo,
              keywords
            }
          });
          
          toast.success('Keywords generated successfully!');
        }
      } else {
        // Generate store keywords
        const keywords = await chatAI.generateSEOKeywords(
          store.name,
          'e-commerce store'
        );
        
        onUpdateStore({
          settings: {
            ...store.settings,
            seo: {
              ...store.settings?.seo,
              keywords
            }
          }
        });
        
        toast.success('Store keywords generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate keywords');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const optimizeContent = async (productId?: string) => {
    setIsOptimizing(true);
    try {
      if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const [title, description] = await Promise.all([
            chatAI.generateProductName(product.description),
            chatAI.generateProductDescription(product.name, product.categories)
          ]);
          
          onUpdateProduct(productId, {
            seo: {
              ...product.seo,
              title: title.slice(0, 60),
              description: description.slice(0, 160)
            }
          });
          
          toast.success('Product SEO optimized!');
        }
      } else {
        // Optimize store SEO
        const description = `${store.name} - Premium online store offering quality products with fast shipping and excellent customer service. Shop now for the best deals!`;
        
        onUpdateStore({
          settings: {
            ...store.settings,
            seo: {
              ...store.settings?.seo,
              title: `${store.name} - Premium Online Store`,
              description: description.slice(0, 160)
            }
          }
        });
        
        toast.success('Store SEO optimized!');
      }
    } catch (error) {
      toast.error('Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* SEO Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`p-6 text-center ${getScoreBackground(seoScore.overall)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(seoScore.overall)} mb-2`}>
            {seoScore.overall}
          </div>
          <div className="text-sm font-medium text-gray-700">Overall Score</div>
        </Card>
        
        <Card className={`p-6 text-center ${getScoreBackground(seoScore.technical)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(seoScore.technical)} mb-2`}>
            {seoScore.technical}
          </div>
          <div className="text-sm font-medium text-gray-700">Technical SEO</div>
        </Card>
        
        <Card className={`p-6 text-center ${getScoreBackground(seoScore.content)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(seoScore.content)} mb-2`}>
            {seoScore.content}
          </div>
          <div className="text-sm font-medium text-gray-700">Content SEO</div>
        </Card>
        
        <Card className={`p-6 text-center ${getScoreBackground(seoScore.performance)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(seoScore.performance)} mb-2`}>
            {seoScore.performance}
          </div>
          <div className="text-sm font-medium text-gray-700">Performance</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Quick SEO Actions</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => generateKeywords()}
              isLoading={isGeneratingKeywords}
              className="h-20 flex-col"
            >
              <Zap className="h-6 w-6 mb-2" />
              Generate Store Keywords
            </Button>
            
            <Button
              variant="outline"
              onClick={() => optimizeContent()}
              isLoading={isOptimizing}
              className="h-20 flex-col"
            >
              <Target className="h-6 w-6 mb-2" />
              Optimize Store SEO
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setActiveTab('issues')}
              className="h-20 flex-col"
            >
              <AlertCircle className="h-6 w-6 mb-2" />
              Fix SEO Issues ({seoIssues.length})
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Top Issues */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Top SEO Issues</h3>
        </Card.Header>
        <Card.Content className="p-0">
          <div className="divide-y divide-gray-200">
            {seoIssues.slice(0, 5).map((issue) => (
              <div key={issue.id} className="p-4 flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  issue.type === 'error' ? 'bg-red-100' :
                  issue.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {issue.type === 'error' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : issue.type === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{issue.title}</h4>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Fix: {issue.fix}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  issue.impact === 'high' ? 'bg-red-100 text-red-800' :
                  issue.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {issue.impact} impact
                </span>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Store SEO Settings</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Title (30-60 characters)
              </label>
              <Input
                value={store.settings?.seo?.title || ''}
                onChange={(e) => onUpdateStore({
                  settings: {
                    ...store.settings,
                    seo: {
                      ...store.settings?.seo,
                      title: e.target.value
                    }
                  }
                })}
                placeholder="Enter your store title"
                maxLength={60}
              />
              <div className="text-xs text-gray-500 mt-1">
                {(store.settings?.seo?.title || '').length}/60 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description (120-160 characters)
              </label>
              <textarea
                value={store.settings?.seo?.description || ''}
                onChange={(e) => onUpdateStore({
                  settings: {
                    ...store.settings,
                    seo: {
                      ...store.settings?.seo,
                      description: e.target.value
                    }
                  }
                })}
                placeholder="Enter your store description"
                maxLength={160}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                {(store.settings?.seo?.description || '').length}/160 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <div className="flex space-x-2">
                <Input
                  value={(store.settings?.seo?.keywords || []).join(', ')}
                  onChange={(e) => onUpdateStore({
                    settings: {
                      ...store.settings,
                      seo: {
                        ...store.settings?.seo,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    }
                  })}
                  placeholder="Enter keywords separated by commas"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => generateKeywords()}
                  isLoading={isGeneratingKeywords}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={() => optimizeContent()}
                isLoading={isOptimizing}
              >
                <Target className="h-4 w-4 mr-2" />
                Auto-Optimize
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );

  const renderProductSEO = () => (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Product SEO Optimization</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 9).map((product) => (
              <Card
                key={product.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedProduct?.id === product.id ? 'ring-2 ring-primary-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.images[0]?.url || '/api/placeholder/40/40'}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {product.seo?.title ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {product.seo?.title ? 'Optimized' : 'Needs SEO'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Selected Product SEO */}
      {selectedProduct && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              SEO for "{selectedProduct.name}"
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title (30-60 characters)
                </label>
                <Input
                  value={selectedProduct.seo?.title || ''}
                  onChange={(e) => onUpdateProduct(selectedProduct.id, {
                    seo: {
                      ...selectedProduct.seo,
                      title: e.target.value
                    }
                  })}
                  placeholder="Enter SEO title for this product"
                  maxLength={60}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(selectedProduct.seo?.title || '').length}/60 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description (120-160 characters)
                </label>
                <textarea
                  value={selectedProduct.seo?.description || ''}
                  onChange={(e) => onUpdateProduct(selectedProduct.id, {
                    seo: {
                      ...selectedProduct.seo,
                      description: e.target.value
                    }
                  })}
                  placeholder="Enter SEO description for this product"
                  maxLength={160}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(selectedProduct.seo?.description || '').length}/160 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={(selectedProduct.seo?.keywords || []).join(', ')}
                    onChange={(e) => onUpdateProduct(selectedProduct.id, {
                      seo: {
                        ...selectedProduct.seo,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    })}
                    placeholder="Enter keywords separated by commas"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => generateKeywords(selectedProduct.id)}
                    isLoading={isGeneratingKeywords}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => optimizeContent(selectedProduct.id)}
                  isLoading={isOptimizing}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Auto-Optimize
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          SEO Issues ({seoIssues.length})
        </h3>
        <Button variant="outline" onClick={analyzeSEO}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Re-analyze
        </Button>
      </div>

      {seoIssues.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SEO Issues Found!</h3>
          <p className="text-gray-600">Your store is well-optimized for search engines.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {seoIssues.map((issue) => (
            <Card key={issue.id}>
              <Card.Content className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${
                    issue.type === 'error' ? 'bg-red-100' :
                    issue.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {issue.type === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : issue.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        issue.impact === 'high' ? 'bg-red-100 text-red-800' :
                        issue.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.impact} impact
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{issue.description}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>How to fix:</strong> {issue.fix}
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      {issue.productId ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            const product = products.find(p => p.id === issue.productId);
                            if (product) {
                              setSelectedProduct(product);
                              setActiveTab('products');
                            }
                          }}
                        >
                          Fix Product SEO
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveTab('store')}
                        >
                          Fix Store SEO
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'store', name: 'Store SEO', icon: Globe },
    { id: 'products', name: 'Product SEO', icon: Search },
    { id: 'issues', name: 'Issues', icon: AlertCircle, badge: seoIssues.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'store' && renderStoreSettings()}
        {activeTab === 'products' && renderProductSEO()}
        {activeTab === 'issues' && renderIssues()}
      </motion.div>
    </div>
  );
};

export default SEOOptimization;