
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

type SeoProps = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  tags?: string[];
  locale?: string;
};

const Seo = ({ 
  title, 
  description, 
  keywords,
  image = 'https://imadlab.me/apple-touch-icon.png',
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Imad Eddine El Mouss',
  canonical,
  noindex = false,
  tags,
  locale = 'en_US',
}: SeoProps) => {
  const location = useLocation();
  const defaultTitle = 'Imadlab | Imad - Data Engineer, AI/ML Professional & Student Portfolio';
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const currentUrl = `https://imadlab.me${location.pathname}`;
  const canonicalUrl = canonical || currentUrl;

  const defaultKeywords = 'imadlab, imad eddine elmouss, data engineer, ai ml professional, machine learning, data science, portfolio, blog, projects, python, react, typescript';
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? "Article" : "WebPage",
    "headline": fullTitle,
    "description": description,
    "url": canonicalUrl,
    "image": image,
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://imadlab.me"
    },
    ...(tags && tags.length ? { "keywords": tags.join(', ') } : {}),
    ...(publishedTime && { "datePublished": publishedTime }),
    ...(modifiedTime && { "dateModified": modifiedTime }),
    ...(type === 'website' && {
      "mainEntity": {
        "@type": "Person",
        "name": "Imad Eddine El Mouss",
        "jobTitle": "Data Engineer & AI/ML Professional",
        "url": "https://imadlab.me",
        "sameAs": [
          "https://github.com/imadlab",
          "https://linkedin.com/in/imadlab"
        ]
      }
    })
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Imadlab" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {tags && tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@imadlab" />
      <meta name="twitter:creator" content="@imadlab" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default Seo;
