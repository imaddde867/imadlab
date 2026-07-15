import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenResponse {
  access_token: string;
  expires_at: number;
  refresh_token: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID');
    const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET');
    const STRAVA_REFRESH_TOKEN = Deno.env.get('STRAVA_REFRESH_TOKEN');

    console.log('Strava credentials check:', {
      hasClientId: !!STRAVA_CLIENT_ID,
      hasClientSecret: !!STRAVA_CLIENT_SECRET,
      hasRefreshToken: !!STRAVA_REFRESH_TOKEN,
    });

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
      const missing = [];
      if (!STRAVA_CLIENT_ID) missing.push('STRAVA_CLIENT_ID');
      if (!STRAVA_CLIENT_SECRET) missing.push('STRAVA_CLIENT_SECRET');
      if (!STRAVA_REFRESH_TOKEN) missing.push('STRAVA_REFRESH_TOKEN');
      throw new Error(`Missing Strava credentials: ${missing.join(', ')}`);
    }

    // Get access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: STRAVA_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh failed:', tokenResponse.status, errorText);
      throw new Error(`Failed to refresh Strava token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData: TokenResponse = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get athlete info
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!athleteResponse.ok) {
      const errorText = await athleteResponse.text();
      console.error('Athlete fetch failed:', athleteResponse.status, errorText);
      throw new Error(`Failed to fetch athlete data: ${athleteResponse.status}`);
    }

    const athlete = await athleteResponse.json();

    // Get stats and activities in parallel
    const [statsResponse, activitiesResponse] = await Promise.all([
      fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      console.error('Stats fetch failed:', statsResponse.status, errorText);
      throw new Error(`Failed to fetch stats: ${statsResponse.status}`);
    }

    if (!activitiesResponse.ok) {
      const errorText = await activitiesResponse.text();
      console.error('Activities fetch failed:', activitiesResponse.status, errorText);
      throw new Error(`Failed to fetch activities: ${activitiesResponse.status}`);
    }

    const [stats, activities] = await Promise.all([
      statsResponse.json(),
      activitiesResponse.json(),
    ]);

    console.log('Successfully fetched Strava data:', {
      statsKeys: Object.keys(stats),
      activitiesCount: activities.length,
    });

    const publicStats = {
      all_run_totals: stats.all_run_totals
        ? {
            count: stats.all_run_totals.count,
            distance: stats.all_run_totals.distance,
            moving_time: stats.all_run_totals.moving_time,
            elapsed_time: stats.all_run_totals.elapsed_time,
            elevation_gain: stats.all_run_totals.elevation_gain,
          }
        : undefined,
      ytd_run_totals: stats.ytd_run_totals
        ? {
            count: stats.ytd_run_totals.count,
            distance: stats.ytd_run_totals.distance,
            moving_time: stats.ytd_run_totals.moving_time,
          }
        : undefined,
    };

    const publicActivities = (Array.isArray(activities) ? activities : [])
      .slice(0, 10)
      .map((a: Record<string, unknown>) => ({
        id: a.id,
        name: a.name,
        distance: a.distance,
        moving_time: a.moving_time,
        elapsed_time: a.elapsed_time,
        total_elevation_gain: a.total_elevation_gain,
        type: a.type,
        start_date: a.start_date,
        average_speed: a.average_speed,
        max_speed: a.max_speed,
        kudos_count: a.kudos_count,
        achievement_count: a.achievement_count,
      }));

    return new Response(
      JSON.stringify({ stats: publicStats, activities: publicActivities }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Strava proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
