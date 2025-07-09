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
        const response = await fetch('https://mpkgugcasxpanhrkpkhs.supabase.co/functions/v1/spotify-now-playing');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: SpotifyData = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
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
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Spotify data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-900/50 rounded-lg shadow-lg text-red-300">
        Error loading Spotify data: {error}
      </div>
    );
  }

  if (!data || !data.isPlaying) {
    return (
      <div className="flex items-center p-4 bg-white/5 rounded-lg shadow-lg text-white/80">
        <Music className="w-5 h-5 mr-3" /> Not currently listening to Spotify.
      </div>
    );
  }

  return (
    <a
      href={data.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center p-4 bg-white/5 rounded-lg shadow-lg transition-all duration-300 hover:bg-white/10 group"
    >
      {data.albumImageUrl && (
        <img
          src={data.albumImageUrl}
          alt={data.album}
          className="w-16 h-16 rounded-md mr-4 shadow-md"
        />
      )}
      <div className="flex-1">
        <p className="text-white font-semibold text-lg group-hover:text-green-400 transition-colors duration-300">
          {data.title}
        </p>
        <p className="text-white/70 text-sm">
          {data.artist} &bull; {data.album}
        </p>
      </div>
      <Music className="w-6 h-6 text-white/60 ml-4 group-hover:text-green-400 transition-colors duration-300" />
    </a>
  );
};

export default SpotifyNowPlaying;
