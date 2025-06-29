import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Facebook, Instagram, Chrome, Send,
  Share2, Copy, ExternalLink, QrCode, Settings
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { Product, Store } from '../../lib/store-sdk';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

interface SocialSellingProps {
  store: Store;
  products: Product[];
}

const SocialSelling: React.FC<SocialSellingProps> = ({ store, products }) => {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const socialPlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      description: 'Engage customers in real-time via WhatsApp'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      description: 'Sync products with your Facebook business page'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Showcase products visually on Instagram'
    },
    {
      id: 'google',
      name: 'Google Shopping',
      icon: Chrome,
      color: 'bg-red-500',
      description: 'Display products in Google Shopping results'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500',
      description: 'Sell directly via customizable Telegram bot'
    }
  ];

  const generateWhatsAppLink = (product: Product, message?: string) => {
    const baseMessage = message || `Hi! I'm interested in ${product.name} from ${store.name}. 

Price: ${formatCurrency(product.salePrice || product.price)}

${product.shortDescription || product.description}

Store: https://gostore.top/${store.slug}`;

    const encodedMessage = encodeURIComponent(baseMessage);
    return `https://wa.me/?text=${encodedMessage}`;
  };

  const generateFacebookShare = (product: Product) => {
    const url = `https://gostore.top/${store.slug}/product/${product.slug}`;
    const text = `Check out ${product.name} at ${store.name}!`;
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
  };

  const generateInstagramPost = (product: Product) => {
    const hashtags = ['#' + store.name.replace(/\s+/g, ''), '#ecommerce', '#shopping', ...product.categories.map(cat => '#' + cat.replace(/\s+/g, ''))];
    return {
      caption: `${product.name} 

${product.shortDescription || product.description}

💰 ${formatCurrency(product.salePrice || product.price)}

Shop now: gostore.top/${store.slug}

${hashtags.join(' ')}`,
      image: product.images[0]?.url
    };
  };

  const generateGoogleShoppingFeed = () => {
    const feed = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      link: `https://gostore.top/${store.slug}/product/${product.slug}`,
      image_link: product.images[0]?.url,
      price: `${product.salePrice || product.price} USD`,
      availability: product.trackQuantity && product.quantity ? 
        (product.quantity > 0 ? 'in stock' : 'out of stock') : 'in stock',
      brand: store.name,
      condition: 'new',
      google_product_category: product.categories[0] || 'General'
    }));

    return feed;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = (platform: string, product: Product) => {
    setSelectedProduct(product);
    
    switch (platform) {
      case 'whatsapp':
        window.open(generateWhatsAppLink(product, customMessage), '_blank');
        break;
      case 'facebook':
        window.open(generateFacebookShare(product), '_blank');
        break;
      case 'instagram':
        setIsShareModalOpen(true);
        break;
      case 'google':
        // Generate and download Google Shopping feed
        const feed = generateGoogleShoppingFeed();
        const blob = new Blob([JSON.stringify(feed, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${store.slug}-google-shopping-feed.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Google Shopping feed downloaded!');
        break;
      case 'telegram':
        // Generate Telegram bot setup instructions
        setIsShareModalOpen(true);
        break;
    }
  };

  const renderPlatformContent = () => {
    const platform = socialPlatforms.find(p => p.id === activeTab);
    if (!platform) return null;

    switch (activeTab) {
      case 'whatsapp':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">WhatsApp Business Integration</h3>
              <p className="text-green-700 text-sm">
                Share products directly via WhatsApp with customers. Each product link includes product details and store information.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message Template
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a custom message to include with product shares..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.slice(0, 6).map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.images[0]?.url || '/api/placeholder/60/60'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600">{formatCurrency(product.salePrice || product.price)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('whatsapp', product)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Facebook Shop Integration</h3>
              <p className="text-blue-700 text-sm">
                Sync your products with Facebook Shop and share individual products on your business page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Setup Facebook Shop</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Go to Facebook Business Manager</li>
                  <li>2. Create a Facebook Shop</li>
                  <li>3. Upload product catalog</li>
                  <li>4. Configure payment settings</li>
                </ol>
                <Button variant="primary" size="sm" className="mt-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Facebook Business
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Product Catalog</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download your product catalog in Facebook-compatible format.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const catalog = products.map(p => ({
                      id: p.id,
                      title: p.name,
                      description: p.description,
                      availability: 'in stock',
                      condition: 'new',
                      price: `${p.salePrice || p.price} USD`,
                      link: `https://gostore.top/${store.slug}/product/${p.slug}`,
                      image_link: p.images[0]?.url,
                      brand: store.name
                    }));
                    
                    const csv = [
                      Object.keys(catalog[0]).join(','),
                      ...catalog.map(item => Object.values(item).join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${store.slug}-facebook-catalog.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Catalog
                </Button>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Share Individual Products</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images[0]?.url || '/api/placeholder/60/60'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">{product.name}</h5>
                        <p className="text-sm text-gray-600">{formatCurrency(product.salePrice || product.price)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('facebook', product)}
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Instagram Shopping</h3>
              <p className="text-purple-700 text-sm">
                Tag products in your Instagram posts and stories to drive sales directly from Instagram.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Setup Instagram Shopping</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Convert to Instagram Business Account</li>
                  <li>2. Connect Facebook Shop</li>
                  <li>3. Submit for review</li>
                  <li>4. Start tagging products</li>
                </ol>
                <Button variant="primary" size="sm" className="mt-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Instagram Business
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Content Ideas</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Product lifestyle photos</li>
                  <li>• Behind-the-scenes content</li>
                  <li>• Customer testimonials</li>
                  <li>• Product tutorials</li>
                  <li>• User-generated content</li>
                </ul>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Ready-to-Post Content</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={product.images[0]?.url || '/api/placeholder/300/300'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-2">{product.name}</h5>
                    <p className="text-sm text-gray-600 mb-3">{formatCurrency(product.salePrice || product.price)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('instagram', product)}
                      className="w-full"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Generate Post
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'google':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Google Shopping Integration</h3>
              <p className="text-red-700 text-sm">
                Display your products in Google Shopping results and reach customers actively searching for products like yours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Google Merchant Center</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Create Google Merchant Center account</li>
                  <li>2. Verify and claim your website</li>
                  <li>3. Upload product data feed</li>
                  <li>4. Link to Google Ads (optional)</li>
                </ol>
                <Button variant="primary" size="sm" className="mt-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Merchant Center
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Product Feed</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download your product feed in Google Shopping format.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('google', products[0])}
                    className="w-full"
                  >
                    Download JSON Feed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const feed = generateGoogleShoppingFeed();
                      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${store.name}</title>
    <link>https://gostore.top/${store.slug}</link>
    <description>Products from ${store.name}</description>
    ${feed.map(item => `
    <item>
      <g:id>${item.id}</g:id>
      <g:title>${item.title}</g:title>
      <g:description>${item.description}</g:description>
      <g:link>${item.link}</g:link>
      <g:image_link>${item.image_link}</g:image_link>
      <g:price>${item.price}</g:price>
      <g:availability>${item.availability}</g:availability>
      <g:brand>${item.brand}</g:brand>
      <g:condition>${item.condition}</g:condition>
    </item>`).join('')}
  </channel>
</rss>`;
                      
                      const blob = new Blob([xml], { type: 'application/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${store.slug}-google-shopping-feed.xml`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full"
                  >
                    Download XML Feed
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Feed Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.images.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">With Images</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'telegram':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Telegram Bot Integration</h3>
              <p className="text-blue-700 text-sm">
                Create a custom Telegram bot for your store to handle orders and customer inquiries directly in Telegram.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Bot Setup Instructions</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Message @BotFather on Telegram</li>
                  <li>2. Create new bot with /newbot</li>
                  <li>3. Set bot name and username</li>
                  <li>4. Get your bot token</li>
                  <li>5. Configure webhook URL</li>
                </ol>
                <Button variant="primary" size="sm" className="mt-4">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Telegram
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Bot Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bot Token
                    </label>
                    <Input
                      placeholder="Enter your Telegram bot token"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL
                    </label>
                    <Input
                      value={`https://gostore.top/api/telegram/${store.slug}`}
                      readOnly
                      className="text-sm bg-gray-50"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Bot
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Bot Commands</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Customer Commands</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>/start - Welcome message</li>
                    <li>/products - Browse products</li>
                    <li>/search - Search products</li>
                    <li>/cart - View cart</li>
                    <li>/orders - Order history</li>
                    <li>/help - Get help</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Admin Commands</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>/admin - Admin panel</li>
                    <li>/orders - Manage orders</li>
                    <li>/customers - Customer list</li>
                    <li>/analytics - View stats</li>
                    <li>/broadcast - Send message</li>
                    <li>/settings - Bot settings</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {socialPlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setActiveTab(platform.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === platform.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <platform.icon className="h-5 w-5" />
                <span>{platform.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Platform Content */}
      <div className="min-h-96">
        {renderPlatformContent()}
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`Share on ${socialPlatforms.find(p => p.id === activeTab)?.name}`}
      >
        {selectedProduct && activeTab === 'instagram' && (
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedProduct.images[0]?.url || '/api/placeholder/400/400'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Caption
              </label>
              <textarea
                value={generateInstagramPost(selectedProduct).caption}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32 resize-none bg-gray-50"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generateInstagramPost(selectedProduct).caption)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Caption
              </Button>
              <Button
                variant="primary"
                onClick={() => window.open('https://www.instagram.com/', '_blank')}
                className="flex-1"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Open Instagram
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'telegram' && (
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Telegram Bot Setup
              </h3>
              <p className="text-gray-600">
                Follow the instructions to set up your Telegram bot for automated customer service and sales.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Bot Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated product catalog</li>
                <li>• Order processing</li>
                <li>• Customer support</li>
                <li>• Payment integration</li>
                <li>• Order tracking</li>
                <li>• Broadcast messaging</li>
              </ul>
            </div>

            <Button variant="primary" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Setup Telegram Bot
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SocialSelling;