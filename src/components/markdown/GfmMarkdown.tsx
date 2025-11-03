import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  OlHTMLAttributes,
  VideoHTMLAttributes,
} from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkGithub from 'remark-github';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import GithubSlugger from 'github-slugger';
import type { Schema } from 'hast-util-sanitize';
import { defaultSchema } from 'hast-util-sanitize';
import { Hash } from 'lucide-react';
import clsx from 'clsx';
import type { Literal, Parent } from 'unist';
import type { Heading, FootnoteDefinition, FootnoteReference } from 'mdast';
import { CodeBlock } from './components/CodeBlock';
import { InlineCode } from './components/InlineCode';
import { Paragraph } from './components/Paragraph';
import { Blockquote } from './components/Blockquote';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
} from './components/Table';
import { ListItem } from './components/ListItem';
import { ThematicBreak } from './components/ThematicBreak';
import { MathRenderer } from './components/MathRenderer';
import { MermaidBlock } from './components/MermaidBlock';

type RepositoryContext = {
  owner: string;
  name: string;
  defaultBranch?: string;
  baseUrl?: string;
};

type MarkdownConfig = {
  showToc?: boolean;
  tocDepth?: 2 | 3 | 4;
  enableMath?: boolean;
  enableMermaid?: boolean;
  sanitizeHtml?: boolean;
  maxDiagramSizeKB?: number;
};

type GfmMarkdownProps = {
  source: string;
  className?: string;
  baseUrl?: string;
  repository?: RepositoryContext;
  config?: MarkdownConfig;
};

type HeadingEntry = {
  id: string;
  text: string;
  level: number;
  position: number;
};

const defaultConfig: Required<MarkdownConfig> = {
  showToc: false,
  tocDepth: 3,
  enableMath: true,
  enableMermaid: true,
  sanitizeHtml: true,
  maxDiagramSizeKB: 512,
};

const isAbsoluteUrl = (url: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);

const mathSchemaExtensions: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    details: [...(defaultSchema.attributes?.details ?? []), 'open'],
    video: [
      ...(defaultSchema.attributes?.video ?? []),
      'src',
      'controls',
      'autoplay',
      'loop',
      'muted',
      'playsInline',
      'poster',
      'preload',
      'height',
      'width',
    ],
    source: [
      ...(defaultSchema.attributes?.source ?? []),
      'src',
      'type',
    ],
    audio: [
      ...(defaultSchema.attributes?.audio ?? []),
      'controls',
      'autoplay',
      'loop',
      'muted',
      'preload',
    ],
    track: ['default', 'kind', 'label', 'srcLang', 'src'],
    figure: [...(defaultSchema.attributes?.figure ?? []), 'role'],
    figcaption: defaultSchema.attributes?.figcaption ?? [],
  },
  tagNames: Array.from(
    new Set([
      ...(defaultSchema.tagNames ?? []),
      'details',
      'summary',
      'figure',
      'figcaption',
      'video',
      'audio',
      'track',
    ])
  ),
  protocols: {
    ...defaultSchema.protocols,
    src: ['http', 'https', 'data'],
    poster: ['http', 'https'],
  },
};

const SluggerContext = createContext<GithubSlugger | null>(null);
const HeadingContext = createContext<{
  registerHeading: (heading: HeadingEntry) => void;
  tocDepth: number;
}>({
  registerHeading: () => {},
  tocDepth: 3,
});

const AssetContext = createContext<{
  resolveUrl: (href?: string | null) => string | undefined;
  repository?: RepositoryContext;
}>({
  resolveUrl: () => undefined,
  repository: undefined,
});

const useSlugger = () => {
  const context = useContext(SluggerContext);
  if (!context) throw new Error('SluggerContext not found');
  return context;
};

const useHeadingRegistry = () => useContext(HeadingContext);
const useAssetContext = () => useContext(AssetContext);

const getNodeText = (node?: Parent | Literal): string => {
  if (!node) return '';
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => getNodeText(child as Parent | Literal)).join('');
  }
  return '';
};

const extractTextFromChildren = (children: ReactNode): string => {
  const nodes = Children.toArray(children);
  return nodes
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'number') return child.toString();
      if (child === null || child === undefined) return '';
      if (typeof child === 'boolean') return '';
      if (child && typeof child === 'object' && 'props' in child) {
        return extractTextFromChildren((child as { props?: { children?: ReactNode } }).props?.children);
      }
      return '';
    })
    .join('');
};

