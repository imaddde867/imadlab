import React, { useEffect, useState } from 'react';
import { Music, Loader2 } from 'lucide-react';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

const SpotifyNowPlaying: React.FC = () => {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        const response = await fetch(
          'https://mpkgugcasxpanhrkpkhs.supabase.co/functions/v1/spotify-now-playing'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: SpotifyData = await response.json();
        setData(result);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
    const interval = setInterval(fetchSpotifyData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg shadow-lg text-white/80">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Checking what I&apos;m listening to on Spotify...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-900/50 rounded-lg shadow-lg text-red-300">
        Could not load Spotify status.
      </div>
    );
  }

  if (!data || !data.isPlaying) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg shadow-lg text-white/80">
        <span className="flex items-center justify-center w-10 h-10 mr-2">
          <Music className="w-7 h-7 text-green-400/80" />
        </span>
        <span>
          <span className="font-semibold text-white">Not listening to anything</span>
          <br className="hidden md:block" />
          <span className="text-white/40 text-xs block mt-1">
            Live Spotify status - check back to see what I'm vibing to
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-lg shadow-lg transition-all duration-300 hover:bg-white/10 group">
      <span className="text-white/60 text-xs mb-1">Right now I&apos;m listening to</span>
      <a
        href={data.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 group"
      >
        {data.albumImageUrl && (
          <img
            src={data.albumImageUrl}
            alt={data.album}
            width="64"
            height="64"
            loading="lazy"
            decoding="async"
            className="w-16 h-16 rounded-md shadow-md border border-white/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-lg truncate group-hover:text-green-400 transition-colors duration-300">
            {data.title}
          </p>
          <p className="text-white/70 text-sm truncate">
            {data.artist} &bull; {data.album}
          </p>
        </div>
        <Music className="w-6 h-6 text-green-400 ml-4 animate-pulse" />
      </a>
    </div>
  );
};

export default SpotifyNowPlaying;
