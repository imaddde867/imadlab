import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SPOTIFY_CLIENT_ID = Deno.env.get("SPOTIFY_CLIENT_ID");
const SPOTIFY_CLIENT_SECRET = Deno.env.get("SPOTIFY_CLIENT_SECRET");
const SPOTIFY_REFRESH_TOKEN = Deno.env.get("SPOTIFY_REFRESH_TOKEN");

// Validate environment variables
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  serve((_req) =>
    new Response(
      JSON.stringify({
        error: "Missing Spotify environment variables. Please check SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN.",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://imadlab.me",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        status: 500,
      }
    )
  );
  // Exit early if env vars are missing
  throw new Error("Missing Spotify environment variables");
}

const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

async function getAccessToken() {
  const basic = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN || "",
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getNowPlaying() {
  const { access_token } = await getAccessToken();
  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  return res;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      status: 204,
    });
  }

  try {
    const song = await getNowPlaying();

    if (song.status === 204 || song.status > 400) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
          "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
          "Vary": "Origin",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        status: 200,
      });
    }

    const songData = await song.json();

    const data = {
      isPlaying: songData.is_playing,
      title: songData.item?.name,
      artist: songData.item?.artists?.map((a: { name: string }) => a.name).join(", "),
      album: songData.item?.album?.name,
      albumImageUrl: songData.item?.album?.images?.[0]?.url,
      songUrl: songData.item?.external_urls?.spotify,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
          "Vary": "Origin",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        status: 500,
      }
    );
  }
});