const HeadingAnchor = ({ id }: { id: string }) => (
  <a
    aria-label="Link to heading"
    href={`#${id}`}
    className="absolute -left-6 flex h-full items-center opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
  >
    <Hash className="h-4 w-4 text-white/40" aria-hidden="true" />
  </a>
);

const headingStyles: Record<number, string> = {
  1: 'text-3xl md:text-4xl font-bold text-white mt-12 mb-6 leading-tight',
  2: 'text-2xl md:text-3xl font-semibold text-white mt-10 mb-5 leading-tight border-b border-white/10 pb-3',
  3: 'text-xl md:text-2xl font-semibold text-white mt-8 mb-4 leading-tight',
  4: 'text-lg md:text-xl font-semibold text-white mt-6 mb-3 leading-tight',
  5: 'text-base md:text-lg font-semibold text-white mt-4 mb-2 leading-tight',
  6: 'text-base font-semibold text-white mt-4 mb-2 leading-tight uppercase tracking-wide',
};

const HeadingRenderer = ({
  level,
  node,
  children,
}: {
  level: number;
  node?: Heading;
  children: ReactNode;
}) => {
  const Tag = (`h${level}` as const);
  const slugger = useSlugger();
  const { registerHeading, tocDepth } = useHeadingRegistry();
  const text = node ? getNodeText(node) : extractTextFromChildren(children);
  const id = slugger.slug(text);
  const position = node?.position?.start?.offset ?? Number.MAX_SAFE_INTEGER;

  useEffect(() => {
    if (level <= (tocDepth ?? 6)) {
      registerHeading({ id, level, text, position });
    }
  }, [id, level, position, registerHeading, text, tocDepth]);

  return (
    <Tag id={id} className={clsx('group relative scroll-mt-24', headingStyles[level])}>
      <HeadingAnchor id={id} />
      {children}
    </Tag>
  );
};

