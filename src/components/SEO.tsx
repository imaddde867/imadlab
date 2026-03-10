import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { PRIMARY_NAV_ITEMS, getAbsoluteNavUrl } from '@/lib/navigation';

type Breadcrumb = {
  name: string;
  path?: string;
  url?: string;
};

type JsonLd = Record<string, unknown>;

type SEOProps = {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
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
  structuredData?: JsonLd | JsonLd[];
  additionalSchemas?: JsonLd[];
  twitterHandle?: string;
};

const SITE_URL = 'https://imadlab.com';
const SITE_NAME = 'Imadlab';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`;
const DEFAULT_AUTHOR = 'Imad Eddine El Mouss';
const DEFAULT_TWITTER = '@imadlab';
const GOOGLE_SITE_VERIFICATION =
  (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined)?.trim() || '';
const BING_SITE_VERIFICATION =
  (import.meta.env.VITE_BING_SITE_VERIFICATION as string | undefined)?.trim() || '';
const DEFAULT_KEYWORDS =
  'imadlab, imad eddine el mouss, research engineer, internal cto, applied research, industrial ai, multimodal data fusion, procedural knowledge extraction, privacy-by-design, auditable decision support, edge-to-cloud systems';

const toAbsoluteUrl = (value?: string) => {
  if (!value) return DEFAULT_IMAGE;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const toAbsolutePageUrl = (value?: string) => {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const normaliseDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const inferImageMimeType = (url: string) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) return 'image/jpeg';
  if (cleanUrl.endsWith('.png')) return 'image/png';
  if (cleanUrl.endsWith('.gif')) return 'image/gif';
  if (cleanUrl.endsWith('.webp')) return 'image/webp';
  if (cleanUrl.endsWith('.avif')) return 'image/avif';
  return undefined;
};

const Seo = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  url,
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
  structuredData,
  additionalSchemas = [],
  twitterHandle,
}: SEOProps) => {
  const location = useLocation();
  const defaultTitle = `${SITE_NAME} | Research Engineer & Internal CTO`;
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const currentUrl = `${SITE_URL}${location.pathname}`;
  const canonicalUrl = toAbsolutePageUrl(url || canonical) || currentUrl;
  const ogImage = toAbsoluteUrl(image);
  const ogImageType = inferImageMimeType(ogImage);
  const isDefaultOgImage = ogImage === DEFAULT_IMAGE;
  const twitter = twitterHandle || DEFAULT_TWITTER;

  const keywordsContent = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;
  const robotsDirectives = noindex
    ? 'noindex, nofollow'
    : nofollow
      ? 'index, nofollow'
      : 'index, follow';
  const isoPublished = normaliseDate(publishedTime);
  const isoModified = normaliseDate(modifiedTime) || isoPublished;

  const baseSchemaType =
    schemaType ||
    (type === 'article' ? 'BlogPosting' : type === 'project' ? 'CreativeWork' : 'WebPage');

  const schemas = useMemo(() => {
    const baseSchema: JsonLd = {
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
          'https://www.linkedin.com/in/imad-eddine-e-986741262',
        ],
      },
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
          'https://www.linkedin.com/in/imad-eddine-e-986741262',
        ],
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
        url: SITE_URL,
      };
    }

    const schemaList: JsonLd[] = [baseSchema];

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
            url: getAbsoluteNavUrl(SITE_URL, item.path),
          },
        })),
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
            : `${SITE_URL}${crumb.path && crumb.path.startsWith('/') ? crumb.path : `/${crumb.path ?? ''}`}`,
        })),
      });
    }

    const normalizedStructuredData: JsonLd[] = structuredData
      ? Array.isArray(structuredData)
        ? structuredData
        : [structuredData]
      : [];

    return [...schemaList, ...normalizedStructuredData, ...additionalSchemas];
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
    schemaType,
    structuredData,
    tags,
    type,
    isoModified,
    isoPublished,
  ]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsContent} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsDirectives} />
      {GOOGLE_SITE_VERIFICATION && (
        <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
      )}
      {BING_SITE_VERIFICATION && <meta name="msvalidate.01" content={BING_SITE_VERIFICATION} />}
      <link rel="canonical" href={canonicalUrl} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Imadlab Blog RSS Feed"
        href={`${SITE_URL}/feed.xml`}
      />
      <link
        rel="alternate"
        type="application/feed+json"
        title="Imadlab Blog JSON Feed"
        href={`${SITE_URL}/feed.json`}
      />
      <link rel="manifest" href="/site.webmanifest" />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta
        property="og:type"
        content={type === 'article' ? 'article' : type === 'project' ? 'website' : type}
      />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      {ogImageType && <meta property="og:image:type" content={ogImageType} />}
      {isDefaultOgImage && <meta property="og:image:width" content="1200" />}
      {isDefaultOgImage && <meta property="og:image:height" content="630" />}
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
      <meta name="twitter:site" content={twitter} />
      <meta name="twitter:creator" content={twitter} />
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
