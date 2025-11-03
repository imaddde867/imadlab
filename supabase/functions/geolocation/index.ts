import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id } = await req.json()

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try to get geolocation data from Cloudflare headers
    // These headers are automatically added by Cloudflare when deployed
    const country = req.headers.get('CF-IPCountry') || null
    const city = req.headers.get('CF-IPCity') || null
    const region = req.headers.get('CF-Region') || null
    const _latitude = req.headers.get('CF-Latitude') || null
    const _longitude = req.headers.get('CF-Longitude') || null

    // Alternative: Use ip-api.com for geolocation if not on Cloudflare
    let geoData = {
      country,
      city,
      region,
    }

    // If we don't have location data from headers, try to fetch from IP
    if (!country) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') ||
                 'unknown'
      
      if (ip && ip !== 'unknown') {
        try {
          const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`)
          if (geoResponse.ok) {
            const data = await geoResponse.json()
            if (data.status === 'success') {
              geoData = {
                country: data.country,
                region: data.regionName,
                city: data.city,
              }
            }
          }
        } catch (error) {
          console.error('Error fetching geolocation:', error)
        }
      }
    }

    // Update the visitor session with geolocation data
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { error: updateError } = await supabaseClient
      .from('visitor_sessions')
      .update({
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
      })
      .eq('session_id', session_id)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Also update recent page views for this session
    const { error: viewsError } = await supabaseClient
      .from('page_views')
      .update({
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
      })
      .eq('session_id', session_id)
      .is('country', null) // Only update if not already set

    if (viewsError) {
      console.error('Error updating page views:', viewsError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        location: geoData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in geolocation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
