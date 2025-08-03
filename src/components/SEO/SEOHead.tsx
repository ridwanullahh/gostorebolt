import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  sku?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'GoStore - Create Your Online Store',
  description = 'Build and manage your online store with GoStore. Powerful e-commerce platform with beautiful themes, secure payments, and advanced analytics.',
  keywords = ['ecommerce', 'online store', 'shopping', 'business'],
  image = '/images/og-default.jpg',
  url = '',
  type = 'website',
  siteName = 'GoStore',
  author,
  publishedTime,
  modifiedTime,
  price,
  currency = 'USD',
  availability,
  brand,
  category,
  sku,
  noIndex = false,
  canonicalUrl
}) => {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const fullImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Product specific */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}
      {type === 'product' && availability && (
        <meta property="product:availability" content={availability} />
      )}
      {type === 'product' && brand && (
        <meta property="product:brand" content={brand} />
      )}
      {type === 'product' && category && (
        <meta property="product:category" content={category} />
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Structured Data for Products */}
      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": title,
            "description": description,
            "image": fullImage,
            "url": fullUrl,
            ...(brand && { "brand": { "@type": "Brand", "name": brand } }),
            ...(sku && { "sku": sku }),
            ...(price && {
              "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": currency,
                "availability": availability === 'in stock' 
                  ? "https://schema.org/InStock"
                  : availability === 'out of stock'
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/PreOrder",
                "url": fullUrl
              }
            })
          })}
        </script>
      )}
      
      {/* Structured Data for Website */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "description": description,
            "url": window.location.origin,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${window.location.origin}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      )}
      
      {/* Structured Data for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteName,
          "url": window.location.origin,
          "logo": `${window.location.origin}/images/logo.png`,
          "sameAs": [
            // Add social media links here
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;
