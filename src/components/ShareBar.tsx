import { useMemo, useState } from 'react';
import { Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type ShareBarProps = {
  title: string;
  url?: string;
  className?: string;
};

const getShareUrl = (override?: string) => {
  if (override) return override;
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
};

const withUtm = (baseUrl: string, utm: Record<string, string>) => {
  try {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(utm)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
};

const ShareBar = ({ title, url, className }: ShareBarProps) => {
  const shareUrl = useMemo(() => getShareUrl(url), [url]);
  const [isCopying, setIsCopying] = useState(false);

  const linkedInTargetUrl = useMemo(() => {
    if (!shareUrl) return '';
    return withUtm(shareUrl, {
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'share',
      utm_content: 'sharebar',
    });
  }, [shareUrl]);

  const twitterTargetUrl = useMemo(() => {
    if (!shareUrl) return '';
    return withUtm(shareUrl, {
      utm_source: 'x',
      utm_medium: 'social',
      utm_campaign: 'share',
      utm_content: 'sharebar',
    });
  }, [shareUrl]);

  const linkedInUrl = useMemo(() => {
    if (!linkedInTargetUrl) return '';
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedInTargetUrl)}`;
  }, [linkedInTargetUrl]);

  const twitterUrl = useMemo(() => {
    if (!twitterTargetUrl) return '';
    const message = `${title}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(twitterTargetUrl)}`;
  }, [title, twitterTargetUrl]);

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link copied', description: 'Share it anywhere.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Your browser blocked clipboard access.' });
    } finally {
      setIsCopying(false);
    }
  };

  const nativeShare = async () => {
    if (!canNativeShare || !shareUrl) return;
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      // ignore user cancellation
    }
  };

  if (!shareUrl) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10"
          onClick={copyLink}
          disabled={isCopying}
        >
          <Link2 className="w-4 h-4 mr-2" />
          Copy link
        </Button>

        {canNativeShare && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10"
            onClick={nativeShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}

        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          LinkedIn
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          X
        </a>
      </div>
    </div>
  );
};

export default ShareBar;