const LinkRenderer = ({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { resolveUrl } = useAssetContext();
  const resolved = resolveUrl(href);
  const origin =
    typeof window !== 'undefined' && window.location ? window.location.origin : undefined;
  const isExternal =
    resolved && origin ? isAbsoluteUrl(resolved) && !resolved.startsWith(origin) : false;

  return (
    <a
      href={resolved}
      className="inline-flex items-center gap-1 text-blue-400 underline decoration-blue-400/40 transition-colors hover:text-blue-200 hover:decoration-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      target={undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

const ImageRenderer = ({
  alt,
  src,
  title,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => {
  const { resolveUrl } = useAssetContext();
  const resolved = resolveUrl(src);

  return (
    <figure className="my-10">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/50">
        <img
          src={resolved}
          alt={alt || ''}
          title={title}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          className="h-auto w-full object-cover"
          {...props}
        />
      </div>
      {(alt || title) && (
        <figcaption className="mt-3 text-center text-sm text-white/60">
          {title ?? alt}
        </figcaption>
      )}
    </figure>
  );
};

const VideoRenderer = ({
  src,
  poster,
  children,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement>) => {
  const { resolveUrl } = useAssetContext();
  const resolved = resolveUrl(src);

  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
        <video
          controls
          preload="metadata"
          src={resolved}
          poster={poster ? resolveUrl(poster) : undefined}
          className="h-auto w-full"
          {...props}
        >
          {children}
        </video>
      </div>
      {poster && (
        <figcaption className="mt-2 text-center text-sm text-white/50">
          Video preview available
        </figcaption>
      )}
    </figure>
  );
};

const FootnoteReferenceRenderer = ({
  identifier,
}: FootnoteReference & { children: ReactNode }) => (
  <sup id={`fnref-${identifier}`}>
    <a
      href={`#fn-${identifier}`}
      className="rounded px-1 text-xs font-semibold text-blue-300 no-underline hover:bg-blue-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      {identifier}
    </a>
  </sup>
);

const FootnoteDefinitionRenderer = ({
  identifier,
  children,
}: FootnoteDefinition & { children: ReactNode }) => (
  <li
    id={`fn-${identifier}`}
    className="mb-3 text-sm text-white/70"
  >
    <div className="flex gap-2">
      <span className="font-semibold text-white/50">{identifier}.</span>
      <div className="flex-1">{children}</div>
    </div>
    <a
      href={`#fnref-${identifier}`}
      className="mt-2 inline-block text-xs text-blue-300 underline hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      Back to content
    </a>
  </li>
);

const FootnotesContainer = ({ children }: { children: ReactNode }) => (
  <section
    data-footnotes
    className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6 text-white"
    aria-label="Footnotes"
  >
    <h2 className="sr-only">Footnotes</h2>
    <ol className="list-decimal pl-6">{children}</ol>
  </section>
);

const absoluteVideoExtensions = new Set(['.mp4', '.webm', '.ogg', '.mov']);

const resolveMediaType = (src?: string | null) => {
  if (!src) return 'image';
  const lower = src.toLowerCase();
  for (const ext of absoluteVideoExtensions) {
    if (lower.endsWith(ext)) return 'video';
  }
  return 'image';
};

const OrderedList = ({ className, children, start, ...props }: OlHTMLAttributes<HTMLOListElement>) => (
  <ol
    className={clsx(
      'mb-6 ml-6 list-decimal space-y-2 text-base leading-7 text-white/80 marker:text-white/40',
      className
    )}
    start={start}
    {...props}
  >
    {children}
  </ol>
);

const UnorderedList = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={clsx(
      'mb-6 ml-6 list-disc space-y-2 text-base leading-7 text-white/80 marker:text-white/40',
      className
    )}
    {...props}
  >
    {children}
  </ul>
);

const useActiveHeading = (headings: HeadingEntry[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
};

const Toc = ({
  headings,
  activeId,
}: {
  headings: HeadingEntry[];
  activeId: string | null;
}) => (
  <nav
    aria-label="Table of contents"
    className="sticky top-24 hidden max-h-[70vh] min-w-[220px] overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-4 lg:block"
  >
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/60">On this page</h2>
    <ul className="space-y-2 text-sm">
      {headings.map((heading) => (
        <li key={heading.id} className={clsx(
          heading.level === 3 && 'pl-4',
          heading.level === 4 && 'pl-6'
        )}>
          <a
            href={`#${heading.id}`}
            className={clsx(
              'block rounded px-2 py-1 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              activeId === heading.id && 'bg-blue-500/20 text-white'
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export const GfmMarkdown = ({
  source,
  className,
  baseUrl,
  repository,
  config,
}: GfmMarkdownProps) => {
  const mergedConfig = { ...defaultConfig, ...(config ?? {}) };
  const [headings, setHeadings] = useState<HeadingEntry[]>([]);

  const slugger = useMemo(() => new GithubSlugger(), []);

  useEffect(() => {
    slugger.reset();
  }, [slugger, source]);

  const repositorySlug = useMemo(() => {
    if (repository?.owner && repository?.name) {
      return `${repository.owner}/${repository.name}`;
    }

    const possibleBase = repository?.baseUrl ?? baseUrl;
    if (possibleBase) {
      try {
        const url = new URL(possibleBase);
        const [, owner, name] = url.pathname.split('/');
        if (owner && name) {
          return `${owner}/${name}`;
        }
      } catch {
        // ignore invalid base URLs
      }
    }

    return undefined;
  }, [repository, baseUrl]);

  const remarkPlugins = useMemo<PluggableList>(() => {
    const plugins: PluggableList = [remarkGfm];
    if (mergedConfig.enableMath) {
      plugins.push(remarkMath);
    }
    if (repositorySlug) {
      plugins.push([
        remarkGithub,
        {
          repository: repositorySlug,
        },
      ]);
    }
    return plugins;
  }, [mergedConfig.enableMath, repositorySlug]);

  const rehypePlugins = useMemo<PluggableList>(() => {
    const plugins: PluggableList = [rehypeRaw];
    if (mergedConfig.sanitizeHtml) {
      plugins.push([rehypeSanitize, mathSchemaExtensions]);
    }
    return plugins;
  }, [mergedConfig.sanitizeHtml]);

  const registerHeading = useCallback((heading: HeadingEntry) => {
    setHeadings((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === heading.id);
      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex] = heading;
        return next.sort((a, b) => a.position - b.position);
      }
      return [...prev, heading].sort((a, b) => a.position - b.position);
    });
  }, []);

  const resolveUrl = useCallback(
    (href?: string | null) => {
      if (!href) return undefined;
      if (href.startsWith('#')) return href;
      if (isAbsoluteUrl(href)) return href;

      const base = repository?.baseUrl ?? baseUrl;
      if (base) {
        try {
          const url = new URL(href, base);
          return url.toString();
        } catch {
          return href;
        }
      }

      return href;
    },
    [baseUrl, repository?.baseUrl]
  );

  const filteredHeadings = useMemo(
    () =>
      headings.filter(
        (heading) => heading.level >= 2 && heading.level <= mergedConfig.tocDepth
      ),
    [headings, mergedConfig.tocDepth]
  );

  const activeHeading = useActiveHeading(filteredHeadings);

  const components = useMemo<Components>(() => {
    const mapping = {
      h1: (props) => <HeadingRenderer level={1} {...props} />,
      h2: (props) => <HeadingRenderer level={2} {...props} />,
      h3: (props) => <HeadingRenderer level={3} {...props} />,
      h4: (props) => <HeadingRenderer level={4} {...props} />,
      h5: (props) => <HeadingRenderer level={5} {...props} />,
      h6: (props) => <HeadingRenderer level={6} {...props} />,
      p: Paragraph,
      blockquote: Blockquote,
      hr: ThematicBreak,
      ul: UnorderedList,
      ol: OrderedList,
      li: ({ checked, children, ...props }) => (
        <ListItem checked={checked} {...props}>
          {children}
        </ListItem>
      ),
      table: Table,
      thead: TableHead,
      tbody: TableBody,
      th: TableHeaderCell,
      td: TableCell,
      code: ({ inline, className, children, node }) => {
        const nodeType = (node as { type?: string } | undefined)?.type;
        const isBlockCode = nodeType === 'code';

        if (!isBlockCode || inline) {
          return <InlineCode>{children}</InlineCode>;
        }
        const language = className?.replace(/language-/, '') ?? '';
        const meta = (node && 'data' in node && (node.data as { meta?: string })?.meta) || undefined;
        const codeString = String(children ?? '');

        if (mergedConfig.enableMermaid && language === 'mermaid') {
          return (
            <MermaidBlock code={codeString} maxDiagramSizeKB={mergedConfig.maxDiagramSizeKB} />
          );
        }

        return <CodeBlock code={codeString} language={language} meta={meta} />;
      },
      a: LinkRenderer,
      img: (props) =>
        resolveMediaType(props.src) === 'video' ? (
          <VideoRenderer {...(props as React.VideoHTMLAttributes<HTMLVideoElement>)} />
        ) : (
          <ImageRenderer {...props} />
        ),
      math: ({ value }) =>
        mergedConfig.enableMath ? <MathRenderer value={value ?? ''} /> : <code>{value}</code>,
      inlineMath: ({ value }) =>
        mergedConfig.enableMath ? <MathRenderer value={value ?? ''} inline /> : <code>{value}</code>,
      footnoteReference: (props) => <FootnoteReferenceRenderer {...props} />,
      footnoteDefinition: (props) => <FootnoteDefinitionRenderer {...props} />,
      footnoteLabel: ({ children }) => (
        <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
          {children}
        </span>
      ),
      footnoteBackref: ({ href }) => (
        <a
          href={href}
          className="text-xs text-blue-300 underline hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Back
        </a>
      ),
      footnote: FootnotesContainer,
    } as Components;

    return mapping;
  }, [
    mergedConfig.enableMath,
    mergedConfig.enableMermaid,
    mergedConfig.maxDiagramSizeKB,
  ]);

  const content = (
    <section className={clsx('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </section>
  );

  return (
    <SluggerContext.Provider value={slugger}>
      <HeadingContext.Provider value={{ registerHeading, tocDepth: mergedConfig.tocDepth }}>
        <AssetContext.Provider value={{ resolveUrl, repository }}>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">{content}</div>
            {mergedConfig.showToc && filteredHeadings.length > 0 && (
              <Toc headings={filteredHeadings} activeId={activeHeading} />
            )}
          </div>
        </AssetContext.Provider>
      </HeadingContext.Provider>
    </SluggerContext.Provider>
  );
};

export type { GfmMarkdownProps, MarkdownConfig, RepositoryContext };
