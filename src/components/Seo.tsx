import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS, getAbsoluteNavUrl } from '@/lib/navigation';

type Breadcrumb = {
  name: string;
  path?: string;
  url?: string;
};

type SeoProps = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'project';
  schemaType?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  tags?: string[];
  locale?: string;
  breadcrumbs?: Breadcrumb[];
  additionalSchemas?: Array<Record<string, unknown>>;
};

const SITE_URL = 'https://imadlab.me';
const SITE_NAME = 'Imadlab';
const DEFAULT_IMAGE = `${SITE_URL}/opengraph-image.png`;
const DEFAULT_AUTHOR = 'Imad Eddine El Mouss';
const DEFAULT_KEYWORDS = 'imadlab, imad eddine elmouss, data engineer, ai ml professional, machine learning, data science, portfolio, blog, projects, python, react, typescript';

const toAbsoluteUrl = (url: string) => {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const normaliseDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const Seo = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  type = 'website',
  schemaType,
  publishedTime,
  modifiedTime,
  author = DEFAULT_AUTHOR,
  canonical,
  noindex = false,
  nofollow = false,
  tags,
  locale = 'en_US',
  breadcrumbs,
  additionalSchemas = [],
}: SeoProps) => {
  const location = useLocation();
  const defaultTitle = `${SITE_NAME} | Data Engineer & AI/ML Portfolio`;
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const currentUrl = `${SITE_URL}${location.pathname}${location.search || ''}`;
  const canonicalUrl = canonical || currentUrl;
  const ogImage = toAbsoluteUrl(image || DEFAULT_IMAGE);

  const keywordsContent = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;
  const robotsDirectives = noindex ? 'noindex, nofollow' : nofollow ? 'index, nofollow' : 'index, follow';
  const isoPublished = normaliseDate(publishedTime);
  const isoModified = normaliseDate(modifiedTime) || isoPublished;

  const baseSchemaType =
    schemaType ||
    (type === 'article'
      ? 'BlogPosting'
      : type === 'project'
      ? 'CreativeWork'
      : 'WebPage');

  const schemas = useMemo(() => {
    const baseSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': baseSchemaType,
      name: fullTitle,
      headline: fullTitle,
      description,
      url: canonicalUrl,
      inLanguage: locale.replace('_', '-'),
      image: ogImage,
      author: {
        '@type': 'Person',
        name: author,
        url: `${SITE_URL}/about`,
        sameAs: [
          'https://github.com/imaddde867',
          'https://www.linkedin.com/in/imad-eddine-e-986741262'
        ]
      }
    };

    if (type === 'article') {
      baseSchema.articleSection = tags && tags.length ? tags[0] : 'Technology';
      baseSchema.datePublished = isoPublished;
      baseSchema.dateModified = isoModified;
      baseSchema.mainEntityOfPage = canonicalUrl;
      baseSchema.publisher = {
        '@type': 'Person',
        name: author,
        url: `${SITE_URL}/about`,
        sameAs: [
          'https://github.com/imaddde867',
          'https://www.linkedin.com/in/imad-eddine-e-986741262'
        ]
      };
      if (tags && tags.length) {
        baseSchema.keywords = tags.join(', ');
      }
    } else if (type === 'project') {
      baseSchema['@type'] = schemaType || 'CreativeWork';
      if (tags && tags.length) {
        baseSchema.about = tags.map((tag) => ({ '@type': 'Thing', name: tag }));
      }
      baseSchema.datePublished = isoPublished;
      baseSchema.dateModified = isoModified;
    } else {
      baseSchema['@type'] = schemaType || 'WebPage';
      baseSchema.name = fullTitle;
      baseSchema.isPartOf = {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL
      };
    }

    const schemaList: Array<Record<string, unknown>> = [baseSchema];

    if (PRIMARY_NAV_ITEMS.length) {
      schemaList.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Primary navigation',
        itemListElement: PRIMARY_NAV_ITEMS.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SiteNavigationElement',
            name: item.label,
            url: getAbsoluteNavUrl(SITE_URL, item.path)
          }
        }))
      });
    }

    if (breadcrumbs && breadcrumbs.length) {
      schemaList.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url
            ? crumb.url
            : `${SITE_URL}${crumb.path && crumb.path.startsWith('/') ? crumb.path : `/${crumb.path ?? ''}`}`
        }))
      });
    }

    return [...schemaList, ...additionalSchemas];
  }, [
    additionalSchemas,
    author,
    baseSchemaType,
    breadcrumbs,
    canonicalUrl,
    description,
    fullTitle,
    locale,
    ogImage,
    PRIMARY_NAV_ITEMS,
    schemaType,
    tags,
    type,
    isoModified,
    isoPublished
  ]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsContent} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsDirectives} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" type="application/rss+xml" title="Imadlab Blog RSS Feed" href={`${SITE_URL}/feed.xml`} />
      <link rel="alternate" type="application/feed+json" title="Imadlab Blog JSON Feed" href={`${SITE_URL}/feed.json`} />
      <link rel="manifest" href="/site.webmanifest" />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={SITE_NAME} />
      {isoPublished && <meta property="article:published_time" content={isoPublished} />}
      {isoModified && <meta property="article:modified_time" content={isoModified} />}
      {author && <meta property="article:author" content={author} />}
      {tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@imadlab" />
      <meta name="twitter:creator" content="@imadlab" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}

      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};

export default Seo;
